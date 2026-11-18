<?php
    class Notification {
        private PDO $db;

        public function __construct(Database $db) {
            $this->db = $db->getConnection();
        }

        public function getForUser(int $userId, int $limit = 50): array {
            $stmt = $this->db->prepare('
                SELECT id, type, message, target_type, target_id, is_read, created_at
                FROM notifications
                WHERE user_id = :user_id
                ORDER BY id DESC
                LIMIT :limit
            ');
            $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();

            return array_map([$this, 'format'], $stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        public function markRead(int $notificationId, int $userId): bool {
            $stmt = $this->db->prepare('
                UPDATE notifications
                SET is_read = TRUE
                WHERE id = :id AND user_id = :user_id
            ');
            $stmt->execute([
                'id' => $notificationId,
                'user_id' => $userId
            ]);

            return $stmt->rowCount() > 0;
        }

        public function getUnreadCountForUser(int $userId): int {
            $stmt = $this->db->prepare('
                SELECT COUNT(*)
                FROM notifications
                WHERE user_id = :user_id AND is_read = FALSE
            ');
            $stmt->execute(['user_id' => $userId]);

            return (int) $stmt->fetchColumn();
        }

        public function createForAdmins(
            string $type,
            string $message,
            string $targetType,
            int $targetId
        ): void {
            $stmt = $this->db->prepare("
                INSERT INTO notifications (user_id, type, message, target_type, target_id)
                SELECT id, :type, :message, :target_type, :target_id
                FROM users
                WHERE user_type = 'admin' AND status = 'active'
            ");
            $stmt->execute([
                'type' => $type,
                'message' => $message,
                'target_type' => $targetType,
                'target_id' => $targetId
            ]);
        }

        public function createForUser(
            int $userId,
            string $type,
            string $message,
            string $targetType,
            int $targetId
        ): void {
            $stmt = $this->db->prepare('
                INSERT INTO notifications (user_id, type, message, target_type, target_id)
                VALUES (:user_id, :type, :message, :target_type, :target_id)
            ');
            $stmt->execute([
                'user_id' => $userId,
                'type' => $type,
                'message' => $message,
                'target_type' => $targetType,
                'target_id' => $targetId
            ]);
        }

        public function getAfterIdForUser(int $userId, int $lastId): array {
            $stmt = $this->db->prepare('
                SELECT id, type, message, target_type, target_id, is_read, created_at
                FROM notifications
                WHERE user_id = :user_id AND id > :last_id
                ORDER BY id ASC
            ');
            $stmt->execute([
                'user_id' => $userId,
                'last_id' => $lastId
            ]);

            return array_map([$this, 'format'], $stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        private function format(array $notification): array {
            return [
                'id' => (int) $notification['id'],
                'type' => $notification['type'],
                'message' => $notification['message'],
                'target_type' => $notification['target_type'],
                'target_id' => (int) $notification['target_id'],
                'is_read' => (bool) $notification['is_read'],
                'created_at' => $notification['created_at']
            ];
        }
    }
?>
