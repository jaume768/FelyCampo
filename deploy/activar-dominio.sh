#!/bin/sh
# activar-dominio.sh — pasa la web a su dominio definitivo EN CUANTO el DNS apunte aquí.
#
#   deploy/activar-dominio.sh felycampo.com felycampo.websjfs.com
#
# Pensado para cron, cada minuto (ver docs/DESPLIEGUE.md, «Cambio de dominio»). Mientras
# el DNS de NUEVO no apunte a este servidor, no hace nada. Cuando apunta:
#   1. En .env: DOMAIN=NUEVO y DOMINIOS_REDIRIGIDOS="ANTERIOR www.ANTERIOR" (el dominio
#      anterior pasa a redirigir con 301 al nuevo).
#   2. Recrea Caddy, que pide el certificado de NUEVO y www.NUEVO.
#   3. Comprueba que NUEVO responde por HTTPS y quita su propia entrada de cron.
#
# Por qué esperar al DNS y no poner ya el dominio en Caddy: si Caddy pide el certificado
# antes, Let's Encrypt falla y Caddy espera cada vez más entre reintentos (horas), y el
# dominio nuevo se quedaría sin HTTPS justo después del cambio.
#
# El frontend y Django no se tocan: el navegador llama a la API en el mismo dominio desde
# el que se visita (PUBLIC_API_URL vacía) y backend/.env.prod ya acepta los dos dominios.
set -eu

NUEVO=${1:?Uso: activar-dominio.sh <dominio-nuevo> <dominio-anterior>}
ANTERIOR=${2:?Uso: activar-dominio.sh <dominio-nuevo> <dominio-anterior>}
CRON=/etc/cron.d/felycampo-dominio
REPO=$(cd "$(dirname "$0")/.." && pwd)
cd "$REPO"
COMPOSE="docker compose -f docker-compose.prod.yml"
ahora() { date '+%Y-%m-%d %H:%M:%S'; }

if grep -qx "DOMAIN=$NUEVO" .env; then
	echo "$(ahora) $NUEVO ya es el dominio principal; quito el cron."
	rm -f "$CRON"
	exit 0
fi

# IP pública de esta máquina y la que dan los servidores DNS AUTORITATIVOS del dominio
# (los mismos a los que pregunta Let's Encrypt): sin cachés de por medio.
MI_IP=$(ip -4 route get 1.1.1.1 | awk '{for (i = 1; i < NF; i++) if ($i == "src") print $(i + 1)}')
NS=$(dig +short NS "$NUEVO" | head -n 1)
[ -n "$NS" ] || exit 0
IP_DNS=$(dig +short @"$NS" "$NUEVO" A | tail -n 1)
IP_WWW=$(dig +short @"$NS" "www.$NUEVO" A | tail -n 1)
if [ "$IP_DNS" != "$MI_IP" ]; then
	exit 0 # Todavía no: silencio, para no llenar el log cada minuto.
fi
echo "$(ahora) $NUEVO ya apunta aquí ($MI_IP, según $NS; www: ${IP_WWW:-?}). Activando."

cp .env ".env.antes-de-$NUEVO"
sed -i "s/^DOMAIN=.*/DOMAIN=$NUEVO/" .env
if grep -q '^DOMINIOS_REDIRIGIDOS=' .env; then
	sed -i "s/^DOMINIOS_REDIRIGIDOS=.*/DOMINIOS_REDIRIGIDOS=\"$ANTERIOR www.$ANTERIOR\"/" .env
else
	echo "DOMINIOS_REDIRIGIDOS=\"$ANTERIOR www.$ANTERIOR\"" >> .env
fi
$COMPOSE up -d caddy

# Hasta 5 minutos para que Caddy saque el certificado.
i=0
while [ $i -lt 30 ]; do
	codigo=$(curl -s -o /dev/null -w '%{http_code}' --resolve "$NUEVO:443:127.0.0.1" "https://$NUEVO/robots.txt" || true)
	if [ "$codigo" = 200 ]; then
		echo "$(ahora) OK: https://$NUEVO responde ($codigo). Quito el cron."
		rm -f "$CRON"
		exit 0
	fi
	i=$((i + 1))
	sleep 10
done
echo "$(ahora) AVISO: $NUEVO aún no responde por HTTPS (último código: $codigo)." \
	"El cambio está hecho y Caddy sigue reintentando el certificado solo." \
	"Mirar: $COMPOSE logs caddy. Quito el cron."
rm -f "$CRON"
exit 1
