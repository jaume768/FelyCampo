"""
Interfaz vacía para Calendly. Uso previsto: webhooks de cancelación y reprogramación.

Fase 0: solo el contrato. Sin endpoint de webhook ni verificación de firma todavía;
el modelo de cita vive en la app `appointments` y está pendiente de decisiones.
"""

from typing import Protocol


class CalendlyWebhookVerifier(Protocol):
    def verify(self, *, payload: bytes, signature: str) -> dict:
        """Verifica la firma del webhook de Calendly y devuelve el evento. Sin implementar."""
        ...
