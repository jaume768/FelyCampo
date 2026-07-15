from rest_framework.views import exception_handler


def api_exception_handler(exc, context):
    """Uniform error envelope: {"error": {"code", "message", "details"}}."""
    response = exception_handler(exc, context)
    if response is None:
        return None

    detail = response.data
    message = detail.get("detail") if isinstance(detail, dict) else None

    response.data = {
        "error": {
            "code": getattr(exc, "default_code", "error"),
            "message": str(message) if message else "Request failed.",
            "details": {} if message else detail,
        }
    }
    return response
