"""Avisos de reposición: «avísame cuando haya stock»."""

import logging

from django.db.models import F
from django.utils import timezone

from apps.integrations.emails import send_back_in_stock

from .models import StockNotification

logger = logging.getLogger(__name__)


def send_pending_stock_notifications() -> int:
    """
    Avisa a quien pidió que le avisáramos y cuyo artículo ya está disponible.

    `notified_at` marca el aviso como enviado, así que reejecutarlo no reenvía nada. Se
    dispara desde el comando `send_stock_notifications`, que conviene programar cada pocos
    minutos: la reposición se hace a mano desde el admin y no emite ninguna señal.
    """
    pending = StockNotification.objects.filter(
        notified_at__isnull=True,
        variant__is_active=True,
        variant__stock__gt=F("variant__reserved"),
    ).select_related("variant__colorway__product", "variant__colorway__color", "variant__size")

    sent = 0
    for notification in pending:
        try:
            send_back_in_stock(notification=notification)
        except Exception:
            logger.exception("stock_notification_failed", extra={"id": str(notification.id)})
            continue
        notification.notified_at = timezone.now()
        notification.save(update_fields=["notified_at", "updated_at"])
        sent += 1
    return sent
