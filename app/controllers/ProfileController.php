<?php
class ProfileController {
    private User $user;

    public function __construct(User $user) {
        $this->user = $user;
    }

    public function getProfile(): void {
        $userId = $this->authenticatedUserId();
        if ($userId === null) return;

        $profile = $this->user->getProfile($userId);
        if ($profile === null) {
            json_response(['success' => false, 'message' => 'Account is unavailable.']);
            return;
        }

        json_response(['success' => true, 'user' => $profile]);
    }

    public function changeUsername(): void {
        $userId = $this->authenticatedUserId();
        if ($userId === null) return;

        $data = get_json_input();
        $username = is_string($data['username'] ?? null) ? trim($data['username']) : '';
        if (!preg_match('/^[A-Za-z0-9_.-]{3,50}$/', $username)) {
            json_response([
                'success' => false,
                'message' => 'Username must be 3–50 characters and contain only letters, numbers, underscores, dots, or hyphens.'
            ]);
            return;
        }
        if ($this->user->usernameExistsForOtherUser($username, $userId)) {
            json_response(['success' => false, 'message' => 'Username already exists.']);
            return;
        }

        try {
            $this->user->updateUsername($userId, $username);
        } catch (PDOException $error) {
            $this->handleDatabaseError($error, 'Username already exists.', 'Unable to update your username.');
            return;
        }

        $_SESSION['username'] = $username;
        $this->respondWithUpdatedProfile($userId, 'Username updated successfully.');
    }

    public function changeEmail(): void {
        $userId = $this->authenticatedUserId();
        if ($userId === null) return;

        $data = get_json_input();
        $email = is_string($data['email'] ?? null)
            ? strtolower(trim($data['email']))
            : '';
        $currentPassword = is_string($data['currentPassword'] ?? null)
            ? $data['currentPassword']
            : '';

        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 255) {
            json_response(['success' => false, 'message' => 'Please enter a valid email address.']);
            return;
        }
        if ($currentPassword === '' || !$this->user->verifyPassword($userId, $currentPassword)) {
            json_response(['success' => false, 'message' => 'Your current password is incorrect.']);
            return;
        }
        if ($this->user->emailExistsForOtherUser($email, $userId)) {
            json_response(['success' => false, 'message' => 'Email address is already registered.']);
            return;
        }

        try {
            $this->user->updateEmail($userId, $email);
        } catch (PDOException $error) {
            $this->handleDatabaseError($error, 'Email address is already registered.', 'Unable to update your email.');
            return;
        }

        $this->respondWithUpdatedProfile($userId, 'Email updated successfully.');
    }

    public function changePassword(): void {
        $userId = $this->authenticatedUserId();
        if ($userId === null) return;

        $data = get_json_input();
        $currentPassword = is_string($data['currentPassword'] ?? null)
            ? $data['currentPassword']
            : '';
        $newPassword = is_string($data['newPassword'] ?? null)
            ? $data['newPassword']
            : '';
        $confirmPassword = is_string($data['confirmPassword'] ?? null)
            ? $data['confirmPassword']
            : '';

        if ($currentPassword === '' || $newPassword === '' || $confirmPassword === '') {
            json_response(['success' => false, 'message' => 'Please complete all password fields.']);
            return;
        }
        if (strlen($newPassword) < 8) {
            json_response(['success' => false, 'message' => 'Your password must contain at least 8 characters.']);
            return;
        }
        if ($newPassword !== $confirmPassword) {
            json_response(['success' => false, 'message' => 'Your new passwords do not match.']);
            return;
        }

        if (!$this->user->changePassword($userId, $currentPassword, $newPassword)) {
            json_response(['success' => false, 'message' => 'Your current password is incorrect.']);
            return;
        }

        json_response(['success' => true, 'message' => 'Password updated successfully.']);
    }

    public function deleteAccount(): void {
        $userId = $this->authenticatedUserId();
        if ($userId === null) return;

        $data = get_json_input();
        $currentPassword = is_string($data['currentPassword'] ?? null)
            ? $data['currentPassword']
            : '';

        if ($currentPassword === '' || !$this->user->softDelete($userId, $currentPassword)) {
            json_response(['success' => false, 'message' => 'Your current password is incorrect.']);
            return;
        }

        session_unset();
        session_destroy();
        json_response(['success' => true, 'message' => 'Your account has been deactivated.']);
    }

    private function authenticatedUserId(): ?int {
        if (!isset($_SESSION['user_id']) || (int) $_SESSION['user_id'] <= 0) {
            json_response(['success' => false, 'message' => 'Please sign in to manage your account.']);
            return null;
        }

        return (int) $_SESSION['user_id'];
    }

    private function respondWithUpdatedProfile(int $userId, string $message): void {
        $profile = $this->user->getProfile($userId);
        if ($profile === null) {
            json_response(['success' => false, 'message' => 'Account is unavailable.']);
            return;
        }

        json_response([
            'success' => true,
            'message' => $message,
            'user' => $profile
        ]);
    }

    private function handleDatabaseError(
        PDOException $error,
        string $duplicateMessage,
        string $failureMessage
    ): void {
        if ((string) $error->getCode() === '23000') {
            json_response(['success' => false, 'message' => $duplicateMessage]);
            return;
        }

        error_log('Account profile update failed: ' . $error->getMessage());
        json_response(['success' => false, 'message' => $failureMessage]);
    }
}
?>
