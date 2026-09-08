"""
Interfaz vacía para correo transaccional vía Brevo. Plantillas: Miriam.

Fase 0: solo el contrato. No se envían correos reales (en dev el backend es consola).
"""

from typing import Protocol


class TransactionalEmail(Protocol):
    def send(self, *, template_id: int, to: str, params: dict) -> None:
        """Envía un correo transaccional por plantilla. Sin implementar en Fase 0."""
        ...
