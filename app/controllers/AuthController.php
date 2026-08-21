<?php
    class AuthController {
        private User $user;

        public function __construct(User $user) {
            $this->user = $user;
        }

        public function renderLogin() {
            require ROOT . '/app/views/auth/login.html';
        }

        public function renderRegister() {
            require ROOT . '/app/views/auth/register.html';
        }

        public function login() {
            $data = get_json_input();

            $username = trim($data['username'] ?? '');
            $password = $data['password'] ?? '';

            if ($username === '' || $password === '') {
                json_response(['message' => 'Username and password are required.', 'success' => true]);
                return;
            }

            $user = $this->user->findByUsername($username);

            if  (!$user) {
                json_response(['message' => 'User not found', 'success' => false]);
                return;
            }

            if (!password_verify($password, $user['password_hash'])) {
                json_response(['message' => 'Invalid username or password.', 'success' => false]);
                return;
            }

            session_regenerate_id(true);

            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];

            json_response(['message' => 'Login successful.', 'success' => true]);
        }

        public function register() {
            $data = get_json_input();

            $username = trim($data['username'] ?? '');
            $password = $data['password'] ?? '';
            $confirmPassword = $data['confirmPassword'] ?? '';

            if ($username === '' || $password === '' || $confirmPassword === '') {
                json_response(['message' => 'All fields are required.']);
                return;
            }

            if ($password !== $confirmPassword) {
                json_response(['message' => 'Passwords do not match.']);
                return;
            }

            if ($this->user->exists($username)) {
                json_response(['message' => 'Username already exists.']);
                return;
            }

            if (!$this->user->create($username, $password)) {
                json_response(['message' => 'Registration failed.']);
                return;
            }

            json_response(['message' => 'Registration successful.']);
        }

        public function logout() {
            session_start();
            session_unset();
            session_destroy();
        }
    }
?>