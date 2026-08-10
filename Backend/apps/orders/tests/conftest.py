from decimal import Decimal

import pytest

from apps.catalog.models import Color, Colorway, Family, Product, Size, Variant


@pytest.fixture
def variant(db):
    """Una variante vendible con 5 unidades a 200 € sin IVA (242 € con IVA)."""
    family = Family.objects.create(code="VE", name="Vestidos", slug="vestidos")
    product = Product.objects.create(
        family=family,
        design_code="120",
        name="Vestido Aria",
        price=Decimal("200.00"),
        is_published=True,
    )
    colorway = Colorway.objects.create(
        product=product, color=Color.objects.create(code="ROJ", name="Rojo")
    )
    return Variant.objects.create(colorway=colorway, size=Size.objects.create(code="38"), stock=5)


@pytest.fixture
def checkout_data():
    return {
        "email": "clienta@example.com",
        "phone": "600000000",
        "shipping_recipient": "Ana García",
        "shipping_line1": "Calle Mayor 1",
        "shipping_line2": "",
        "shipping_postal_code": "28013",
        "shipping_city": "Madrid",
        "shipping_province": "Madrid",
        "customer_note": "",
        "invoice_requested": False,
        "billing_name": "",
        "billing_tax_id": "",
        "billing_address": "",
    }
