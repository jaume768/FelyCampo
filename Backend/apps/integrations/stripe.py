"""
Interfaz vacía para pagos con tarjeta vía Stripe (B2C, Península).

Fase 0: solo el contrato. Sin PaymentIntents, sin webhooks, sin llamadas reales.
La implementación llegará cuando estén cerradas las reglas de checkout/IVA/pedido.
"""

from typing import Protocol


class PaymentGateway(Protocol):
    def create_payment_intent(self, *, amount: int, currency: str, metadata: dict) -> str:
        """Devuelve el client_secret del PaymentIntent. Sin implementar en Fase 0."""
        ...

    def verify_webhook(self, *, payload: bytes, signature: str) -> dict:
        """Verifica la firma del webhook y devuelve el evento. Sin implementar en Fase 0."""
        ...
