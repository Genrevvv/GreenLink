<?php
    class NotificationController {
        private Notification $notification;

        public function __construct(Notification $notification) {
            $this->notification = $notification;
        }

        public function getForCurrentUser(): void {
            $userId = (int) ($_SESSION['user_id'] ?? 0);

            if ($userId <= 0) {
                json_response([
                    'success' => false,
                    'message' => 'Please sign in to view your notifications.'
                ]);
                return;
            }

            try {
                json_response([
                    'success' => true,
                    'notifications' => $this->notification->getForUser($userId),
                    'unread_count' => $this->notification->getUnreadCountForUser($userId)
                ]);
            } catch (Throwable $e) {
                error_log('Failed to retrieve notifications: ' . $e->getMessage());
                json_response([
                    'success' => false,
                    'message' => 'Failed to retrieve notifications.'
                ]);
            }
        }

        public function markRead(): void {
            $userId = (int) ($_SESSION['user_id'] ?? 0);
            $data = get_json_input();
            $notificationId = (int) ($data['id'] ?? 0);

            if ($userId <= 0) {
                json_response([
                    'success' => false,
                    'message' => 'Please sign in to update notifications.'
                ]);
                return;
            }

            if ($notificationId <= 0) {
                json_response([
                    'success' => false,
                    'message' => 'Please provide a valid notification.'
                ]);
                return;
            }

            try {
                if (!$this->notification->markRead($notificationId, $userId)) {
                    json_response([
                        'success' => false,
                        'message' => 'Notification not found.'
                    ]);
                    return;
                }

                json_response(['success' => true]);
            } catch (Throwable $e) {
                error_log('Failed to update notification: ' . $e->getMessage());
                json_response([
                    'success' => false,
                    'message' => 'Failed to update notification.'
                ]);
            }
        }

        public function markAllRead(): void {
            $userId = (int) ($_SESSION['user_id'] ?? 0);

            if ($userId <= 0) {
                json_response([
                    'success' => false,
                    'message' => 'Please sign in to update notifications.'
                ]);
                return;
            }

            try {
                $updatedCount = $this->notification->markAllReadForUser($userId);
                json_response([
                    'success' => true,
                    'updated_count' => $updatedCount
                ]);
            } catch (Throwable $e) {
                error_log('Failed to mark all notifications as read: ' . $e->getMessage());
                json_response([
                    'success' => false,
                    'message' => 'Failed to update notifications.'
                ]);
            }
        }
    }
?>
