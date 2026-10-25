<?php
class AuthController {
    private User $user;

    public function __construct(User $user) {
        $this->user = $user;
    }

    public function renderLogin() {
        require ROOT . '/public/views/auth/login.html';
    }

    public function renderRegister() {
        require ROOT . '/public/views/auth/register.html';
    }

    public function login() {
        $data = get_json_input();

        $identifier = trim($data['username'] ?? '');
        $password = $data['password'] ?? '';

        if ($identifier === '' || $password === '') {
            json_response([
                'success' => false,
                'message' => 'Please enter your username or email and password.'
            ]);
            return;
        }

        $user = $this->user->findByLoginIdentifier($identifier);

        if (!$user || !password_verify($password, $user['password_hash'])) {
            json_response([
                'success' => false,
                'message' => 'Invalid username/email or password.'
            ]);
            return;
        }

        session_regenerate_id(true);

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['user_type'] = $user['user_type'];

        unset($user['password_hash']);

        json_response([
            'success' => true,
            'message' => 'Login successful.',
            'user' => $user
        ]);
    }

    public function register() {
        $data = get_json_input();

        $username = trim($data['username'] ?? '');
        $email = strtolower(trim($data['email'] ?? ''));
        $password = $data['password'] ?? '';
        $confirmPassword = $data['confirmPassword'] ?? '';

        if (
            $username === '' ||
            $email === '' ||
            $password === '' ||
            $confirmPassword === ''
        ) {
            json_response([
                'success' => false,
                'message' => 'Please complete all fields.'
            ]);
            return;
        }

        if (!preg_match('/^[A-Za-z0-9_.-]{3,50}$/', $username)) {
            json_response([
                'success' => false,
                'message' => 'Username must be 3–50 characters and contain only letters, numbers, underscores, dots, or hyphens.'
            ]);
            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 255) {
            json_response([
                'success' => false,
                'message' => 'Please enter a valid email address.'
            ]);
            return;
        }

        if (strlen($password) < 8) {
            json_response([
                'success' => false,
                'message' => 'Your password must contain at least 8 characters.'
            ]);
            return;
        }

        if ($password !== $confirmPassword) {
            json_response([
                'success' => false,
                'message' => 'Passwords do not match.'
            ]);
            return;
        }

        if ($this->user->usernameExists($username)) {
            json_response([
                'success' => false,
                'message' => 'That username is already taken.'
            ]);
            return;
        }

        if ($this->user->emailExists($email)) {
            json_response([
                'success' => false,
                'message' => 'An account with that email already exists.'
            ]);
            return;
        }

        try {
            if (!$this->user->create($username, $email, $password)) {
                json_response([
                    'success' => false,
                    'message' => 'Registration failed. Please try again.'
                ]);
                return;
            }
        } catch (PDOException $error) {
            error_log('GreenLink registration error: ' . $error->getMessage());

            json_response([
                'success' => false,
                'message' => 'Unable to create your account. Please try again.'
            ]);
            return;
        }

        json_response([
            'success' => true,
            'message' => 'Registration successful! You can now sign in.'
        ]);
    }

    public function logout() {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start();
        }

        session_unset();
        session_destroy();
    }
}
?>
