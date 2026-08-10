"""
Modelo de catálogo en tres niveles, según lo cerrado en DECISIONS_PENDING.md:

    Product   familia + diseño (modelo). Precio y modo de venta.
      └ Colorway   un color. **Dueño del SKU** (la talla no entra en el código).
          └ Variant   una talla. **Dueña del stock**.

Colores y tallas son catálogos globales reutilizables. Los precios se guardan **sin IVA**;
el 21% se aplica al calcular (ver `apps.catalog.pricing`).
"""

from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _

from apps.core.models import UUIDTimeStampedModel


class SaleMode(models.TextChoices):
    """Cómo se vende un producto. Ver DECISIONS_PENDING.md → Modos de venta."""

    IN_STOCK = "in_stock", _("Disponible en stock")
    ON_REQUEST = "on_request", _("Solo consulta (sin precio)")
    MADE_TO_ORDER = "made_to_order", _("Bajo encargo")


class ProductKind(models.TextChoices):
    SIMPLE = "simple", _("Prenda")
    BUNDLE = "bundle", _("Conjunto")


class Family(UUIDTimeStampedModel):
    """Familia de producto. Primer segmento del SKU."""

    code = models.CharField(_("código"), max_length=8, unique=True)
    name = models.CharField(_("nombre"), max_length=120)
    name_en = models.CharField(_("nombre (EN)"), max_length=120, blank=True)
    slug = models.SlugField(_("slug"), max_length=140, unique=True)
    is_active = models.BooleanField(_("activa"), default=True)

    class Meta:
        verbose_name = _("familia")
        verbose_name_plural = _("familias")
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.code} · {self.name}"


class Category(UUIDTimeStampedModel):
    """
    Eje de navegación jerárquico (novia, fiesta, outlet…), independiente de la familia.
    El árbol real está pendiente de validar con el cliente.
    """

    parent = models.ForeignKey(
        "self",
        verbose_name=_("categoría padre"),
        on_delete=models.PROTECT,
        related_name="children",
        null=True,
        blank=True,
    )
    name = models.CharField(_("nombre"), max_length=120)
    name_en = models.CharField(_("nombre (EN)"), max_length=120, blank=True)
    slug = models.SlugField(_("slug"), max_length=140, unique=True)
    position = models.PositiveSmallIntegerField(_("orden"), default=0)
    is_active = models.BooleanField(_("activa"), default=True)

    class Meta:
        verbose_name = _("categoría")
        verbose_name_plural = _("categorías")
        ordering = ["position", "name"]

    def __str__(self) -> str:
        return self.name


class Color(UUIDTimeStampedModel):
    """Catálogo global de colores. Tercer segmento del SKU."""

    code = models.CharField(_("código"), max_length=8, unique=True)
    name = models.CharField(_("nombre"), max_length=80)
    name_en = models.CharField(_("nombre (EN)"), max_length=80, blank=True)
    hex_value = models.CharField(
        _("color hexadecimal"),
        max_length=7,
        blank=True,
        help_text=_("Para la muestra en el frontend, p. ej. #C41E3A."),
    )

    class Meta:
        verbose_name = _("color")
        verbose_name_plural = _("colores")
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Size(UUIDTimeStampedModel):
    """
    Talla. Lista **cerrada y común** a todo el catálogo: no se crean tallas por familia.
    No forma parte del SKU, pero sí es el nivel donde vive el stock.
    """

    code = models.CharField(_("talla"), max_length=8, unique=True)
    position = models.PositiveSmallIntegerField(_("orden"), default=0)
    is_active = models.BooleanField(_("activa"), default=True)

    class Meta:
        verbose_name = _("talla")
        verbose_name_plural = _("tallas")
        ordering = ["position", "code"]

    def __str__(self) -> str:
        return self.code


class Product(UUIDTimeStampedModel):
    """
    Un diseño dentro de una familia. No es vendible por sí mismo: lo vendible es la
    `Variant` (colorway + talla).

    Precios **sin IVA**. `price` es nulo cuando `sale_mode = ON_REQUEST` (productos a
    consultar por email, que no muestran precio).
    """

    family = models.ForeignKey(
        Family,
        verbose_name=_("familia"),
        on_delete=models.PROTECT,
        related_name="products",
    )
    categories = models.ManyToManyField(
        Category,
        verbose_name=_("categorías"),
        related_name="products",
        blank=True,
    )
    design_code = models.CharField(
        _("número de diseño"),
        max_length=16,
        help_text=_("Segundo segmento del SKU. Único dentro de la familia."),
    )
    name = models.CharField(_("nombre"), max_length=200)
    name_en = models.CharField(_("nombre (EN)"), max_length=200, blank=True)
    slug = models.SlugField(_("slug"), max_length=220, unique=True, blank=True)
    description = models.TextField(_("descripción"), blank=True)
    description_en = models.TextField(_("descripción (EN)"), blank=True)
    composition = models.CharField(_("composición"), max_length=255, blank=True)
    care = models.TextField(_("cuidados"), blank=True)

    kind = models.CharField(
        _("tipo"),
        max_length=16,
        choices=ProductKind.choices,
        default=ProductKind.SIMPLE,
    )
    sale_mode = models.CharField(
        _("modo de venta"),
        max_length=16,
        choices=SaleMode.choices,
        default=SaleMode.IN_STOCK,
    )

    price = models.DecimalField(
        _("precio sin IVA"),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal("0.00"))],
        help_text=_("PVP **sin IVA**. Vacío solo en productos de tipo «solo consulta»."),
    )
    sale_price = models.DecimalField(
        _("precio rebajado sin IVA"),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal("0.00"))],
        help_text=_("Si está relleno, es el precio que se cobra."),
    )
    is_outlet = models.BooleanField(_("en outlet"), default=False)
    is_published = models.BooleanField(_("publicado"), default=False)
    published_at = models.DateTimeField(_("fecha de publicación"), null=True, blank=True)

    class Meta:
        verbose_name = _("producto")
        verbose_name_plural = _("productos")
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["family", "design_code"],
                name="catalog_product_family_design_unique",
            ),
            models.CheckConstraint(
                condition=models.Q(sale_mode="on_request") | models.Q(price__isnull=False),
                name="catalog_product_price_required_unless_on_request",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.family.code}-{self.design_code} · {self.name}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.name}-{self.family.code}-{self.design_code}")[:220]
        super().save(*args, **kwargs)

    @property
    def effective_price(self) -> Decimal | None:
        """Precio sin IVA que se cobra realmente. `None` en productos a consultar."""
        return self.sale_price if self.sale_price is not None else self.price

    @property
    def is_purchasable(self) -> bool:
        """Los productos de solo consulta nunca entran en el carrito."""
        return self.sale_mode != SaleMode.ON_REQUEST and self.effective_price is not None


class Colorway(UUIDTimeStampedModel):
    """
    Un producto en un color concreto. **Dueño del SKU**, porque la talla no entra en el
    código: `familia-diseño-color`.

    El SKU se autogenera si se deja vacío, pero es editable a mano para poder importar el
    catálogo existente respetando los códigos que ya usan.
    """

    product = models.ForeignKey(
        Product,
        verbose_name=_("producto"),
        on_delete=models.CASCADE,
        related_name="colorways",
    )
    color = models.ForeignKey(
        Color,
        verbose_name=_("color"),
        on_delete=models.PROTECT,
        related_name="colorways",
    )
    sku = models.CharField(
        _("SKU"),
        max_length=64,
        unique=True,
        blank=True,
        help_text=_("Se genera como familia-diseño-color si se deja vacío."),
    )
    is_active = models.BooleanField(_("activo"), default=True)
    position = models.PositiveSmallIntegerField(_("orden"), default=0)

    class Meta:
        verbose_name = _("color de producto")
        verbose_name_plural = _("colores de producto")
        ordering = ["position", "sku"]
        constraints = [
            models.UniqueConstraint(
                fields=["product", "color"],
                name="catalog_colorway_product_color_unique",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.sku} · {self.product.name} ({self.color.name})"

    def build_sku(self) -> str:
        return f"{self.product.family.code}-{self.product.design_code}-{self.color.code}".upper()

    def save(self, *args, **kwargs):
        if not self.sku:
            self.sku = self.build_sku()
        super().save(*args, **kwargs)


class Variant(UUIDTimeStampedModel):
    """
    Colorway + talla: la unidad realmente vendible y **dueña del stock**.

    `stock` son unidades exactas y fiables. `reserved` son las retenidas por checkouts en
    curso (reserva de 1 hora); `available` es lo que puede comprarse ahora mismo. Al llegar
    a cero se bloquea la compra — nunca se acepta un pedido sin stock.
    """

    colorway = models.ForeignKey(
        Colorway,
        verbose_name=_("color de producto"),
        on_delete=models.CASCADE,
        related_name="variants",
    )
    size = models.ForeignKey(
        Size,
        verbose_name=_("talla"),
        on_delete=models.PROTECT,
        related_name="variants",
    )
    stock = models.PositiveIntegerField(_("unidades en stock"), default=0)
    reserved = models.PositiveIntegerField(
        _("unidades reservadas"),
        default=0,
        help_text=_("Retenidas por checkouts en curso. Las libera el propio checkout."),
    )
    is_active = models.BooleanField(_("activa"), default=True)

    class Meta:
        verbose_name = _("variante")
        verbose_name_plural = _("variantes")
        ordering = ["size__position"]
        constraints = [
            models.UniqueConstraint(
                fields=["colorway", "size"],
                name="catalog_variant_colorway_size_unique",
            ),
            models.CheckConstraint(
                condition=models.Q(reserved__lte=models.F("stock")),
                name="catalog_variant_reserved_lte_stock",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.colorway.sku} / {self.size.code}"

    @property
    def available(self) -> int:
        return max(self.stock - self.reserved, 0)

    @property
    def in_stock(self) -> bool:
        return self.is_active and self.available > 0


class BundleComponent(UUIDTimeStampedModel):
    """
    Pieza que compone un conjunto. Las piezas se venden también por separado, así que el
    conjunto **no tiene stock propio**: se deriva del de sus componentes.
    """

    bundle = models.ForeignKey(
        Product,
        verbose_name=_("conjunto"),
        on_delete=models.CASCADE,
        related_name="components",
        limit_choices_to={"kind": ProductKind.BUNDLE},
    )
    variant = models.ForeignKey(
        Variant,
        verbose_name=_("pieza"),
        on_delete=models.PROTECT,
        related_name="used_in_bundles",
    )
    quantity = models.PositiveSmallIntegerField(_("cantidad"), default=1)

    class Meta:
        verbose_name = _("pieza de conjunto")
        verbose_name_plural = _("piezas de conjunto")
        constraints = [
            models.UniqueConstraint(
                fields=["bundle", "variant"],
                name="catalog_bundlecomponent_bundle_variant_unique",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.bundle.name} ← {self.variant} ×{self.quantity}"


class ProductImage(UUIDTimeStampedModel):
    """
    Imagen de producto. Si `colorway` está relleno, la imagen pertenece a ese color;
    si no, es común a todo el producto.
    """

    product = models.ForeignKey(
        Product,
        verbose_name=_("producto"),
        on_delete=models.CASCADE,
        related_name="images",
    )
    colorway = models.ForeignKey(
        Colorway,
        verbose_name=_("color de producto"),
        on_delete=models.CASCADE,
        related_name="images",
        null=True,
        blank=True,
    )
    image = models.ImageField(_("imagen"), upload_to="catalog/products/")
    alt_text = models.CharField(_("texto alternativo"), max_length=200, blank=True)
    position = models.PositiveSmallIntegerField(_("orden"), default=0)

    class Meta:
        verbose_name = _("imagen de producto")
        verbose_name_plural = _("imágenes de producto")
        ordering = ["position", "created_at"]

    def __str__(self) -> str:
        return f"{self.product.name} #{self.position}"


class StockNotification(UUIDTimeStampedModel):
    """
    «Avísame cuando haya stock». Se registra por variante y email (sin exigir cuenta) y se
    notifica por Brevo al reponer. `notified_at` evita reenviar el mismo aviso.
    """

    variant = models.ForeignKey(
        Variant,
        verbose_name=_("variante"),
        on_delete=models.CASCADE,
        related_name="stock_notifications",
    )
    email = models.EmailField(_("correo electrónico"))
    notified_at = models.DateTimeField(_("avisado el"), null=True, blank=True)

    class Meta:
        verbose_name = _("aviso de reposición")
        verbose_name_plural = _("avisos de reposición")
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["variant", "email"],
                condition=models.Q(notified_at__isnull=True),
                name="catalog_stocknotification_pending_unique",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.email} → {self.variant}"
