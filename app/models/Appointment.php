<?php
    class Appointment {
        private PDO $db;
        private Notification $notification;

        public function __construct(Database $db, Notification $notification) {
            $this->db = $db->getConnection();
            $this->notification = $notification;
        }

        public function getAll(): array {
            $sql = '
                SELECT
                    appointments.id,
                    users.username AS customer,
                    users.email,
                    appointments.appointment_date,
                    appointments.appointment_time,
                    appointments.duration_minutes,
                    appointments.purpose,
                    appointments.visitors,
                    appointments.notes,
                    appointments.status
                FROM appointments
                INNER JOIN users ON users.id = appointments.user_id
                ORDER BY appointments.appointment_date ASC, appointments.appointment_time ASC
            ';

            $stmt = $this->db->prepare($sql);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        public function getByUser(int $userId): array {
            $sql = '
                SELECT
                    id,
                    appointment_date,
                    appointment_time,
                    duration_minutes,
                    purpose,
                    visitors,
                    notes,
                    status
                FROM appointments
                WHERE user_id = :user_id
                ORDER BY appointment_date ASC, appointment_time ASC
            ';

            $stmt = $this->db->prepare($sql);
            $stmt->execute(['user_id' => $userId]);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        public function getById(int $id): ?array {
            $sql = '
                SELECT
                    id,
                    user_id,
                    appointment_date,
                    appointment_time,
                    duration_minutes,
                    purpose,
                    visitors,
                    status
                FROM appointments
                WHERE id = :appointment_id
            ';

            $stmt = $this->db->prepare($sql);
            $stmt->execute(['appointment_id' => $id]);

            $appointment = $stmt->fetch(PDO::FETCH_ASSOC);

            return $appointment ?: null;
        }

        // Pending and Approved appointments still hold their time slot.
        // Rejected and Cancelled appointments are kept as records but free the slot.
        public function getScheduled(string $fromDate): array {
            $sql = "
                SELECT
                    id,
                    appointment_date,
                    appointment_time,
                    duration_minutes,
                    visitors
                FROM appointments
                WHERE appointment_date >= :from_date
                    AND status IN ('Pending', 'Approved')
                ORDER BY appointment_date ASC, appointment_time ASC
            ";

            $stmt = $this->db->prepare($sql);
            $stmt->execute(['from_date' => $fromDate]);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        public function getScheduledByDate(string $date): array {
            $sql = "
                SELECT
                    id,
                    appointment_time,
                    duration_minutes,
                    visitors
                FROM appointments
                WHERE appointment_date = :appointment_date
                    AND status IN ('Pending', 'Approved')
            ";

            $stmt = $this->db->prepare($sql);
            $stmt->execute(['appointment_date' => $date]);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        public function addAppointment(int $userId, string $date, string $time, int $duration, string $purpose, int $visitors, string $notes): int {
            $sql = 'INSERT INTO appointments (user_id, appointment_date, appointment_time, duration_minutes, purpose, visitors, notes, status)
                    VALUES (:user_id, :appointment_date, :appointment_time, :duration_minutes, :purpose, :visitors, :notes, :status)';

            $this->db->beginTransaction();

            try {
                $stmt = $this->db->prepare($sql);
                $stmt->execute([
                    'user_id' => $userId,
                    'appointment_date' => $date,
                    'appointment_time' => $time,
                    'duration_minutes' => $duration,
                    'purpose' => $purpose,
                    'visitors' => $visitors,
                    'notes' => $notes,
                    'status' => 'Pending'
                ]);

                $appointmentId = (int) $this->db->lastInsertId();
                $this->notification->createForAdmins(
                    'appointment_request',
                    'A new appointment request was submitted.',
                    'appointment',
                    $appointmentId
                );
                $this->db->commit();

                return $appointmentId;
            } catch (Throwable $e) {
                if ($this->db->inTransaction()) {
                    $this->db->rollBack();
                }
                throw $e;
            }
        }

        // A reschedule by the owner goes back to the admins for review; one by an admin is sent to the owner.
        public function reschedule(int $id, string $date, string $time, int $duration, string $status, bool $byAdmin): void {
            $this->db->beginTransaction();

            try {
                $stmt = $this->db->prepare('
                    SELECT user_id
                    FROM appointments
                    WHERE id = :appointment_id
                    FOR UPDATE
                ');
                $stmt->execute(['appointment_id' => $id]);
                $userId = $stmt->fetchColumn();

                if ($userId === false) {
                    throw new RuntimeException('Appointment not found while rescheduling.');
                }

                $stmt = $this->db->prepare('
                    UPDATE appointments
                    SET appointment_date = :appointment_date,
                        appointment_time = :appointment_time,
                        duration_minutes = :duration_minutes,
                        status = :status
                    WHERE id = :appointment_id
                ');
                $stmt->execute([
                    'appointment_date' => $date,
                    'appointment_time' => $time,
                    'duration_minutes' => $duration,
                    'status' => $status,
                    'appointment_id' => $id
                ]);

                if ($byAdmin) {
                    $this->notification->createForUser(
                        (int) $userId,
                        'appointment_status',
                        'Your appointment was rescheduled to ' . $date . '.',
                        'appointment',
                        $id
                    );
                } else {
                    $this->notification->createForAdmins(
                        'appointment_request',
                        'An appointment was rescheduled and needs review.',
                        'appointment',
                        $id
                    );
                }

                $this->db->commit();
            } catch (Throwable $e) {
                if ($this->db->inTransaction()) {
                    $this->db->rollBack();
                }
                throw $e;
            }
        }

        public function updateStatus(int $id, string $status): void {
            $this->db->beginTransaction();

            try {
                $stmt = $this->db->prepare('
                    SELECT user_id
                    FROM appointments
                    WHERE id = :appointment_id
                    FOR UPDATE
                ');
                $stmt->execute(['appointment_id' => $id]);
                $userId = $stmt->fetchColumn();

                if ($userId === false) {
                    throw new RuntimeException('Appointment not found while updating its status.');
                }

                $stmt = $this->db->prepare('
                    UPDATE appointments
                    SET status = :status
                    WHERE id = :appointment_id
                ');
                $stmt->execute([
                    'status' => $status,
                    'appointment_id' => $id
                ]);

                if (in_array($status, ['Approved', 'Rejected'], true)) {
                    $this->notification->createForUser(
                        (int) $userId,
                        'appointment_status',
                        'Your appointment request was ' . strtolower($status) . '.',
                        'appointment',
                        $id
                    );
                }

                $this->db->commit();
            } catch (Throwable $e) {
                if ($this->db->inTransaction()) {
                    $this->db->rollBack();
                }
                throw $e;
            }
        }
    }
?>
