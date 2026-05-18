FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
        libssl-dev pkg-config git unzip \
    && pecl install mongodb \
    && docker-php-ext-enable mongodb \
    && curl -sS https://getcomposer.org/installer | \
       php -- --install-dir=/usr/local/bin --filename=composer \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

COPY composer.json composer.lock* ./
RUN composer install --no-interaction --no-dev --prefer-dist

CMD ["php", "-S", "0.0.0.0:8080", "-t", "public"]
