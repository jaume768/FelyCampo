from decimal import Decimal

import pytest
from django.db import IntegrityError, transaction

from apps.catalog.models import Color, Colorway, Family, Product, SaleMode, Size, Variant
from apps.catalog.pricing import gross, vat_amount


@pytest.fixture
def family(db):
    return Family.objects.create(code="VE", name="Vestidos", slug="vestidos")


@pytest.fixture
def color(db):
    return Color.objects.create(code="ROJ", name="Rojo")


@pytest.fixture
def size(db):
    return Size.objects.create(code="38", position=2)


@pytest.fixture
def product(family):
    return Product.objects.create(
        family=family, design_code="120", name="Vestido Aria", price=Decimal("200.00")
    )


def test_sku_autogenerado_desde_familia_diseno_y_color(product, color):
    colorway = Colorway.objects.create(product=product, color=color)

    assert colorway.sku == "VE-120-ROJ"  # la talla no entra en el código


def test_sku_manual_se_respeta_para_importar_el_catalogo_existente(product, color):
    colorway = Colorway.objects.create(product=product, color=color, sku="LEGACY-0001")

    assert colorway.sku == "LEGACY-0001"


def test_slug_se_genera_al_guardar(product):
    assert product.slug == "vestido-aria-ve-120"


def test_disponibilidad_descuenta_las_reservas(product, color, size):
    colorway = Colorway.objects.create(product=product, color=color)
    variant = Variant.objects.create(colorway=colorway, size=size, stock=5, reserved=2)

    assert variant.available == 3
    assert variant.in_stock is True


def test_variante_sin_disponibilidad_no_esta_en_stock(product, color, size):
    colorway = Colorway.objects.create(product=product, color=color)
    variant = Variant.objects.create(colorway=colorway, size=size, stock=2, reserved=2)

    assert variant.available == 0
    assert variant.in_stock is False


def test_no_se_puede_reservar_mas_de_lo_que_hay(product, color, size):
    colorway = Colorway.objects.create(product=product, color=color)

    with pytest.raises(IntegrityError), transaction.atomic():
        Variant.objects.create(colorway=colorway, size=size, stock=1, reserved=2)


def test_precio_rebajado_manda_sobre_el_precio_base(product):
    product.sale_price = Decimal("150.00")

    assert product.effective_price == Decimal("150.00")
    assert product.is_purchasable is True


def test_producto_solo_consulta_no_lleva_precio_ni_es_comprable(family):
    product = Product.objects.create(
        family=family,
        design_code="900",
        name="Novia a medida",
        sale_mode=SaleMode.ON_REQUEST,
    )

    assert product.price is None
    assert product.is_purchasable is False


def test_producto_vendible_exige_precio(family):
    with pytest.raises(IntegrityError), transaction.atomic():
        Product.objects.create(
            family=family, design_code="901", name="Sin precio", sale_mode=SaleMode.IN_STOCK
        )


def test_iva_se_anade_sobre_el_precio_sin_impuesto():
    assert vat_amount(Decimal("200.00")) == Decimal("42.00")
    assert gross(Decimal("200.00")) == Decimal("242.00")


def test_iva_redondea_a_centimo_half_up():
    # 33.33 * 0.21 = 6.9993 → 7.00
    assert vat_amount(Decimal("33.33")) == Decimal("7.00")
    assert gross(Decimal("33.33")) == Decimal("40.33")
