"""Permisos transversales."""

from rest_framework.permissions import IsAdminUser


class IsStaff(IsAdminUser):
    """
    Acceso al panel de administración: exige `is_staff`.

    Es un envoltorio sobre `IsAdminUser` y no su uso directo a propósito. Hoy quien es
    staff lo ve todo (decidido: el sistema de roles y permisos por sección llega más
    adelante), así que **este es el único punto que habrá que tocar** cuando llegue, en
    lugar de las decenas de vistas del panel.

    Con `SessionAuthentication` y sin cabecera `WWW-Authenticate`, DRF responde **403** a
    quien no ha iniciado sesión, no 401. Es el comportamiento esperado por el frontend del
    panel: no hay ningún esquema de autenticación que ofrecerle a un anónimo.
    """
