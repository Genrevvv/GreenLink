<?php
    use Ratchet\ConnectionInterface;
    use Ratchet\MessageComponentInterface;
    use React\EventLoop\LoopInterface;

    class NotificationWebSocket implements MessageComponentInterface {
        private Notification $notification;
        private SplObjectStorage $connections;
        private string $appOrigin;

        public function __construct(Notification $notification, LoopInterface $loop, string $appOrigin) {
            $this->notification = $notification;
            $this->connections = new SplObjectStorage();
            $this->appOrigin = rtrim($appOrigin, '/');

            $loop->addPeriodicTimer(1, function (): void {
                foreach ($this->connections as $connection) {
                    $state = $this->connections[$connection];

                    if (!$state['subscribed']) {
                        continue;
                    }

                    try {
                        $newNotifications = $this->notification->getAfterIdForUser(
                            $state['user_id'],
                            $state['last_id']
                        );

                        foreach ($newNotifications as $notification) {
                            $connection->send(json_encode([
                                'type' => 'notification',
                                'notification' => $notification
                            ], JSON_THROW_ON_ERROR));
                            $state['last_id'] = $notification['id'];
                        }

                        $this->connections[$connection] = $state;
                    } catch (Throwable $e) {
                        error_log('Notification WebSocket delivery failed: ' . $e->getMessage());
                    }
                }
            });
        }

        public function onOpen(ConnectionInterface $connection): void {
            $userId = $this->getAuthenticatedUserId($connection);

            if ($userId <= 0) {
                $connection->close();
                return;
            }

            try {
                $this->connections->attach($connection, [
                    'user_id' => $userId,
                    'last_id' => 0,
                    'subscribed' => false
                ]);
            } catch (Throwable $e) {
                error_log('Notification WebSocket connection failed: ' . $e->getMessage());
                $connection->close();
            }
        }

        public function onMessage(ConnectionInterface $from, $message): void {
            if (!$this->connections->contains($from)) {
                $from->close();
                return;
            }

            try {
                $data = json_decode((string) $message, true, 512, JSON_THROW_ON_ERROR);
                $state = $this->connections[$from];

                if (
                    $state['subscribed'] ||
                    !is_array($data) ||
                    ($data['type'] ?? '') !== 'subscribe' ||
                    !isset($data['after_id']) ||
                    !is_int($data['after_id']) ||
                    $data['after_id'] < 0
                ) {
                    $from->close();
                    return;
                }

                $state['last_id'] = $data['after_id'];
                $state['subscribed'] = true;
                $this->connections[$from] = $state;
            } catch (Throwable $e) {
                error_log('Invalid notification WebSocket message: ' . $e->getMessage());
                $from->close();
            }
        }

        public function onClose(ConnectionInterface $connection): void {
            if ($this->connections->contains($connection)) {
                $this->connections->detach($connection);
            }
        }

        public function onError(ConnectionInterface $connection, \Exception $exception): void {
            error_log('Notification WebSocket error: ' . $exception->getMessage());
            $connection->close();
        }

        private function getAuthenticatedUserId(ConnectionInterface $connection): int {
            if (!isset($connection->httpRequest)) {
                return 0;
            }

            $request = $connection->httpRequest;
            $origin = parse_url($request->getHeaderLine('Origin'));
            $configuredOrigin = parse_url($this->appOrigin);

            if (
                !is_array($origin) ||
                !is_array($configuredOrigin) ||
                empty($origin['host']) ||
                empty($configuredOrigin['host']) ||
                !in_array($origin['scheme'] ?? '', ['http', 'https'], true) ||
                strcasecmp($origin['scheme'], $configuredOrigin['scheme'] ?? '') !== 0 ||
                strcasecmp($origin['host'], $configuredOrigin['host']) !== 0 ||
                ($origin['port'] ?? null) !== ($configuredOrigin['port'] ?? null)
            ) {
                return 0;
            }

            $sessionId = null;
            foreach (explode(';', $request->getHeaderLine('Cookie')) as $cookie) {
                $parts = explode('=', trim($cookie), 2);

                if (count($parts) === 2 && $parts[0] === session_name()) {
                    $sessionId = rawurldecode($parts[1]);
                    break;
                }
            }

            if (!$sessionId || !preg_match('/^[a-zA-Z0-9,-]{1,128}$/', $sessionId)) {
                return 0;
            }

            session_id($sessionId);
            if (!session_start()) {
                session_id('');
                return 0;
            }

            $userId = (int) ($_SESSION['user_id'] ?? 0);
            session_write_close();
            session_id('');
            $_SESSION = [];

            return $userId;
        }
    }
?>
