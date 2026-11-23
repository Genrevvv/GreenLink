# GreenLink

GreenLink is a PHP and MySQL application for managing products, appointments,
user accounts, inquiries, and notifications.

## Requirements

- PHP
- MySQL
- Composer

## Setup

1. Install dependencies:

   ```bash
   composer install
   ```

2. Import `schema.sql` into MySQL. This creates the `greenlink` database and
   required tables.

3. Update the database credentials in `config/config.php` if needed.

For an existing database, run the SQL files in `database/migrations/` once.

## Run

Start the web server:

```bash
php -S localhost:8000 -t public public/router.php
```

In a separate terminal, start the notification service:

```bash
php bin/notification-server.php
```

Open [http://localhost:8000](http://localhost:8000).

Signed-in application pages have direct URLs such as `/dashboard`,
`/products`, `/appointments`, `/inquiries`, and `/profile`. API endpoints use
the `/api/...` prefix so page URLs can be loaded or refreshed directly.
