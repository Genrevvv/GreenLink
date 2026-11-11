<?php
    class User {
        private PDO $db;

        public function __construct(Database $db) {
            $this->db = $db->getConnection();
        }

        // Create a new user account.
        public function create(string $username, string $email, string $password): bool {
            $stmt = $this->db->prepare('
                INSERT INTO users (username, email, password_hash, user_type)
                VALUES (:username, :email, :password_hash, :user_type)
            ');

            return $stmt->execute([
                ':username' => $username,
                ':email' => $email,
                ':password_hash' => password_hash($password, PASSWORD_DEFAULT),
                ':user_type' => 'user'
            ]);
        }

        // Check whether a username already exists.
        public function exists(string $username): bool {
            $stmt = $this->db->prepare('
                SELECT id
                FROM users
                WHERE username = :username
                LIMIT 1
            ');

            $stmt->execute([':username' => $username]);

            return $stmt->fetch() !== false;
        }

        // Check whether an email address is already registered.
        public function existsByEmail(string $email): bool {
            $stmt = $this->db->prepare('
                SELECT id
                FROM users
                WHERE email = :email
                LIMIT 1
            ');

            $stmt->execute([':email' => $email]);

            return $stmt->fetch() !== false;
        }

        // Find a user using their username or email address.
        public function findByUsername(string $username) {
            $stmt = $this->db->prepare('
                SELECT id, username, email, password_hash, user_type
                FROM users
                WHERE username = :identifier
                   OR email = :identifier
                LIMIT 1
            ');

            $stmt->execute([':identifier' => $username]);

            return $stmt->fetch(PDO::FETCH_ASSOC);
        }

        // Find a user using their registered email address.
        public function findByEmail(string $email) {
            $stmt = $this->db->prepare('
                SELECT id, username, email
                FROM users
                WHERE email = :email
                LIMIT 1
            ');

            $stmt->execute([':email' => $email]);

            return $stmt->fetch(PDO::FETCH_ASSOC);
        }

        // Save the hashed reset token and its expiration time.
        public function savePasswordResetToken(
            string $email,
            string $tokenHash,
            string $expiresAt
        ): bool {
            $stmt = $this->db->prepare('
                UPDATE users
                SET reset_token_hash = :token_hash,
                    reset_token_expires_at = :expires_at
                WHERE email = :email
            ');

            return $stmt->execute([
                ':token_hash' => $tokenHash,
                ':expires_at' => $expiresAt,
                ':email' => $email
            ]);
        }

        // Find a user with a matching, unexpired reset token.
        // Uses UTC to match the expiration timestamp.
        public function findByResetToken(string $tokenHash) {
            $stmt = $this->db->prepare('
                SELECT id, username, email
                FROM users
                WHERE reset_token_hash = :token_hash
                  AND reset_token_expires_at > UTC_TIMESTAMP()
                LIMIT 1
            ');

            $stmt->execute([':token_hash' => $tokenHash]);

            return $stmt->fetch(PDO::FETCH_ASSOC);
        }

        // Update the password and invalidate the reset token.
        public function resetPassword(
            string $tokenHash,
            string $newPassword
        ): bool {
            $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);

            $stmt = $this->db->prepare('
                UPDATE users
                SET password_hash = :password_hash,
                    reset_token_hash = NULL,
                    reset_token_expires_at = NULL
                WHERE reset_token_hash = :token_hash
                  AND reset_token_expires_at > UTC_TIMESTAMP()
            ');

            $stmt->execute([
                ':password_hash' => $passwordHash,
                ':token_hash' => $tokenHash
            ]);

            return $stmt->rowCount() === 1;
        }
    }
?>
