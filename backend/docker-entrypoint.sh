#!/bin/sh
set -e

echo "Waiting for MySQL at ${DB_HOST:-db}:${DB_PORT:-3306}..."

until mysqladmin ping --silent --skip-ssl --host="${DB_HOST:-db}" --port="${DB_PORT:-3306}" -uroot -p"${MYSQL_ROOT_PASSWORD:-rootsecret}" 2>/dev/null; do
  echo "  MySQL not ready yet, retrying in 2s..."
  sleep 2
done

echo "MySQL is up. Running migrations..."
php artisan migrate --force
php artisan db:seed --force

echo "Starting Laravel server..."
exec php artisan serve --host=0.0.0.0 --port=8000 --no-reload