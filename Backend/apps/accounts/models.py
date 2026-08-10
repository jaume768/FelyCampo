from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.db.models.functions import Lower
from django.utils.translation import gettext_lazy as _

from apps.core.models import UUIDModel, UUIDTimeStampedModel

from .managers import UserManager


class User(UUIDModel, AbstractBaseUser, PermissionsMixin):
    """
    Usuario: UUID como PK, email como identificador.
    La unicidad es case-insensitive mediante un índice funcional sobre Lower(email)
    (constraint en Meta), no con unique=True, para tratar Ana@x.com == ana@x.com.
    """

    email = models.EmailField(_("correo electrónico"))
    first_name = models.CharField(_("nombre"), max_length=100, blank=True)
    last_name = models.CharField(_("apellidos"), max_length=150, blank=True)
    phone = models.CharField(_("teléfono"), max_length=32, blank=True)
    accepts_marketing = models.BooleanField(_("acepta comunicaciones"), default=False)
    is_active = models.BooleanField(_("activo"), default=True)
    is_staff = models.BooleanField(_("acceso al admin"), default=False)
    date_joined = models.DateTimeField(_("alta"), auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    class Meta:
        verbose_name = _("usuario")
        verbose_name_plural = _("usuarios")
        constraints = [
            models.UniqueConstraint(
                Lower("email"),
                name="accounts_user_email_ci_unique",
            ),
        ]

    def __str__(self) -> str:
        return self.email

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()


class Address(UUIDTimeStampedModel):
    """
    Dirección del cliente, reutilizable entre pedidos. El pedido guarda su **propia copia**
    (ver `orders.Order`): editar o borrar una dirección nunca reescribe el histórico.

    Solo Península por ahora, de ahí el país fijo a ES.
    """

    user = models.ForeignKey(
        "accounts.User",
        verbose_name=_("usuario"),
        on_delete=models.CASCADE,
        related_name="addresses",
    )
    label = models.CharField(_("etiqueta"), max_length=60, blank=True)
    recipient = models.CharField(_("destinatario"), max_length=150)
    phone = models.CharField(_("teléfono"), max_length=32, blank=True)
    line1 = models.CharField(_("dirección"), max_length=255)
    line2 = models.CharField(_("dirección (línea 2)"), max_length=255, blank=True)
    postal_code = models.CharField(_("código postal"), max_length=10)
    city = models.CharField(_("localidad"), max_length=120)
    province = models.CharField(_("provincia"), max_length=120)
    country = models.CharField(_("país"), max_length=2, default="ES")
    tax_id = models.CharField(
        _("NIF/CIF"),
        max_length=20,
        blank=True,
        help_text=_("Necesario si el cliente pide factura."),
    )
    is_default_shipping = models.BooleanField(_("envío por defecto"), default=False)
    is_default_billing = models.BooleanField(_("facturación por defecto"), default=False)

    class Meta:
        verbose_name = _("dirección")
        verbose_name_plural = _("direcciones")
        ordering = ["-is_default_shipping", "-created_at"]

    def __str__(self) -> str:
        return f"{self.recipient} · {self.postal_code} {self.city}"


class Favorite(UUIDTimeStampedModel):
    """Producto guardado por el cliente en su área privada."""

    user = models.ForeignKey(
        "accounts.User",
        verbose_name=_("usuario"),
        on_delete=models.CASCADE,
        related_name="favorites",
    )
    product = models.ForeignKey(
        "catalog.Product",
        verbose_name=_("producto"),
        on_delete=models.CASCADE,
        related_name="favorited_by",
    )

    class Meta:
        verbose_name = _("favorito")
        verbose_name_plural = _("favoritos")
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "product"],
                name="accounts_favorite_user_product_unique",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.user.email} ♥ {self.product.name}"
