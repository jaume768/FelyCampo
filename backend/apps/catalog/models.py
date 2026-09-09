"""
Modelo de catálogo en tres niveles, según lo cerrado en DECISIONS_PENDING.md:

    Product   familia + diseño (modelo). Precio y modo de venta.
      └ Colorway   un color. **Dueño del SKU** (la talla no entra en el código).
          └ Variant   una talla. **Dueña del stock**.

Colores y tallas son catálogos globales reutilizables. Los precios se guardan **sin IVA**;
el 21% se aplica al calcular (ver `apps.catalog.pricing`).
"""

from decimal import Decimal

from django.contrib.postgres.fields import ArrayField
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone
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


class ProductLine(models.TextChoices):
    """
    Línea comercial. Solo tres valores — a propósito, no es lo mismo que `Category`
    (árbol de navegación) ni que `Collection` (temporada): distingue prêt-à-porter
    (catálogo vivo, con stock) de atelier (novia/fiesta a medida, `sale_mode=on_request`
    normalmente) y de archivo editorial (piezas de temporadas pasadas, sin venta activa).

    Los "tipos" `novia`/`fiesta` del panel (mock `tiposProducto`) colapsan aquí en
    `ARCHIVE`, igual que `archivo`: no son líneas comerciales aparte, son colecciones
    editoriales dentro del archivo — ver ADMIN_API_PLAN.md, "Product.line".
    """

    PRET_A_PORTER = "pret_a_porter", _("Prêt-à-porter")
    ATELIER = "atelier", _("Atelier")
    ARCHIVE = "archive", _("Archivo")


class ProductStatus(models.TextChoices):
    """
    Fuente de verdad del estado de publicación — `Product.is_published` (bool, ya
    consumido por la API pública) se deriva de este campo en `Product.save()`, nunca se
    asigna a mano.

    `SCHEDULED` es «publicar a partir de `published_at`»: el producto NO es público hasta
    esa fecha. Lo pasa a `ACTIVE` el comando `publish_scheduled` (cron), igual que
    `release_reservations` con las reservas — no se recalcula en cada lectura, porque
    `is_published` es un campo almacenado que la API pública ya filtra por índice.

    Aun así `save()` deriva `is_published` teniendo en cuenta la fecha, para que un
    programado cuya hora ya pasó no se quede invisible si el cron aún no ha corrido.
    """

    DRAFT = "draft", _("Borrador")
    SCHEDULED = "scheduled", _("Esperando a publicar")
    ACTIVE = "active", _("Activo")
    ARCHIVED = "archived", _("Archivado")


class Family(UUIDTimeStampedModel):
    """
    Familia de producto: la sección del catálogo a la que pertenece. Primer segmento
    del SKU.

    `lines` acota en qué líneas se ofrece. Sin esto, el formulario del panel enseñaba
    TODAS las familias sin importar el tipo de producto: al dar de alta una pieza de
    atelier salían «Faldas» o «Zapatos», que ahí no pintan nada.

    Una familia puede estar en varias líneas (un vestido se vende en prêt-à-porter y se
    hace a medida en atelier), de ahí que sea una lista y no un único valor. **Vacía
    significa «en todas»**: así las familias que ya existían siguen apareciendo en todas
    partes sin tener que revisarlas una a una.
    """

    code = models.CharField(_("código"), max_length=8, unique=True)
    name = models.CharField(_("nombre"), max_length=120)
    name_en = models.CharField(_("nombre (EN)"), max_length=120, blank=True)
    slug = models.SlugField(_("slug"), max_length=140, unique=True)
    lines = ArrayField(
        models.CharField(max_length=16, choices=ProductLine.choices),
        verbose_name=_("líneas"),
        default=list,
        blank=True,
        help_text=_("Líneas en las que se ofrece. Vacío = en todas."),
    )
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


class Collection(UUIDTimeStampedModel):
    """
    Temporada (p.ej. "Otoño-Invierno 2027") — una etiqueta reutilizable por cualquier
    producto de cualquier `line`, no el sistema de colecciones editoriales con looks del
    archivo (Runway/Novia/Fiesta en `categoriasMock`, con `numeroLooks`/`looks[]`), que
    son una entidad distinta y no la cubre este modelo — decisión explícita, ver
    ADMIN_API_PLAN.md, "Collection vs archivo editorial".
    """

    code = models.SlugField(_("código"), max_length=32, unique=True)
    name = models.CharField(_("nombre"), max_length=120)
    name_en = models.CharField(_("nombre (EN)"), max_length=120, blank=True)
    starts_on = models.DateField(_("fecha de inicio"), null=True, blank=True)
    ends_on = models.DateField(_("fecha de fin"), null=True, blank=True)
    position = models.PositiveSmallIntegerField(_("orden"), default=0)
    is_active = models.BooleanField(_("activa"), default=True)

    class Meta:
        verbose_name = _("colección")
        verbose_name_plural = _("colecciones")
        ordering = ["-position", "-starts_on", "name"]

    def __str__(self) -> str:
        return self.name


class Fabric(UUIDTimeStampedModel):
    """
    Biblioteca global de tejidos — mismo patrón que `Color`: reutilizable entre
    productos vía M2M, con foto de muestra opcional. Convive con `Product.composition`
    (texto libre): no son excluyentes, uno describe en prosa y el otro enlaza a la
    biblioteca (ver DECISIONS_PENDING/ADMIN_API_PLAN.md, "D7").
    """

    name = models.CharField(_("nombre"), max_length=120)
    name_en = models.CharField(_("nombre (EN)"), max_length=120, blank=True)
    composition = models.CharField(_("composición"), max_length=255, blank=True)
    image = models.ForeignKey(
        "media.MediaAsset",
        verbose_name=_("foto"),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )

    class Meta:
        verbose_name = _("tejido")
        verbose_name_plural = _("tejidos")
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


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
    line = models.CharField(
        _("línea"),
        max_length=16,
        choices=ProductLine.choices,
        default=ProductLine.PRET_A_PORTER,
    )
    status = models.CharField(
        _("estado"),
        max_length=16,
        choices=ProductStatus.choices,
        default=ProductStatus.DRAFT,
        help_text=_("Fuente de verdad de la publicación. `is_published` se deriva de este campo."),
    )
    collection = models.ForeignKey(
        Collection,
        verbose_name=_("colección"),
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="products",
    )
    fabrics = models.ManyToManyField(
        Fabric,
        verbose_name=_("tejidos"),
        related_name="products",
        blank=True,
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
    # Escaparate de la home. No es una `Collection` (temporada) ni una `Category`
    # (ocasión): es una selección editorial que se cambia a menudo y no describe la pieza.
    # Se añade porque la home necesitaba «destacados» y no había de dónde sacarlos.
    is_featured = models.BooleanField(
        _("destacado"),
        default=False,
        db_index=True,
        help_text=_("Aparece en el escaparate de la home."),
    )
    featured_position = models.PositiveSmallIntegerField(
        _("orden en el escaparate"),
        default=0,
        help_text=_("Menor primero. Solo se usa si el producto está destacado."),
    )
    is_published = models.BooleanField(
        _("publicado"),
        default=False,
        help_text=_("Derivado de `status` en save() — no editar a mano, se sobrescribe."),
    )
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
            # El precio solo se exige al PUBLICAR. Un borrador es trabajo a medias por
            # definición: obligar a poner precio para poder guardarlo y seguir mañana no
            # protege nada, solo estorba. La regla de verdad —no hay producto público sin
            # precio, salvo los de solo consulta— se mantiene intacta.
            models.CheckConstraint(
                condition=~models.Q(status="active")
                | models.Q(sale_mode="on_request")
                | models.Q(price__isnull=False),
                name="catalog_product_price_required_when_active",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.family.code}-{self.design_code} · {self.name}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.name}-{self.family.code}-{self.design_code}")[:220]
        # `status` es la fuente de verdad; `is_published` es el campo que ya consume la
        # API pública (`ProductViewSet.get_queryset`, sin tocar) — se deriva aquí para no
        # tener que sincronizar los dos a mano en cada sitio que cambie el estado.
        ahora = timezone.now()

        if self.status == ProductStatus.ACTIVE:
            self.is_published = True
            if self.published_at is None:
                self.published_at = ahora
        elif self.status == ProductStatus.SCHEDULED:
            # Público solo cuando llega la hora. Sin fecha no puede estar programado: se
            # trata como no publicado (el serializer del panel ya lo exige antes).
            self.is_published = bool(self.published_at and self.published_at <= ahora)
        else:
            # Borrador y archivado nunca son públicos. `published_at` se conserva: es el
            # histórico de cuándo se publicó por primera vez, no un flag.
            self.is_published = False

        super().save(*args, **kwargs)

    @property
    def is_scheduled_pending(self) -> bool:
        """Programado y aún no le ha llegado la hora."""
        return (
            self.status == ProductStatus.SCHEDULED
            and self.published_at is not None
            and self.published_at > timezone.now()
        )

    def archive(self) -> None:
        """«Borrar» un producto desde el panel archiva, no elimina la fila (ver
        ADMIN_API_PLAN.md, "D8") — conserva el histórico de pedidos que lo referencian."""
        self.status = ProductStatus.ARCHIVED
        self.save(update_fields=["status", "is_published", "updated_at"])

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

    Desde la Fase 3 (`apps.stock`, ver su docstring de módulo), `stock` es la suma de los
    `StockLevel` de ubicaciones vendibles y activas — pero sigue siendo un campo real
    (nadie que ya lo leía tuvo que cambiar), no una property: `save()` (abajo) detecta
    cuándo cambia y propaga el mismo delta al `StockLevel` de la ubicación vendible, para
    que checkout/devoluciones (`apps/orders/services.py`, que lo escriben directo y sin
    tocar) no dejen el desglose por ubicación desincronizado.
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

    def save(self, *args, **kwargs):
        anterior = None
        if self.pk:
            anterior = Variant.objects.filter(pk=self.pk).values_list("stock", flat=True).first()
        delta = self.stock - (anterior if anterior is not None else 0)
        super().save(*args, **kwargs)
        if delta:
            self._propagar_delta_a_ubicacion_vendible(delta)

    def _propagar_delta_a_ubicacion_vendible(self, delta: int) -> None:
        # Import local: apps.stock importa Variant de aquí (StockLevel.variant), así que
        # un import a nivel de módulo crearía un ciclo. No hace nada si todavía no existe
        # ninguna ubicación vendible (p.ej. antes de que corra la migración de la Fase 3).
        from apps.stock.models import Location, StockLevel

        ubicacion = Location.objects.filter(is_sellable=True, is_active=True).first()
        if ubicacion is None:
            return
        nivel, _creado = StockLevel.objects.get_or_create(
            variant=self, location=ubicacion, defaults={"quantity": 0}
        )
        nivel.quantity = max(nivel.quantity + delta, 0)
        nivel.save(update_fields=["quantity", "updated_at"])

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
    Una posición en la galería de un producto (portada, color concreto, orden) — no el
    archivo en sí: el archivo real vive en `media.MediaAsset` (biblioteca reutilizable
    entre producto/blog/contenido/diseño de home), esto solo referencia uno y decide su
    sitio en esta ficha. Si `colorway` está relleno, la imagen pertenece a ese color; si
    no, es común a todo el producto.

    `on_delete=PROTECT` en `asset`: no se puede borrar un archivo de la biblioteca
    mientras esté colocado aquí — el 409 informativo lo da antes
    `media.MediaAssetViewSet.perform_destroy` vía `MediaAsset.usages()`, esto es solo el
    cinturón además de los tirantes a nivel de base de datos.
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
    asset = models.ForeignKey(
        "media.MediaAsset",
        verbose_name=_("archivo"),
        on_delete=models.PROTECT,
        related_name="product_images",
    )
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
