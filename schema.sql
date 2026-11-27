-- DESTRUCTIVE RESET: this script deletes all GreenLink table data before
-- recreating the schema. Back up the database before running it.

CREATE DATABASE IF NOT EXISTS greenlink;

USE greenlink;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS inquiries;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS unavailable_periods;
DROP TABLE IF EXISTS appointment_type_rules;
DROP TABLE IF EXISTS scheduling_settings;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) CHECK (user_type IN ('user', 'admin')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
    reset_token_hash CHAR(64) NULL DEFAULT NULL,
    reset_token_expires_at DATETIME NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_reset_token_hash (reset_token_hash)
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Vegetables',
    description VARCHAR(255) NOT NULL,
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    purpose VARCHAR(100) NOT NULL,
    visitors INT NOT NULL DEFAULT 1,
    notes VARCHAR(255) NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    CONSTRAINT appointments_status_check
        CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS inquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    response TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Responded')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(30) NOT NULL,
    message VARCHAR(255) NOT NULL,
    target_type VARCHAR(20) NOT NULL,
    target_id INT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX notifications_user_created_idx (user_id, id),
    INDEX notifications_user_unread_idx (user_id, is_read, id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- APPOINTMENT SCHEDULING
-- Every scheduling value below starts as NULL (not configured). While a required
-- value is NULL the booking form shows "scheduling not configured" and the API
-- refuses to book. After installing the schema, an admin can configure these
-- values in Appointments > Booking Setup.

-- One row (id = 1) of farm-wide settings.
CREATE TABLE IF NOT EXISTS scheduling_settings (
    id INT PRIMARY KEY,
    open_time TIME NULL DEFAULT NULL,              -- PLACEHOLDER: farm opening time
    close_time TIME NULL DEFAULT NULL,             -- PLACEHOLDER: farm closing time
    slot_interval_minutes INT NULL DEFAULT NULL,   -- PLACEHOLDER: start times are offered every N minutes from open_time
    half_day_split_time TIME NULL DEFAULT NULL,    -- PLACEHOLDER: where the morning half-day ends and the afternoon half-day starts (needed only if a type allows half_day)
    visitor_capacity INT NULL DEFAULT NULL,        -- PLACEHOLDER: max total visitors on the farm at the same time
    CONSTRAINT scheduling_settings_single_row CHECK (id = 1)
);

INSERT IGNORE INTO scheduling_settings (id) VALUES (1);

-- Restrictions per appointment type. purpose matches appointments.purpose and
-- the purposes listed here are the ones offered in the booking form.
CREATE TABLE IF NOT EXISTS appointment_type_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purpose VARCHAR(100) NOT NULL UNIQUE,
    allowed_durations VARCHAR(50) NULL DEFAULT NULL,  -- PLACEHOLDER: comma list of hourly, half_day, whole_day
    min_duration_minutes INT NULL DEFAULT NULL,       -- optional: NULL means no minimum
    max_duration_minutes INT NULL DEFAULT NULL,       -- optional: NULL means no maximum
    allowed_days VARCHAR(20) NULL DEFAULT NULL,       -- PLACEHOLDER: comma list of ISO weekdays, 1 = Monday ... 7 = Sunday
    min_advance_hours INT NULL DEFAULT NULL,          -- PLACEHOLDER: how many hours ahead a visit must be booked (0 = no notice needed)
    max_visitors INT NULL DEFAULT NULL,               -- PLACEHOLDER: max visitors for one appointment of this type
    is_active BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT IGNORE INTO appointment_type_rules (purpose) VALUES
    ('Farm Tour'),
    ('Educational Visit'),
    ('Training Inquiry'),
    ('Other');

-- Dates or time periods the admin has blocked. start_time and end_time are both
-- NULL when the whole date is unavailable.
CREATE TABLE IF NOT EXISTS unavailable_periods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unavailable_date DATE NOT NULL,
    start_time TIME NULL DEFAULT NULL,
    end_time TIME NULL DEFAULT NULL,
    reason VARCHAR(255) NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX unavailable_periods_date_idx (unavailable_date),
    CONSTRAINT unavailable_periods_time_check
        CHECK ((start_time IS NULL AND end_time IS NULL) OR (start_time < end_time))
);
