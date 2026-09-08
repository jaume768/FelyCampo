"""
Clientes del panel (`/api/v1/admin/customers/`).

Un «cliente» aquí es un `accounts.User` **no staff**: alguien que se ha registrado.

OJO CON UNA COSA: **una compra de invitado NO crea usuario.** El checkout acepta pedidos
sin cuenta (basta el correo, ver `CheckoutSerializer`), y esos pedidos guardan
`Order.email` con `Order.user = NULL`. Así que el número de clientes de esta pantalla y el
número de personas que han comprado **no tienen por qué coincidir**: quien compró sin
registrarse no aparece aquí, solo en sus pedidos.

Por eso cada cliente trae el recuento y el gasto de sus pedidos ya calculado, y hay un
`GET /admin/customers/guests/` que resume esa otra mitad (los pedidos sin cuenta agrupados
por correo) para que el hueco sea visible en vez de silencioso.

Solo lectura: crear o borrar clientes desde el panel no está contemplado — un cliente nace
registrándose. Lo único editable es `is_active` (bloquear una cuenta).
"""

from django.db.models import Count, Max, Q, Sum
from drf_spectacular.utils import extend_schema
from rest_framework import mixins, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.models import User
from apps.core.pagination import DefaultPagination
from apps.orders.models import Order, OrderStatus

from .permissions import IsStaff

# Pedidos que cuentan como gasto real: los que no llegaron a pagarse o se anularon no
# dicen nada del valor de un cliente.
ESTADOS_CON_VALOR = (
    OrderStatus.PAID,
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
)


class AdminCustomerSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    # Anotaciones del queryset; no son campos del modelo.
    orders_count = serializers.IntegerField(read_only=True)
    paid_orders_count = serializers.IntegerField(read_only=True)
    total_spent = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    last_order_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone",
            "accepts_marketing",
            "email_verified",
            "is_active",
            "date_joined",
            "orders_count",
            "paid_orders_count",
            "total_spent",
            "last_order_at",
        )
        # Lo único que el panel puede cambiar es bloquear la cuenta.
        read_only_fields = tuple(f for f in fields if f != "is_active")


class AdminCustomerViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    Clientes registrados, con su historial de compra resumido.

    Sin `create` ni `destroy` a propósito: un cliente nace registrándose, y borrarlo
    rompería el histórico de pedidos que lo referencia (mismo criterio que archivar un
    producto en vez de eliminarlo).
    """

    permission_classes = [IsStaff]
    pagination_class = DefaultPagination
    throttle_scope = "admin"
    serializer_class = AdminCustomerSerializer
    search_fields = ("email", "first_name", "last_name")
    ordering_fields = ("date_joined", "email", "total_spent", "orders_count")
    ordering = ("-date_joined", "id")

    def get_queryset(self):
        con_valor = Q(orders__status__in=ESTADOS_CON_VALOR)
        return (
            User.objects.filter(is_staff=False)
            .annotate(
                orders_count=Count("orders", distinct=True),
                paid_orders_count=Count("orders", filter=con_valor, distinct=True),
                total_spent=Sum("orders__total_gross", filter=con_valor),
                last_order_at=Max("orders__created_at"),
            )
        )

    @extend_schema(responses={200: None})
    @action(detail=False, methods=["get"])
    def guests(self, request):
        """
        La otra mitad: pedidos **sin cuenta**, agrupados por correo.

        No son usuarios y no salen en el listado principal. Se exponen aparte para que se
        vea cuánta gente ha comprado sin registrarse, en vez de dar a entender que los
        clientes registrados son todos los compradores.
        """
        filas = (
            Order.objects.filter(user__isnull=True)
            .values("email")
            .annotate(
                orders_count=Count("id"),
                paid_orders_count=Count("id", filter=Q(status__in=ESTADOS_CON_VALOR)),
                total_spent=Sum("total_gross", filter=Q(status__in=ESTADOS_CON_VALOR)),
                last_order_at=Max("created_at"),
            )
            .order_by("-last_order_at")
        )
        return Response(list(filas))
