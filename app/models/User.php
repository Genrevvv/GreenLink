
<?php
class User {
    private PDO $db;

    public function __construct(Database $db) {
        $this->db = $db->getConnection();
    }

    public function create(string $username, string $email, string $password): bool {
        $stmt = $this->db->prepare(
            'INSERT INTO users (username, email, password_hash, user_type)
             VALUES (:username, :email, :password_hash, :user_type)'
        );

        return $stmt->execute([
            ':username' => $username,
            ':email' => $email,
            ':password_hash' => password_hash($password, PASSWORD_DEFAULT),
            ':user_type' => 'user'
        ]);
    }

    public function usernameExists(string $username): bool {
        $stmt = $this->db->prepare(
            'SELECT id FROM users WHERE username = :username LIMIT 1'
        );
        $stmt->execute([':username' => $username]);

        return $stmt->fetch(PDO::FETCH_ASSOC) !== false;
    }

    public function emailExists(string $email): bool {
        $stmt = $this->db->prepare(
            'SELECT id FROM users WHERE email = :email LIMIT 1'
        );
        $stmt->execute([':email' => $email]);

        return $stmt->fetch(PDO::FETCH_ASSOC) !== false;
    }

    public function findByLoginIdentifier(string $identifier): ?array {
        $stmt = $this->db->prepare(
            'SELECT id, username, email, password_hash, user_type
             FROM users
             WHERE username = :username OR email = :email
             LIMIT 1'
        );

        $stmt->execute([
            ':username' => $identifier,
            ':email' => $identifier
        ]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        return $user ?: null;
    }
}
?>