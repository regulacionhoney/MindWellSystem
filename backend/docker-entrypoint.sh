#!/bin/sh
set -e

if [ -n "$MYSQL_ATTR_SSL_CA" ]; then
  SSL_ARGS="--ssl-ca=$MYSQL_ATTR_SSL_CA"
else
  SSL_ARGS="--skip-ssl"
fi

if [ -z "$SKIP_DB_WAIT" ] || [ "$SKIP_DB_WAIT" = "0" ]; then
  echo "Waiting for MySQL at ${DB_HOST:-db}:${DB_PORT:-3306}..."
  MYSQL_OPTS="--host=${DB_HOST:-db} --port=${DB_PORT:-3306} -u${DB_USERNAME:-root} -p${DB_PASSWORD:-rootsecret} ${SSL_ARGS}"
else
  echo "Skipping DB wait (SKIP_DB_WAIT=${SKIP_DB_WAIT})."
  MYSQL_OPTS="--host=${DB_HOST:-db} --port=${DB_PORT:-3306} -u${DB_USERNAME:-root} -p${DB_PASSWORD:-rootsecret} ${SSL_ARGS}"
fi

i=0
until mysqladmin ping --silent ${MYSQL_OPTS} 2>/dev/null; do
  i=$((i + 1))
  if [ "$i" -ge 60 ]; then
    echo "MySQL not reachable after 120s. Continuing anyway..."
    break
  fi
  echo "  MySQL not ready yet (${i}), retrying in 2s..."
  sleep 2
done

echo "Running migrations..."
php artisan migrate --force

if [ -n "$SKIP_SEED" ] && [ "$SKIP_SEED" = "1" ]; then
  echo "Skipping seed (SKIP_SEED=1)."
else
  USER_COUNT=$(mysql ${MYSQL_OPTS} -N -e "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "unknown")
  if [ "$USER_COUNT" = "0" ]; then
    echo "Empty database — seeding demo data..."
    php artisan db:seed --force --no-interaction
  else
    echo "Database already seeded — skipping db:seed."
  fi
fi

echo "Starting Laravel server on port ${PORT:-8000}..."
exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}" --no-reload