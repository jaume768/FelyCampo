import django_filters as filters
from django.db.models import F, Q

from .models import Product


class ProductFilter(filters.FilterSet):
    """Filtros del listado. Los precios se filtran en neto, que es como se guardan."""

    family = filters.CharFilter(field_name="family__slug", lookup_expr="iexact")
    category = filters.CharFilter(method="filter_category")
    color = filters.CharFilter(field_name="colorways__color__code", lookup_expr="iexact")
    size = filters.CharFilter(field_name="colorways__variants__size__code", lookup_expr="iexact")
    in_stock = filters.BooleanFilter(method="filter_in_stock")
    price_min = filters.NumberFilter(field_name="price", lookup_expr="gte")
    price_max = filters.NumberFilter(field_name="price", lookup_expr="lte")

    class Meta:
        model = Product
        fields = ("family", "category", "color", "size", "sale_mode", "is_outlet", "kind")

    def filter_category(self, queryset, name, value):
        """Incluye las subcategorías: pedir «fiesta» trae también lo que cuelga de ella."""
        return queryset.filter(
            Q(categories__slug=value) | Q(categories__parent__slug=value)
        ).distinct()

    def filter_in_stock(self, queryset, name, value):
        """Disponible = unidades libres tras descontar las reservas de checkouts en curso."""
        available = Q(
            colorways__variants__is_active=True,
            colorways__variants__stock__gt=F("colorways__variants__reserved"),
        )
        return (queryset.filter(available) if value else queryset.exclude(available)).distinct()
