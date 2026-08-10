"""
Pagos con tarjeta vía Stripe. Se cobra el **100%** del pedido en el checkout: no hay
señales ni pagos parciales.

La librería `stripe` se importa de forma perezosa para que el proyecto siga arrancando (y
los tests sigan pasando) sin clave configurada.
"""

from decimal import Decimal
from typing import Protocol

from django.conf import settings


class PaymentGateway(Protocol):
    def create_payment_intent(self, *, amount: int, currency: str, metadata: dict) -> dict: ...

    def verify_webhook(self, *, payload: bytes, signature: str) -> dict: ...


def to_minor_units(amount: Decimal) -> int:
    """Stripe cobra en céntimos: 242.00 € → 24200."""
    return int((amount * 100).to_integral_value())


def _client():
    import stripe

    stripe.api_key = settings.STRIPE_SECRET_KEY
    return stripe


class StripeGateway:
    def create_payment_intent(self, *, amount: int, currency: str, metadata: dict) -> dict:
        intent = _client().PaymentIntent.create(
            amount=amount,
            currency=currency.lower(),
            metadata=metadata,
            automatic_payment_methods={"enabled": True},
        )
        return {"id": intent["id"], "client_secret": intent["client_secret"]}

    def verify_webhook(self, *, payload: bytes, signature: str) -> dict:
        """
        Verifica la firma. Si falla, `stripe` lanza y la vista responde 400: nunca se
        confirma un pedido a partir de un webhook no verificado.
        """
        return _client().Webhook.construct_event(payload, signature, settings.STRIPE_WEBHOOK_SECRET)


def get_gateway() -> PaymentGateway:
    return StripeGateway()
