#!/bin/bash
set -e

echo "==> Starting Widal API..."

# Generate app key if not set
if [ -z "$APP_KEY" ]; then
    echo "==> Generating application key..."
    php artisan key:generate --force
fi

# Run migrations if DB is configured
if [ -n "$DB_HOST" ] && [ "$DB_HOST" != "null" ]; then
    echo "==> Running migrations..."
    php artisan migrate --force || echo "Migration skipped (DB not ready)"
fi

# Cache config & routes for production
if [ "$APP_ENV" = "production" ]; then
    echo "==> Caching config and routes..."
    php artisan config:cache
    php artisan route:cache
fi

# Fix permissions
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

echo "==> Starting supervisord..."
exec /usr/bin/supervisord -c /etc/supervisord.conf
