<?php
    class Inquiry {
        private PDO $db;

        public function __construct(Database $db) {
            $this->db = $db->getConnection();
        }

        public function getAll(): array {
            $sql = '
                SELECT
                    inquiries.id,
                    users.username AS customer,
                    users.email,
                    inquiries.subject,
                    inquiries.message,
                    inquiries.response,
                    inquiries.status,
                    inquiries.created_at
                FROM inquiries
                INNER JOIN users ON users.id = inquiries.user_id
                ORDER BY inquiries.created_at DESC, inquiries.id DESC
            ';

            $stmt = $this->db->prepare($sql);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        public function getByUser(int $userId): array {
            $sql = '
                SELECT
                    id,
                    subject,
                    message,
                    response,
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

        public function addInquiry(int $userId, string $subject, string $message): int {
            $sql = 'INSERT INTO inquiries (user_id, subject, message, status)
                    VALUES (:user_id, :subject, :message, :status)';

            $stmt = $this->db->prepare($sql);

            $stmt->execute([
                'user_id' => $userId,
                'subject' => $subject,
                'message' => $message,
                'status' => 'Pending'
            ]);

            return (int) $this->db->lastInsertId();
        }

        public function replyInquiry(int $id, string $response): void {
            $sql = 'UPDATE inquiries
                    SET response = :response,
                        status = :status,
                        responded_at = CURRENT_TIMESTAMP
                    WHERE id = :inquiry_id';

            $stmt = $this->db->prepare($sql);

            $stmt->execute([
                'response' => $response,
                'status' => 'Responded',
                'inquiry_id' => $id
            ]);
        }
    }
?>
