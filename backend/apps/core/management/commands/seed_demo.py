"""
Datos de ejemplo para probar la API desde el navegador.

**Solo para desarrollo.** Se niega a ejecutarse con DEBUG=False para no llenar de vestidos
inventados una base de datos real.
"""

from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils.text import slugify

from apps.catalog.models import (
    Category,
    Color,
    Colorway,
    Family,
    Product,
    ProductLine,
    ProductStatus,
    SaleMode,
    Size,
    Variant,
)

User = get_user_model()

SIZES = ["34", "36", "38", "40", "42", "44", "46"]
COLORS = [
    ("NEG", "Negro", "#111111"),
    ("ROJ", "Rojo", "#C41E3A"),
    ("MAR", "Marfil", "#F3EAD8"),
    ("VER", "Verde agua", "#8FBFB0"),
    ("AZU", "Azul noche", "#1F2A54"),
]
# (código, nombre, líneas en las que se ofrece).
#
# `lines` es lo que hace que el formulario del panel enseñe solo lo que pega con el tipo
# de producto: dando de alta una pieza de atelier no tiene sentido ofrecer «Zapatos».
# Vestidos está en las dos: se vende de catálogo y también se hace a medida.
FAMILIES = [
    ("VE", "Vestidos", [ProductLine.PRET_A_PORTER, ProductLine.ATELIER]),
    ("CH", "Chaquetas y Abrigos", [ProductLine.PRET_A_PORTER]),
    ("FA", "Faldas", [ProductLine.PRET_A_PORTER]),
    ("TO", "Tops y Camisas", [ProductLine.PRET_A_PORTER]),
    ("ZA", "Zapatos", [ProductLine.PRET_A_PORTER]),
    ("AC", "Accesorios", [ProductLine.PRET_A_PORTER]),
    ("NO", "Novias", [ProductLine.ATELIER]),
    ("FI", "Fiesta", [ProductLine.ATELIER]),
]

# (familia, diseño, nombre, precio sin IVA, rebaja, outlet, modo de venta, línea)
#
# La `line` va explícita: las piezas de atelier (novia/fiesta, a medida y sin precio de
# catálogo) son `ATELIER`, no `PRET_A_PORTER`. Sin esto, `/atelier/novias` —que filtra por
# `line=atelier` + `category`— sale vacío aunque la categoría sí case.
PRODUCTS = [
    ("VE", "120", "Vestido Aria", "290.00", None, False, SaleMode.IN_STOCK, ProductLine.PRET_A_PORTER),
    ("VE", "121", "Vestido Noor", "340.00", "255.00", False, SaleMode.IN_STOCK, ProductLine.PRET_A_PORTER),
    ("VE", "122", "Vestido Bruma", "260.00", "130.00", True, SaleMode.IN_STOCK, ProductLine.PRET_A_PORTER),
    ("VE", "900", "Vestido de novia Sena", None, None, False, SaleMode.ON_REQUEST, ProductLine.ATELIER),
    ("VE", "901", "Vestido de fiesta Adra", None, None, False, SaleMode.ON_REQUEST, ProductLine.ATELIER),
    ("CH", "210", "Chaqueta Duna", "310.00", None, False, SaleMode.IN_STOCK, ProductLine.PRET_A_PORTER),
    ("FA", "330", "Falda Ónice", "180.00", None, False, SaleMode.IN_STOCK, ProductLine.PRET_A_PORTER),
    ("TO", "440", "Top Lino", "120.00", None, True, SaleMode.IN_STOCK, ProductLine.PRET_A_PORTER),
]


class Command(BaseCommand):
    help = "Crea catálogo de ejemplo y un superusuario para probar la API. Solo en desarrollo."

    def add_arguments(self, parser):
        parser.add_argument("--email", default="admin@felycampo.test")
        parser.add_argument("--password", default="admin12345")

    @transaction.atomic
    def handle(self, *args, **options):
        from django.conf import settings

        if not settings.DEBUG:
            raise CommandError("seed_demo solo se ejecuta con DEBUG=True.")

        sizes = [
            Size.objects.get_or_create(code=code, defaults={"position": i})[0]
            for i, code in enumerate(SIZES)
        ]
        colors = {
            code: Color.objects.get_or_create(
                code=code, defaults={"name": name, "hex_value": hex_value}
            )[0]
            for code, name, hex_value in COLORS
        }
        families = {}
        for code, name, lines in FAMILIES:
            familia, _creada = Family.objects.get_or_create(
                code=code,
                defaults={"name": name, "slug": slugify(name), "lines": lines},
            )
            # No se usa `update_or_create`: pisaría un nombre editado a mano desde el
            # panel. Las líneas solo se rellenan si están vacías, que es el caso de las
            # familias creadas antes de que ese campo existiera.
            if not familia.lines:
                familia.lines = lines
                familia.save(update_fields=["lines", "updated_at"])
            families[code] = familia

        fiesta, _ = Category.objects.get_or_create(
            slug="fiesta", defaults={"name": "Fiesta", "position": 1}
        )
        Category.objects.get_or_create(
            slug="coctel", defaults={"name": "Cóctel", "parent": fiesta, "position": 1}
        )
        novia, _ = Category.objects.get_or_create(
            slug="novia", defaults={"name": "Novia", "position": 2}
        )
        outlet, _ = Category.objects.get_or_create(
            slug="outlet", defaults={"name": "Outlet", "position": 9}
        )

        created = 0
        for family_code, design, name, price, sale_price, is_outlet, mode, line in PRODUCTS:
            product, is_new = Product.objects.get_or_create(
                family=families[family_code],
                design_code=design,
                defaults={
                    "name": name,
                    "price": Decimal(price) if price else None,
                    "sale_price": Decimal(sale_price) if sale_price else None,
                    "sale_mode": mode,
                    "line": line,
                    "is_outlet": is_outlet,
                    # is_published es un campo derivado desde Fase 2 (Product.save()) —
                    # se fija el estado real, no el booleano, que se sobrescribiría solo.
                    "status": ProductStatus.ACTIVE,
                    "description": f"{name}. Pieza de ejemplo para pruebas de la API.",
                    "composition": "100% seda",
                },
            )
            if not is_new:
                continue
            created += 1
            product.categories.add(novia if "novia" in name.lower() else fiesta)

            # Escaparate de la home: los cuatro primeros con stock. Sin esto, la home
            # sale vacía con datos de ejemplo (no hay ningún destacado por defecto).
            if mode != SaleMode.ON_REQUEST and created <= 4:
                product.is_featured = True
                product.featured_position = created
                product.save(update_fields=["is_featured", "featured_position", "updated_at"])
            if is_outlet:
                product.categories.add(outlet)

            # Dos colores por diseño y stock desigual: así se ven tallas agotadas.
            for index, color_code in enumerate(list(colors)[:2]):
                colorway = Colorway.objects.create(
                    product=product, color=colors[color_code], position=index
                )
                for position, size in enumerate(sizes):
                    Variant.objects.create(
                        colorway=colorway,
                        size=size,
                        stock=0 if position in (0, len(sizes) - 1) else 2 + position,
                    )

        user, _ = User.objects.get_or_create(
            email=options["email"], defaults={"is_staff": True, "is_superuser": True}
        )
        # La contraseña se fija siempre: si el usuario ya existía de una ejecución previa,
        # nadie recuerda cuál era y el comando dejaría de servir para entrar.
        user.is_staff = user.is_superuser = True
        user.set_password(options["password"])
        user.save()

        self.stdout.write(
            self.style.SUCCESS(
                f"Listo. Productos nuevos: {created}. "
                f"Admin: {options['email']} / {options['password']}"
            )
        )
