from django.db.models import ProtectedError
from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler


class BusinessRuleError(APIException):
    """
    Regla de negocio incumplida (sin stock, carrito vacío, por debajo del mínimo…).

    Se distingue de un error de validación de campos: el dato que envió el cliente es
    formalmente correcto, pero la operación no puede completarse. `details` lleva el
    contexto que el frontend necesita para explicarlo (p. ej. qué artículos faltan).
    """

    status_code = status.HTTP_409_CONFLICT
    default_detail = "La operación no puede completarse."
    default_code = "business_rule_error"

    def __init__(self, detail=None, code=None, details=None):
        super().__init__(detail, code)
        self.details = details or {}


def api_exception_handler(exc, context):
    """Uniform error envelope: {"error": {"code", "message", "details"}}."""
    if isinstance(exc, ProtectedError):
        # on_delete=PROTECT (Family, Category.parent, Product.collection, MediaAsset vía
        # ProductImage.asset...) revienta con un ProtectedError que DRF no sabe traducir
        # — sin esto sería un 500 crudo en vez de un 409 explicando qué lo bloquea.
        protected = [str(obj) for obj in list(exc.protected_objects)[:10]]
        exc = BusinessRuleError(
            "No se puede borrar: hay otros registros que dependen de esto.",
            code="protected",
            details={"protected_objects": protected},
        )
    response = exception_handler(exc, context)
    if response is None:
        return None

    detail = response.data
    message = detail.get("detail") if isinstance(detail, dict) else None

    extra = exc.details if isinstance(exc, BusinessRuleError) else ({} if message else detail)

    # `message` es un ErrorDetail y lleva el código concreto con el que se lanzó la
    # excepción, que es más específico que el default_code de la clase.
    code = getattr(message, "code", None) or getattr(exc, "default_code", "error")

    response.data = {
        "error": {
            "code": code,
            "message": str(message) if message else "Request failed.",
            "details": extra,
        }
    }
    return response
