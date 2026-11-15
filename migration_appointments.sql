-- Appointments update migration
-- Run this once on a database whose `appointments` table was created from the
-- previous schema.sql. A fresh install only needs schema.sql.

USE greenlink;

-- 1. Estimated visit duration (minutes) for each appointment.
--    Existing rows default to 60 minutes.
ALTER TABLE appointments
    ADD COLUMN duration_minutes INT NOT NULL DEFAULT 60 AFTER appointment_time;

-- 2. Allow the new 'Cancelled' status so cancelled appointments are kept instead of deleted.
--    The old CHECK constraint was unnamed, so MySQL named it `appointments_chk_1`.
--    If this line fails, run SHOW CREATE TABLE appointments; and use the name shown there.
ALTER TABLE appointments DROP CHECK appointments_chk_1;

ALTER TABLE appointments
    ADD CONSTRAINT appointments_status_check
    CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Cancelled'));
