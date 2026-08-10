from django.contrib import admin, messages
from django.utils.translation import gettext_lazy as _

from .models import Cart, CartItem, Order, OrderLine, Return, ReturnLine
from .services import accept_return


class OrderLineInline(admin.TabularInline):
    model = OrderLine
    extra = 0
    can_delete = False
    readonly_fields = (
        "sku",
        "product_name",
        "color_name",
        "size_code",
        "unit_price_net",
        "quantity",
        "line_net",
    )

    def has_add_permission(self, request, obj=None) -> bool:
        # Las líneas son copia congelada de la compra: no se tocan a mano.
        return False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "reference",
        "created_at",
        "email",
        "status",
        "total_gross",
        "needs_manual_refund",
        "invoice_requested",
    )
    # `needs_manual_refund` va el primero a propósito: es dinero de un cliente esperando
    # a que alguien lo devuelva a mano en Stripe.
    list_filter = ("needs_manual_refund", "status", "invoice_requested", "created_at")
    search_fields = ("number", "email", "shipping_recipient", "lines__sku")
    date_hierarchy = "created_at"
    inlines = (OrderLineInline,)
    readonly_fields = (
        "number",
        "reference",
        "subtotal_net",
        "shipping_net",
        "vat_rate",
        "vat_total",
        "total_gross",
        "currency",
        "stripe_payment_intent_id",
        "paid_at",
        "reserved_until",
        "stock_committed",
    )
    fieldsets = (
        (None, {"fields": ("reference", "number", "status", "user", "email", "phone")}),
        (
            _("Envío"),
            {
                "fields": (
                    "shipping_recipient",
                    "shipping_line1",
                    "shipping_line2",
                    "shipping_postal_code",
                    "shipping_city",
                    "shipping_province",
                    "shipping_country",
                )
            },
        ),
        (
            _("Facturación"),
            {
                "fields": (
                    "invoice_requested",
                    "invoice_requested_at",
                    "billing_name",
                    "billing_tax_id",
                    "billing_address",
                )
            },
        ),
        (
            _("Importes"),
            {
                "fields": (
                    "subtotal_net",
                    "shipping_net",
                    "vat_rate",
                    "vat_total",
                    "total_gross",
                    "currency",
                )
            },
        ),
        (
            _("Pago y stock"),
            {
                "fields": (
                    "needs_manual_refund",
                    "stripe_payment_intent_id",
                    "paid_at",
                    "reserved_until",
                    "stock_committed",
                )
            },
        ),
        (_("Hitos"), {"fields": ("shipped_at", "delivered_at", "cancelled_at")}),
        (_("Notas"), {"fields": ("customer_note", "staff_note")}),
    )


class ReturnLineInline(admin.TabularInline):
    model = ReturnLine
    extra = 0
    autocomplete_fields = ("order_line",)


@admin.register(Return)
class ReturnAdmin(admin.ModelAdmin):
    list_display = ("order", "status", "refund_amount_gross", "refunded_at", "created_at")
    list_filter = ("status", "restock", "created_at")
    search_fields = ("order__number", "order__email")
    inlines = (ReturnLineInline,)
    actions = ("accept_returns",)

    @admin.action(description=_("Aceptar devolución y reponer stock"))
    def accept_returns(self, request, queryset):
        """
        Acepta las devoluciones seleccionadas. **No mueve dinero**: el reembolso se ejecuta
        a mano en Stripe y luego se anota la fecha en «reembolsado el».
        """
        for return_request in queryset:
            accepted = accept_return(return_request=return_request)
            self.message_user(
                request,
                _("%(ref)s: aceptada. Reembolsar %(amount)s € a mano en Stripe.")
                % {"ref": accepted.order.reference, "amount": accepted.refund_amount_gross},
                level=messages.WARNING,
            )


@admin.register(OrderLine)
class OrderLineAdmin(admin.ModelAdmin):
    """Registrado solo para que el autocompletado de las devoluciones funcione."""

    search_fields = ("sku", "product_name", "order__number")

    def has_module_permission(self, request) -> bool:
        return False


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "created_at", "checked_out_at")
    list_filter = ("checked_out_at",)
    inlines = (CartItemInline,)
