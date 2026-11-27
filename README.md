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

2. Import `schema.sql` into MySQL. It drops and recreates the GreenLink tables,
   permanently deleting their existing data. Back up the database first and use
   this reset script only when you intend to start over.

3. Update the database credentials in `config/config.php` if needed.

To keep data in an existing database, do not import the reset script. Run
`database/migrations/20261127_visit_type_archiving.sql` once instead.

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
