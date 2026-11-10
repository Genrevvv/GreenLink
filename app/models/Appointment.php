<?php
    class Appointment {
        private PDO $db;

        public function __construct(Database $db) {
            $this->db = $db->getConnection();
        }

        public function getAll(): array {
            $sql = '
                SELECT
                    appointments.id,
                    users.username AS customer,
                    users.email,
                    appointments.appointment_date,
                    appointments.appointment_time,
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

        public function addAppointment(int $userId, string $date, string $time, string $purpose, int $visitors, string $notes): int {
            $sql = 'INSERT INTO appointments (user_id, appointment_date, appointment_time, purpose, visitors, notes, status)
                    VALUES (:user_id, :appointment_date, :appointment_time, :purpose, :visitors, :notes, :status)';

            $stmt = $this->db->prepare($sql);

            $stmt->execute([
                'user_id' => $userId,
                'appointment_date' => $date,
                'appointment_time' => $time,
                'purpose' => $purpose,
                'visitors' => $visitors,
                'notes' => $notes,
                'status' => 'Pending'
            ]);

            return (int) $this->db->lastInsertId();
        }

        public function updateStatus(int $id, string $status): void {
            $sql = 'UPDATE appointments SET status = :status WHERE id = :appointment_id';

            $stmt = $this->db->prepare($sql);

            $stmt->execute([
                'status' => $status,
                'appointment_id' => $id
            ]);
        }
    }
?>
