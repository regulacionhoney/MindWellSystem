#!/bin/sh
set -e

if [ -n "$MYSQL_ATTR_SSL_CA" ]; then
  SSL_ARGS="--ssl-ca=$MYSQL_ATTR_SSL_CA"
else
  SSL_ARGS="--skip-ssl"
fi

MYSQL_OPTS="--host=${DB_HOST:-db} --port=${DB_PORT:-3306} -u${DB_USERNAME:-root} -p${DB_PASSWORD:-rootsecret} ${SSL_ARGS}"

# Best-effort connectivity wait (never blocks the server start forever).
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

# Run migrations + initial seed in the background so the app always starts,
# even if the database is temporarily unreachable. Once the DB is back, the
# loop finishes and the app becomes fully functional without a restart.
(
  i=0
  until php artisan migrate --force --no-interaction; do
    i=$((i + 1))
    if [ "$i" -ge 30 ]; then
      echo "Migrations failed after 30 attempts. Giving up until next restart."
      exit 0
    fi
    echo "  Migrations failed (attempt ${i}), retrying in 60s..."
    sleep 60
  done

  if [ -n "$SKIP_SEED" ] && [ "$SKIP_SEED" = "1" ]; then
    echo "Skipping seed (SKIP_SEED=1)."
  else
    USER_COUNT=$(mysql ${MYSQL_OPTS} -N -e "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "unknown")
    if [ "$USER_COUNT" = "0" ]; then
      echo "Empty database — seeding demo data..."
      php artisan db:seed --force --no-interaction || echo "  Seeding failed (non-fatal)."
    else
      echo "Database already seeded — skipping db:seed."
    fi
  fi
) &

echo "Starting Laravel server on port ${PORT:-8000}..."
exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}" --no-reload