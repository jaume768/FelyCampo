"""
Cálculo de IVA. Los precios se almacenan **sin IVA** (el cliente facilita el PVP sin
impuesto) y el 21% se añade aquí. Un único punto de verdad para que pedidos y catálogo
no diverjan.
"""

from decimal import ROUND_HALF_UP, Decimal

from django.conf import settings

CENT = Decimal("0.01")


def vat_rate() -> Decimal:
    return Decimal(str(settings.VAT_RATE))


def round_money(amount: Decimal) -> Decimal:
    """Redondeo a céntimo, HALF_UP (el criterio contable habitual en España)."""
    return amount.quantize(CENT, rounding=ROUND_HALF_UP)


def vat_amount(net: Decimal) -> Decimal:
    return round_money(net * vat_rate())


def gross(net: Decimal) -> Decimal:
    """Precio con IVA a partir del precio sin IVA."""
    return round_money(net + vat_amount(net))
