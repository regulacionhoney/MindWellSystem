#!/bin/sh
set -e

if [ -z "$SKIP_DB_WAIT" ] || [ "$SKIP_DB_WAIT" = "0" ]; then
  echo "Waiting for MySQL at ${DB_HOST:-db}:${DB_PORT:-3306}..."
  i=0
  until mysqladmin ping --silent --skip-ssl \
    --host="${DB_HOST:-db}" --port="${DB_PORT:-3306}" \
    -u"${DB_USERNAME:-root}" -p"${DB_PASSWORD:-rootsecret}" 2>/dev/null; do
    i=$((i + 1))
    if [ "$i" -ge 60 ]; then
      echo "MySQL not reachable after 120s. Continuing anyway..."
      break
    fi
    echo "  MySQL not ready yet (${i}), retrying in 2s..."
    sleep 2
  done
else
  echo "Skipping DB wait (SKIP_DB_WAIT=${SKIP_DB_WAIT})."
fi

echo "Running migrations..."
php artisan migrate --force
php artisan db:seed --force

echo "Starting Laravel server on port ${PORT:-8000}..."
exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}" --no-reload