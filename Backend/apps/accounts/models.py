from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.db.models.functions import Lower
from django.utils.translation import gettext_lazy as _

from apps.core.models import UUIDModel

from .managers import UserManager


class User(UUIDModel, AbstractBaseUser, PermissionsMixin):
    """
    Usuario mínimo: UUID como PK, email como identificador.
    La unicidad es case-insensitive mediante un índice funcional sobre Lower(email)
    (constraint en Meta), no con unique=True, para tratar Ana@x.com == ana@x.com.
    Fase 0: sin perfil, direcciones, verificación ni roles de cliente.
    """

    email = models.EmailField(_("correo electrónico"))
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
