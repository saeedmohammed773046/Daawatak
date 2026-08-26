FROM php:8.2-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    postgresql-dev \
    oniguruma-dev

# Install PHP extensions for Laravel & PostgreSQL
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pgsql \
    mbstring \
    xml \
    bcmath \
    pcntl \
    opcache

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Environment configuration for Composer
ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_NO_INTERACTION=1 \
    COMPOSER_MEMORY_LIMIT=-1 \
    COMPOSER_PROCESS_TIMEOUT=3600

# Set working directory
WORKDIR /var/www

# Copy composer files first for layer caching
COPY composer.json composer.lock ./

# Install dependencies with timeout extension and automatic retry / fallback
RUN composer config -g process-timeout 3600 \
    && (composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction || \
        (sleep 5 && composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction) || \
        composer install --no-dev --no-scripts --no-autoloader --prefer-source --no-interaction)

# Copy application code
COPY . .

# Complete autoloader
RUN composer dump-autoload --no-dev --optimize

# Set permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

EXPOSE 8000
CMD php artisan config:cache && php artisan route:cache && (php artisan migrate --force || true) && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
