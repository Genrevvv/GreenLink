<?php
    class Inquiry {
        private PDO $db;
        private Notification $notification;

        public function __construct(Database $db, Notification $notification) {
            $this->db = $db->getConnection();
            $this->notification = $notification;
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

            $this->db->beginTransaction();

            try {
                $stmt = $this->db->prepare($sql);
                $stmt->execute([
                    'user_id' => $userId,
                    'subject' => $subject,
                    'message' => $message,
                    'status' => 'Pending'
                ]);

                $inquiryId = (int) $this->db->lastInsertId();
                $this->notification->createForAdmins(
                    'inquiry_request',
                    'A new inquiry was submitted.',
                    'inquiry',
                    $inquiryId
                );
                $this->db->commit();

                return $inquiryId;
            } catch (Throwable $e) {
                if ($this->db->inTransaction()) {
                    $this->db->rollBack();
                }
                throw $e;
            }
        }

        public function replyInquiry(int $id, string $response): void {
            $this->db->beginTransaction();

            try {
                $stmt = $this->db->prepare('
                    SELECT user_id
                    FROM inquiries
                    WHERE id = :inquiry_id
                    FOR UPDATE
                ');
                $stmt->execute(['inquiry_id' => $id]);
                $userId = $stmt->fetchColumn();

                if ($userId === false) {
                    throw new RuntimeException('Inquiry not found while sending its response.');
                }

                $stmt = $this->db->prepare('
                    UPDATE inquiries
                    SET response = :response,
                        status = :status,
                        responded_at = CURRENT_TIMESTAMP
                    WHERE id = :inquiry_id
                ');
                $stmt->execute([
                    'response' => $response,
                    'status' => 'Responded',
                    'inquiry_id' => $id
                ]);

                $this->notification->createForUser(
                    (int) $userId,
                    'inquiry_response',
                    'Your inquiry has received a response.',
                    'inquiry',
                    $id
                );

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
