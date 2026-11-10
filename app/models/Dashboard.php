<?php
    class Dashboard {
        private PDO $db;

        public function __construct(Database $db) {
            $this->db = $db->getConnection();
        }

        // ADMIN DASHBOARD
        public function getProductSummary(): array {
            $sql = '
                SELECT
                    COUNT(*) AS total_products,
                    COALESCE(SUM(in_stock = 1), 0) AS in_stock,
                    COALESCE(SUM(in_stock = 0), 0) AS out_of_stock
                FROM products
                WHERE is_archived = 0
            ';

            $stmt = $this->db->prepare($sql);
            $stmt->execute();

            return $stmt->fetch(PDO::FETCH_ASSOC);
        }

        public function getOutOfStockProducts(): array {
            $sql = '
                SELECT
                    id,
                    name,
                    category
                FROM products
                WHERE is_archived = 0 AND in_stock = 0
                ORDER BY name ASC
            ';

            $stmt = $this->db->prepare($sql);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        public function getUpcomingAppointments(int $limit): array {
            $sql = '
                SELECT
                    appointments.id,
                    users.username AS customer,
                    appointments.appointment_date,
                    appointments.appointment_time,
                    appointments.purpose,
                    appointments.status
                FROM appointments
                INNER JOIN users ON users.id = appointments.user_id
                WHERE appointments.appointment_date >= CURDATE()
                    AND appointments.status <> :rejected
                ORDER BY appointments.appointment_date ASC, appointments.appointment_time ASC
                LIMIT :limit
            ';

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue('rejected', 'Rejected');
            $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        // USER DASHBOARD
        public function getUserAppointments(int $userId): array {
            $sql = '
                SELECT
                    id,
                    appointment_date,
                    appointment_time,
                    purpose,
                    visitors,
                    status
                FROM appointments
                WHERE user_id = :user_id
                ORDER BY appointment_date ASC, appointment_time ASC
            ';

            $stmt = $this->db->prepare($sql);
            $stmt->execute(['user_id' => $userId]);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        public function getUserInquiries(int $userId): array {
            $sql = '
                SELECT
                    id,
                    subject,
                    status,
                    created_at
                FROM inquiries
                WHERE user_id = :user_id
                ORDER BY created_at DESC, id DESC
            ';

            $stmt = $this->db->prepare($sql);
            $stmt->execute(['user_id' => $userId]);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        public function getActiveProducts(int $limit): array {
            $sql = '
                SELECT
                    id,
                    name,
                    category,
                    in_stock
                FROM products
                WHERE is_archived = 0
                ORDER BY id DESC
                LIMIT :limit
            ';

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    }
?>
