from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.db.models.functions import Lower

User = get_user_model()


class CaseInsensitiveEmailBackend(ModelBackend):
    """
    Login por email ignorando mayúsculas.

    `ModelBackend` busca el email con una comparación exacta, pero la unicidad del modelo
    es case-insensitive (índice funcional sobre `Lower(email)`). Sin esto, quien se
    registró como `Ana@x.com` no podría entrar escribiendo `ana@x.com`.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        email = username or kwargs.get(User.USERNAME_FIELD)
        if email is None or password is None:
            return None

        user = (
            User.objects.annotate(email_lower=Lower("email"))
            .filter(email_lower=email.lower())
            .first()
        )
        if user is None:
            # Se calcula igualmente el hash para que el tiempo de respuesta no delate
            # si el email existe o no.
            User().set_password(password)
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
