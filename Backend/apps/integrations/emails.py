"""
Correos que salen del sitio. Se envían con el backend de email de Django (en desarrollo,
a consola). Cuando Brevo esté configurado, basta cambiar `EMAIL_BACKEND`: el resto del
código no cambia.

Los destinos son **placeholders configurables** (`INVOICE_REQUEST_EMAIL`,
`PRODUCT_ENQUIRY_EMAIL`): faltan las direcciones reales.
"""

from django.conf import settings
from django.core.mail import send_mail

from apps.catalog.pricing import gross


def _frontend_url(path: str) -> str:
    return f"{settings.FRONTEND_BASE_URL.rstrip('/')}{path}"


def send_order_confirmation(*, order) -> None:
    """
    Confirmación de compra. Es el correo que espera cualquier cliente tras pagar y, además,
    el único sitio donde viaja el `access_token`: es el enlace con el que quien compró sin
    cuenta podrá volver a ver su pedido.

    No promete fechas ni estados de envío: de la logística se encarga una empresa externa.
    """
    lines = [
        f"  {line.quantity} × {line.product_name} ({line.color_name} / {line.size_code})"
        f"  {gross(line.line_net)} €"
        for line in order.lines.all()
    ]
    tracking = _frontend_url(f"/pedido/?token={order.access_token}")
    body = "\n".join(
        [
            f"Hemos recibido tu pedido {order.reference}. ¡Gracias!",
            "",
            *lines,
            "",
            f"  Envío: {gross(order.shipping_net)} €",
            f"  TOTAL (IVA incluido): {order.total_gross} {order.currency}",
            "",
            "ENVÍO A",
            f"  {order.shipping_recipient}",
            f"  {_shipping_line(order)}",
            "",
            "Consulta tu pedido cuando quieras en este enlace personal:",
            f"  {tracking}",
            "",
            "Si tienes cualquier duda, responde a este correo.",
        ]
    )
    send_mail(
        subject=f"Pedido confirmado — {order.reference}",
        message=body,
        from_email=None,
        recipient_list=[order.email],
        fail_silently=False,
    )


def send_password_reset(*, user, uid: str, token: str) -> None:
    """Enlace de restablecimiento de contraseña. Caduca según `PASSWORD_RESET_TIMEOUT`."""
    link = _frontend_url(f"/restablecer-contrasena/?uid={uid}&token={token}")
    send_mail(
        subject="Restablece tu contraseña",
        message=(
            "Has pedido restablecer tu contraseña. Abre este enlace para elegir una nueva:\n\n"
            f"  {link}\n\n"
            "Si no has sido tú, ignora este mensaje: tu contraseña no cambiará."
        ),
        from_email=None,
        recipient_list=[user.email],
        fail_silently=False,
    )


def send_email_verification(*, user, uid: str, token: str) -> None:
    """Confirmación de que el correo pertenece a quien se registra."""
    link = _frontend_url(f"/verificar-correo/?uid={uid}&token={token}")
    send_mail(
        subject="Confirma tu correo",
        message=(
            "Confirma tu dirección para terminar de crear tu cuenta:\n\n"
            f"  {link}\n\n"
            "Si no te has registrado en Fely Campo, ignora este mensaje."
        ),
        from_email=None,
        recipient_list=[user.email],
        fail_silently=False,
    )


def send_product_enquiry(*, product, name: str, email: str, phone: str, message: str) -> None:
    """Consulta sobre un artículo sin precio."""
    body = "\n".join(
        [
            f"Producto: {product.name} ({product.family.code}-{product.design_code})",
            f"Nombre: {name}",
            f"Email: {email}",
            f"Teléfono: {phone or '—'}",
            "",
            "Mensaje:",
            message,
        ]
    )
    send_mail(
        subject=f"Consulta de producto — {product.name}",
        message=body,
        from_email=None,
        recipient_list=[settings.PRODUCT_ENQUIRY_EMAIL],
        fail_silently=False,
    )


def send_invoice_request(*, order) -> None:
    """
    Solicitud de factura. No se genera PDF: se manda un correo legible a administración con
    los datos del cliente, las líneas y el total, para que la emitan a mano.
    """
    lines = [
        f"  {line.quantity} × {line.sku}  {line.product_name}"
        f" ({line.color_name} / {line.size_code})"
        f"  {gross(line.unit_price_net)} €  →  {gross(line.line_net)} €"
        for line in order.lines.all()
    ]
    body = "\n".join(
        [
            f"Solicitud de factura para el pedido {order.reference}",
            f"Fecha del pedido: {order.created_at:%d/%m/%Y}",
            "",
            "DATOS DEL CLIENTE",
            f"  Nombre / razón social: {order.billing_name or order.shipping_recipient}",
            f"  NIF/CIF: {order.billing_tax_id or '—'}",
            f"  Email: {order.email}",
            f"  Teléfono: {order.phone or '—'}",
            f"  Dirección de facturación: {order.billing_address or _shipping_line(order)}",
            "",
            "LÍNEAS (importes con IVA)",
            *lines,
            "",
            f"  Base imponible: {order.subtotal_net + order.shipping_net} €",
            f"  Envío (sin IVA): {order.shipping_net} €",
            f"  IVA ({order.vat_rate:.0%}): {order.vat_total} €",
            f"  TOTAL: {order.total_gross} {order.currency}",
        ]
    )
    send_mail(
        subject=f"Factura solicitada — pedido {order.reference}",
        message=body,
        from_email=None,
        recipient_list=[settings.INVOICE_REQUEST_EMAIL],
        fail_silently=False,
    )


def send_back_in_stock(*, notification) -> None:
    """Aviso de reposición a quien pidió que le avisaran."""
    variant = notification.variant
    product = variant.colorway.product
    send_mail(
        subject=f"Ya está disponible: {product.name}",
        message=(
            f"{product.name} vuelve a estar disponible en "
            f"{variant.colorway.color.name}, talla {variant.size.code}."
        ),
        from_email=None,
        recipient_list=[notification.email],
        fail_silently=False,
    )


def _shipping_line(order) -> str:
    parts = [
        order.shipping_line1,
        order.shipping_line2,
        f"{order.shipping_postal_code} {order.shipping_city}",
        order.shipping_province,
    ]
    return ", ".join(p for p in parts if p)
