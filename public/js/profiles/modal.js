import { hideOverlay, showOverlay } from '../utils/overlay.js';
import { escapeHtml } from '../utils/string.js';

export function renderProfileSection(profile) {
    const email = typeof profile.email === 'string' ? profile.email.trim() : '';

    return `
        <div class="profile-section">
            <h2>Profile</h2>
            <p class="profile-section-description">Your account information.</p>
            <dl class="profile-details">
                <div>
                    <dt>Username</dt>
                    <dd>${escapeHtml(profile.username)}</dd>
                </div>
                <div>
                    <dt>Email</dt>
                    <dd>${email ? escapeHtml(email) : 'No email address found.'}</dd>
                </div>
            </dl>
        </div>
    `;
}

export function renderUsernameForm(profile) {
    return `
        <div class="profile-form flex-column gap-1">
            <h2>Change Username</h2>
            <p class="profile-section-description">Choose a username for your account.</p>
            <div>
                <span>Username</span>
                <input class="focus-input" id="profile-username" type="text"
                    placeholder="Enter username" value="${escapeHtml(profile.username)}">
            </div>
            <div id="change-username-btn" class="add-edit-btn">Save Changes</div>
        </div>
    `;
}

export function renderEmailForm(profile) {
    return `
        <div class="profile-form flex-column gap-1">
            <h2>Change Email</h2>
            <p class="profile-section-description">Verify your password to update your email address.</p>
            <div>
                <span>Email</span>
                <input class="focus-input" id="profile-email" type="email"
                    placeholder="Enter email" value="${escapeHtml(profile.email)}">
            </div>
            <div>
                <span>Current Password</span>
                <input class="focus-input" id="profile-email-password" type="password"
                    placeholder="Enter current password">
            </div>
            <div id="change-email-btn" class="add-edit-btn">Save Changes</div>
        </div>
    `;
}

export function renderPasswordForm() {
    return `
        <div class="profile-form flex-column gap-1">
            <h2>Change Password</h2>
            <p class="profile-section-description">Use at least 8 characters for your new password.</p>
            <div>
                <span>Current Password</span>
                <input class="focus-input" id="profile-current-password" type="password"
                    placeholder="Enter current password">
            </div>
            <div>
                <span>New Password</span>
                <input class="focus-input" id="profile-new-password" type="password"
                    placeholder="Enter new password">
            </div>
            <div>
                <span>Confirm New Password</span>
                <input class="focus-input" id="profile-confirm-password" type="password"
                    placeholder="Confirm new password">
            </div>
            <div id="change-password-btn" class="add-edit-btn">Save Changes</div>
        </div>
    `;
}

export function renderDeleteAccountSection() {
    return `
        <div class="profile-section profile-delete-section">
            <h2>Delete Account</h2>
            <p class="profile-section-description">
                Deleting your account will deactivate it. You will no longer be able to sign in,
                and your related appointments and inquiries will be retained.
            </p>
            <button class="btn profile-delete-button" id="delete-account-btn" type="button">
                Delete Account
            </button>
            <button class="btn profile-cancel-button" id="cancel-delete-account" type="button">
                Cancel
            </button>
        </div>
    `;
}

export function renderDeleteConfirmationModal() {
    return `
        <form class="profile-confirm-modal" id="profile-delete-confirm">
            <button class="profile-modal-close close-overlay" type="button" aria-label="Close">×</button>
            <h2>Confirm Account Deletion</h2>
            <p>This will deactivate your account. Enter your current password to continue.</p>
            <label for="profile-delete-password">Current Password</label>
            <input class="input focus-input" id="profile-delete-password" name="currentPassword"
                type="password" autocomplete="current-password" required>
            <div class="profile-modal-actions">
                <button class="btn btn-primary" type="submit">Confirm Deletion</button>
                <button class="btn profile-cancel-button" id="profile-delete-cancel" type="button">Cancel</button>
            </div>
        </form>
    `;
}

export function showDeleteConfirmation() {
    showOverlay(renderDeleteConfirmationModal());
    document.querySelector('#profile-delete-password')?.focus();
}

export function closeProfileModal() {
    hideOverlay();
}

export function renderGoodbyeSection() {
    return `
        <div class="profile-section profile-goodbye">
            <h2>Goodbye</h2>
            <p>Your account has been deactivated. Your related information has been retained.</p>
            <a class="btn btn-primary" href="/">Return to GreenLink</a>
        </div>
    `;
}
