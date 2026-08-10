"""
Carrito, pedido y devoluciones.

Reglas cerradas (ver DECISIONS_PENDING.md):
- Se cobra el **100%** por Stripe en el checkout. No hay pagos parciales.
- Se permite comprar **como invitado**.
- Los precios se guardan **sin IVA** y el 21% se aplica al calcular.
- **Tarifa plana** de envío, única, independiente del número de artículos. Sin recogida.
- El stock es exacto: **se bloquea a cero**. Durante el pago se reserva 1 hora.
- Devoluciones a 14 días, retorno a cargo del cliente, reembolso ejecutado **a mano**.

Todo importe del pedido es una **copia congelada** en el momento de la compra: cambiar el
precio o borrar un producto en el catálogo no reescribe el histórico.
"""

import secrets
from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.catalog.pricing import round_money
from apps.core.models import UUIDTimeStampedModel

ZERO = Decimal("0.00")


class Cart(UUIDTimeStampedModel):
    """
    Carrito. Pertenece a un usuario o, si compra como invitado, es anónimo y el frontend
    lo identifica por su UUID. Al iniciar sesión, el carrito anónimo se fusiona con el del
    usuario (ver `apps.orders.services.merge_carts`).
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name=_("usuario"),
        on_delete=models.CASCADE,
        related_name="carts",
        null=True,
        blank=True,
    )
    checked_out_at = models.DateTimeField(_("convertido en pedido el"), null=True, blank=True)

    class Meta:
        verbose_name = _("carrito")
        verbose_name_plural = _("carritos")
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        return f"Carrito {self.id}"

    @property
    def is_open(self) -> bool:
        return self.checked_out_at is None

    @property
    def subtotal_net(self) -> Decimal:
        return round_money(sum((item.line_net for item in self.items.all()), ZERO))


class CartItem(UUIDTimeStampedModel):
    """Línea de carrito. Apunta a la variante viva: el precio se relee en cada consulta."""

    cart = models.ForeignKey(
        Cart,
        verbose_name=_("carrito"),
        on_delete=models.CASCADE,
        related_name="items",
    )
    variant = models.ForeignKey(
        "catalog.Variant",
        verbose_name=_("variante"),
        on_delete=models.CASCADE,
        related_name="cart_items",
    )
    quantity = models.PositiveSmallIntegerField(
        _("cantidad"), default=1, validators=[MinValueValidator(1)]
    )

    class Meta:
        verbose_name = _("línea de carrito")
        verbose_name_plural = _("líneas de carrito")
        ordering = ["created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["cart", "variant"],
                name="orders_cartitem_cart_variant_unique",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.variant} ×{self.quantity}"

    @property
    def unit_price_net(self) -> Decimal:
        return self.variant.colorway.product.effective_price or ZERO

    @property
    def line_net(self) -> Decimal:
        return round_money(self.unit_price_net * self.quantity)

    @property
    def has_stock(self) -> bool:
        return self.variant.is_active and self.variant.available >= self.quantity


class OrderStatus(models.TextChoices):
    PENDING_PAYMENT = "pending_payment", _("Pendiente de pago")
    PAID = "paid", _("Pagado")
    PROCESSING = "processing", _("En preparación")
    SHIPPED = "shipped", _("Enviado")
    DELIVERED = "delivered", _("Entregado")
    CANCELLED = "cancelled", _("Cancelado")
    REFUNDED = "refunded", _("Reembolsado")
    PARTIALLY_REFUNDED = "partially_refunded", _("Reembolsado parcialmente")


class Order(UUIDTimeStampedModel):
    """
    Pedido. Mientras está en `PENDING_PAYMENT` mantiene **stock reservado** hasta
    `reserved_until` (1 hora). Al confirmarse el pago se descuenta el stock de verdad;
    si caduca sin pagar, la reserva se libera.

    La dirección se copia campo a campo en lugar de referenciar `accounts.Address` para
    que el histórico no cambie si el cliente edita o borra su dirección.
    """

    number = models.BigIntegerField(_("número de pedido"), unique=True, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name=_("usuario"),
        on_delete=models.SET_NULL,
        related_name="orders",
        null=True,
        blank=True,
        help_text=_("Vacío en compras como invitado."),
    )
    email = models.EmailField(_("correo de contacto"))
    phone = models.CharField(_("teléfono"), max_length=32, blank=True)
    status = models.CharField(
        _("estado"),
        max_length=24,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING_PAYMENT,
        db_index=True,
    )

    # --- Copia congelada de la dirección de envío ---
    shipping_recipient = models.CharField(_("destinatario"), max_length=150)
    shipping_line1 = models.CharField(_("dirección"), max_length=255)
    shipping_line2 = models.CharField(_("dirección (línea 2)"), max_length=255, blank=True)
    shipping_postal_code = models.CharField(_("código postal"), max_length=10)
    shipping_city = models.CharField(_("localidad"), max_length=120)
    shipping_province = models.CharField(_("provincia"), max_length=120)
    shipping_country = models.CharField(_("país"), max_length=2, default="ES")

    # --- Datos de facturación (solo si el cliente pide factura) ---
    billing_name = models.CharField(_("razón social / nombre"), max_length=150, blank=True)
    billing_tax_id = models.CharField(_("NIF/CIF"), max_length=20, blank=True)
    billing_address = models.CharField(_("dirección de facturación"), max_length=400, blank=True)
    invoice_requested = models.BooleanField(_("factura solicitada"), default=False)
    invoice_requested_at = models.DateTimeField(_("factura solicitada el"), null=True, blank=True)

    # --- Importes congelados. Netos = sin IVA. ---
    subtotal_net = models.DecimalField(_("subtotal sin IVA"), max_digits=10, decimal_places=2)
    shipping_net = models.DecimalField(_("envío sin IVA"), max_digits=10, decimal_places=2)
    vat_rate = models.DecimalField(_("tipo de IVA"), max_digits=4, decimal_places=3)
    vat_total = models.DecimalField(_("IVA"), max_digits=10, decimal_places=2)
    total_gross = models.DecimalField(_("total con IVA"), max_digits=10, decimal_places=2)
    currency = models.CharField(_("moneda"), max_length=3, default="EUR")

    # --- Pago (Stripe, 100% del importe) ---
    stripe_payment_intent_id = models.CharField(
        _("PaymentIntent de Stripe"), max_length=255, blank=True, db_index=True
    )
    paid_at = models.DateTimeField(_("pagado el"), null=True, blank=True)
    needs_manual_refund = models.BooleanField(
        _("requiere reembolso manual"),
        default=False,
        help_text=_(
            "Se cobró un pedido que no puede servirse (caducó, o el importe no cuadra). "
            "Hay que devolver el dinero a mano en Stripe."
        ),
    )

    # --- Acceso para quien compró sin cuenta ---
    access_token = models.CharField(
        _("token de consulta"),
        max_length=43,
        unique=True,
        editable=False,
        help_text=_(
            "Secreto que se envía al comprador para consultar su pedido sin cuenta. "
            "La referencia es correlativa y por tanto adivinable; esto no."
        ),
    )

    # --- Reserva de stock durante el pago ---
    reserved_until = models.DateTimeField(_("stock reservado hasta"), null=True, blank=True)
    stock_committed = models.BooleanField(
        _("stock descontado"),
        default=False,
        help_text=_("True cuando el pago se confirmó y el stock salió del almacén."),
    )

    # --- Hitos del ciclo de vida ---
    shipped_at = models.DateTimeField(_("enviado el"), null=True, blank=True)
    delivered_at = models.DateTimeField(_("entregado el"), null=True, blank=True)
    cancelled_at = models.DateTimeField(_("cancelado el"), null=True, blank=True)

    customer_note = models.TextField(_("nota del cliente"), blank=True)
    staff_note = models.TextField(_("nota interna"), blank=True)

    class Meta:
        verbose_name = _("pedido")
        verbose_name_plural = _("pedidos")
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.reference

    @property
    def reference(self) -> str:
        """Referencia legible para el cliente y para el email de factura."""
        return f"FC-{self.number:06d}"

    @property
    def is_paid(self) -> bool:
        return self.paid_at is not None

    @property
    def can_be_returned(self) -> bool:
        """Ventana de 14 días desde la entrega; si no consta entrega, desde el pago."""
        from django.utils import timezone

        reference_date = self.delivered_at or self.paid_at
        if reference_date is None or self.status in {
            OrderStatus.CANCELLED,
            OrderStatus.REFUNDED,
        }:
            return False
        window = timezone.timedelta(days=settings.RETURN_WINDOW_DAYS)
        return timezone.now() <= reference_date + window

    def save(self, *args, **kwargs):
        if self.number is None:
            self.number = _next_order_number()
        if not self.access_token:
            self.access_token = secrets.token_urlsafe(32)
        super().save(*args, **kwargs)


def _next_order_number() -> int:
    """
    Número de pedido desde una secuencia de Postgres. Se hace en la base de datos y no
    contando filas para que dos checkouts simultáneos no puedan colisionar.
    """
    from django.db import connection

    with connection.cursor() as cursor:
        cursor.execute("SELECT nextval('orders_order_number_seq')")
        return cursor.fetchone()[0]


class OrderLine(UUIDTimeStampedModel):
    """
    Línea de pedido. Guarda **copia** del SKU, nombres y precio: si el producto cambia o
    se borra del catálogo, el pedido sigue siendo legible.
    """

    order = models.ForeignKey(
        Order,
        verbose_name=_("pedido"),
        on_delete=models.CASCADE,
        related_name="lines",
    )
    variant = models.ForeignKey(
        "catalog.Variant",
        verbose_name=_("variante"),
        on_delete=models.SET_NULL,
        related_name="order_lines",
        null=True,
        blank=True,
    )

    sku = models.CharField(_("SKU"), max_length=64)
    product_name = models.CharField(_("producto"), max_length=200)
    color_name = models.CharField(_("color"), max_length=80, blank=True)
    size_code = models.CharField(_("talla"), max_length=8, blank=True)

    unit_price_net = models.DecimalField(
        _("precio unitario sin IVA"), max_digits=10, decimal_places=2
    )
    quantity = models.PositiveSmallIntegerField(_("cantidad"), validators=[MinValueValidator(1)])
    line_net = models.DecimalField(_("total línea sin IVA"), max_digits=10, decimal_places=2)

    class Meta:
        verbose_name = _("línea de pedido")
        verbose_name_plural = _("líneas de pedido")
        ordering = ["created_at"]

    def __str__(self) -> str:
        return f"{self.sku} ×{self.quantity}"

    @property
    def returned_quantity(self) -> int:
        """Unidades ya devueltas y aceptadas de esta línea."""
        return sum(
            line.quantity
            for line in self.return_lines.all()
            if line.return_request.status == ReturnStatus.ACCEPTED
        )

    @property
    def returnable_quantity(self) -> int:
        return max(self.quantity - self.returned_quantity, 0)


class ReturnStatus(models.TextChoices):
    REQUESTED = "requested", _("Solicitada")
    ACCEPTED = "accepted", _("Aceptada")
    REJECTED = "rejected", _("Rechazada")


class Return(UUIDTimeStampedModel):
    """
    Devolución, total o parcial. El retorno lo paga el cliente; cuando se acepta se
    reembolsa el **100%** del importe de los artículos devueltos.

    El reembolso se ejecuta **a mano** en Stripe: aquí solo se registra qué y cuándo, para
    que el panel y el cliente vean el estado.
    """

    order = models.ForeignKey(
        Order,
        verbose_name=_("pedido"),
        on_delete=models.PROTECT,
        related_name="returns",
    )
    status = models.CharField(
        _("estado"),
        max_length=16,
        choices=ReturnStatus.choices,
        default=ReturnStatus.REQUESTED,
        db_index=True,
    )
    reason = models.TextField(_("motivo"), blank=True)
    staff_note = models.TextField(_("nota interna"), blank=True)
    refund_amount_gross = models.DecimalField(
        _("importe reembolsado con IVA"),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    refunded_at = models.DateTimeField(
        _("reembolsado el"),
        null=True,
        blank=True,
        help_text=_("Se rellena a mano tras ejecutar el reembolso en Stripe."),
    )
    restock = models.BooleanField(
        _("devolver al stock"),
        default=True,
        help_text=_("Si la prenda llegó en mal estado, desmarcar."),
    )

    class Meta:
        verbose_name = _("devolución")
        verbose_name_plural = _("devoluciones")
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Devolución de {self.order.reference}"


class ReturnLine(UUIDTimeStampedModel):
    """Artículos concretos de una devolución. Permite devoluciones parciales."""

    return_request = models.ForeignKey(
        Return,
        verbose_name=_("devolución"),
        on_delete=models.CASCADE,
        related_name="lines",
    )
    order_line = models.ForeignKey(
        OrderLine,
        verbose_name=_("línea de pedido"),
        on_delete=models.PROTECT,
        related_name="return_lines",
    )
    quantity = models.PositiveSmallIntegerField(_("cantidad"), validators=[MinValueValidator(1)])

    class Meta:
        verbose_name = _("línea de devolución")
        verbose_name_plural = _("líneas de devolución")
        constraints = [
            models.UniqueConstraint(
                fields=["return_request", "order_line"],
                name="orders_returnline_request_line_unique",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.order_line.sku} ×{self.quantity}"
