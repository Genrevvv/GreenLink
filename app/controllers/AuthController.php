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

        // Display the forgot-password form.
        public function renderForgotPassword() {
            require ROOT . '/public/views/auth/forgot-password.html';
        }

        // Send a password-reset link to the registered email address.
      
        public function sendPasswordReset() {
            $data = get_json_input();

            $email = trim($data['email'] ?? '');

            if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                json_response([
                    'success' => false,
                    'message' => 'Please enter a valid email address.'
                ]);
                return;
            }

            // Always return the same message for registered and
            // unregistered email addresses to prevent account discovery.
            $genericMessage = 'If an account exists with that email address, a password-reset link will be sent shortly.';

            $user = $this->user->findByEmail($email);

            if (!$user) {
                json_response([
                    'success' => true,
                    'message' => $genericMessage
                ]);
                return;
            }

            try {
                // Generate a secure random token.
                $token = bin2hex(random_bytes(16));

                // Store only the SHA-256 hash of the token.
                $tokenHash = hash('sha256', $token);

                // Set expiration to 30 minutes from now using UTC.
                $expiresAt = gmdate('Y-m-d H:i:s', time() + (30 * 60));

                $saved = $this->user->savePasswordResetToken(
                    $email,
                    $tokenHash,
                    $expiresAt
                );

                if (!$saved) {
                    throw new RuntimeException('Could not save password-reset token.');
                }

                // Build an absolute URL for the email.
                $resetUrl = $this->getBaseUrl()
                    . '/reset-password?token='
                    . urlencode($token);

                // Load the configured PHPMailer instance.
                $mail = require ROOT . '/config/mailer.php';

                $mail->addAddress($email);

                $mail->Subject = 'Reset Your GreenLink Password';

                $mail->Body = <<<HTML
                    <h2>Password Reset Request</h2>

                    <p>We received a request to reset the password
                    associated with your GreenLink account.</p>

                    <p>Click the link below to choose a new password:</p>

                    <p>
                        <a href="{$resetUrl}">
                            Reset My Password
                        </a>
                    </p>

                    <p>This link will expire in 30 minutes.</p>

                    <p>If you did not request a password reset,
                    you can safely ignore this email.</p>

                    <p>
                        Greens for Growth<br>
                        GreenLink
                    </p>
                HTML;

                $mail->AltBody = "We received a request to reset your GreenLink password.\n\n"
                    . "Open this link to choose a new password:\n"
                    . $resetUrl
                    . "\n\nThis link will expire in 30 minutes.\n"
                    . "If you did not request this, you can ignore this email.";

                $mail->send();

                json_response([
                    'success' => true,
                    'message' => $genericMessage
                ]);

            } catch (Throwable $e) {
                error_log('Password reset email error: ' . $e->getMessage());

                json_response([
                    'success' => false,
                    'message' => 'We could not send the password-reset email right now. Please try again later.'
                ]);
            }
        }

        // Display the reset-password form only when the token is valid.
        public function renderResetPassword() {
            $token = $_GET['token'] ?? '';
            $tokenIsValid = false;

            if (
                is_string($token) &&
                preg_match('/^[a-f0-9]{32}$/i', $token)
            ) {
                $tokenHash = hash('sha256', $token);
                $user = $this->user->findByResetToken($tokenHash);

                $tokenIsValid = $user !== false;
            }

            require ROOT . '/public/views/auth/reset-password.html';
        }

        // Process the new password submitted by the user.
        public function resetPassword() {
            $data = get_json_input();

            $token = $data['token'] ?? '';
            $password = $data['password'] ?? '';
            $confirmPassword = $data['confirmPassword'] ?? '';

            if (
                !is_string($token) ||
                !preg_match('/^[a-f0-9]{32}$/i', $token)
            ) {
                json_response([
                    'success' => false,
                    'message' => 'This password-reset link is invalid or has expired.'
                ]);
                return;
            }

            if ($password === '' || $confirmPassword === '') {
                json_response([
                    'success' => false,
                    'message' => 'Please complete both password fields.'
                ]);
                return;
            }

            if (strlen($password) < 8) {
                json_response([
                    'success' => false,
                    'message' => 'Your password must be at least 8 characters long.'
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

            $tokenHash = hash('sha256', $token);

            // Verify the token and its expiration before updating.
            $user = $this->user->findByResetToken($tokenHash);

            if (!$user) {
                json_response([
                    'success' => false,
                    'message' => 'This password-reset link is invalid or has expired.'
                ]);
                return;
            }

            if (!$this->user->resetPassword($tokenHash, $password)) {
                json_response([
                    'success' => false,
                    'message' => 'Password reset failed. Please request a new link.'
                ]);
                return;
            }

            json_response([
                'success' => true,
                'message' => 'Your password has been reset successfully. You can now sign in.'
            ]);
        }

        // Build the absolute URL used in password-reset emails.
        private function getBaseUrl(): string {
            $isHttps = (
                !empty($_SERVER['HTTPS']) &&
                $_SERVER['HTTPS'] !== 'off'
            );

            $scheme = $isHttps ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost';

            $basePath = str_replace(
                '\\',
                '/',
                dirname($_SERVER['SCRIPT_NAME'] ?? '')
            );

            $basePath = rtrim($basePath, '/');

            return $scheme . '://' . $host . $basePath;
        }

        public function login() {
            $data = get_json_input();

            $username = trim($data['username'] ?? '');
            $password = $data['password'] ?? '';

            if ($username === '' || $password === '') {
                json_response([
                    'success' => false,
                    'message' => 'Username or email and password are required.'
                ]);
                return;
            }

            $user = $this->user->findByUsername($username);

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
            $email = trim($data['email'] ?? '');
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
                    'message' => 'All fields are required.'
                ]);
                return;
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                json_response([
                    'success' => false,
                    'message' => 'Please enter a valid email address.'
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

            if ($this->user->existsByEmail($email)) {
                json_response([
                    'success' => false,
                    'message' => 'Email address is already registered.'
                ]);
                return;
            }

            try {
                $created = $this->user->create(
                    $username,
                    $email,
                    $password
                );
            } catch (PDOException $e) {
                $created = false;
            }

            if (!$created) {
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
