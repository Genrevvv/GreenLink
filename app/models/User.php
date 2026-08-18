<?php
    class User {
        private PDO $db;

        public function __construct(Database $db)
        {
            $this->db = $db->getConnection();
        }

        public function create(string $username, string $password): bool {
            $stmt = $this->db->prepare(
                'INSERT INTO users (username, password_hash) VALUES (:username, :password_hash)'
            );

            return $stmt->execute([
                ':username' => $username,
                ':password_hash' => password_hash($password, PASSWORD_DEFAULT)
            ]);
        }

        public function exists(string $username): bool {
            $stmt = $this->db->prepare('SELECT id FROM users WHERE username = :username');
            $stmt->execute([':username' => $username]);

            return $stmt->fetch() !== false;
        }

        public function findByUsername(string $username) {
            $stmt = $this->db->prepare(
                'SELECT id, username, password_hash
                FROM users 
                WHERE username = ? 
                LIMIT 1'
            );

            $stmt->execute([$username]);

            return $stmt->fetch(PDO::FETCH_ASSOC);
        }
    }
?>