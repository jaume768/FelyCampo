from rest_framework.filters import OrderingFilter


class StableOrderingFilter(OrderingFilter):
    """
    Igual que `OrderingFilter`, pero añade siempre `id` como último criterio.

    Sin desempate, dos filas con el mismo valor en el campo de orden (p. ej. el mismo
    `created_at` tras una importación masiva) pueden salir repetidas entre páginas o no
    salir en ninguna: Postgres no promete un orden estable ante empates. Afecta a
    cualquier listado paginado, así que se aplica de forma global.
    """

    def get_ordering(self, request, queryset, view):
        ordering = super().get_ordering(request, queryset, view)
        if not ordering:
            return ordering
        if any(field.lstrip("-") == "id" for field in ordering):
            return ordering
        return [*ordering, "id"]
