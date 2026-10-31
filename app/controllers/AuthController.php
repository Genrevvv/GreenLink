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

            $username = trim($data['username'] ?? '');
            $password = $data['password'] ?? '';

            if ($username === '' || $password === '') {
                json_response([
                    'success' => false,
                    'message' => 'Username and password are required.'
                ]);
                return;
            }

            $user = $this->user->findByUsername($username);

            if (!$user) {
                json_response([
                    'success' => false,
                    'message' => 'User not found.'
                ]);
                return;
            }

            if (!password_verify($password, $user['password_hash'])) {
                json_response([
                    'success' => false,
                    'message' => 'Invalid username or password.'
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
            $password = $data['password'] ?? '';
            $confirmPassword = $data['confirmPassword'] ?? '';

            if ($username === '' || $password === '' || $confirmPassword === '') {
                json_response([
                    'success' => false,
                    'message' => 'All fields are required.'
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

            if ($this->user->exists($username)) {
                json_response([
                    'success' => false,
                    'message' => 'Username already exists.'
                ]);
                return;
            }

            if (!$this->user->create($username, $password)) {
                json_response([
                    'success' => false,
                    'message' => 'Registration failed. Please try again.'
                ]);
                return;
            }

            json_response([
                'success' => true,
                'message' => 'Registration successful! You can now sign in.'
            ]);
        }

        public function logout() {
            session_start();
            session_unset();
            session_destroy();
        }
    }
?>
