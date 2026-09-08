from rest_framework.permissions import BasePermission


class IsStaff(BasePermission):
    """
    Acceso al panel admin: exige `is_staff` (`accounts.User.is_staff`, ya declarado como
    "acceso al admin"). No es un sistema de autenticación aparte — es la misma sesión +
    cookie que ya usa el resto de la API (ver DECISIONS_PENDING.md); staff es solo un
    flag más del mismo usuario, no una cuenta de otro tipo.

    Sin sesión responde 401 (comportamiento estándar de DRF: con `SessionAuthentication`
    configurada pero sin autenticador exitoso, `permission_denied` lanza
    `NotAuthenticated` antes de llegar aquí). Con sesión pero sin `is_staff`, 403.
    """

    message = "No tienes acceso al panel de administración."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)
