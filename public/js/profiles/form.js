import * as api from './api.js';
import { clearCurrentUser, getCurrentUser } from '../utils/user.js';
import { createNotificationElement } from '../utils/notification/notification.js';
import {
    closeProfileModal,
    renderGoodbyeSection,
    showDeleteConfirmation
} from './modal.js';

function notify(status, message) {
    createNotificationElement({ status, message });
}

function showFailure(error, fallback) {
    notify('failed', error instanceof Error ? error.message : fallback);
}

export function changeUsernameForm(profile, onProfileUpdated, showProfileSection) {
    const username = document.querySelector('#profile-username')?.value.trim() ?? '';
    if (!username) {
        alert('Please enter a username.');
        return;
    }

    return api.changeUsername(username).then(response => {
        if (!response.success) {
            notify('failed', response.message || 'Unable to change your username.');
            return;
        }
        profile.username = response.user.username;
        onProfileUpdated(profile);
        showProfileSection();
        notify('success', response.message);
    }).catch(error => showFailure(error, 'Unable to change your username.'));
}

export function changeEmailForm(profile, onProfileUpdated, showProfileSection) {
    const email = document.querySelector('#profile-email')?.value.trim() ?? '';
    const currentPassword = document.querySelector('#profile-email-password')?.value ?? '';
    if (!email || !currentPassword) {
        alert('Please enter your email and current password.');
        return;
    }

    return api.changeEmail(email, currentPassword).then(response => {
        if (!response.success) {
            notify('failed', response.message || 'Unable to change your email.');
            return;
        }
        profile.email = response.user.email;
        onProfileUpdated(profile);
        showProfileSection();
        notify('success', response.message);
    }).catch(error => showFailure(error, 'Unable to change your email.'));
}

export function changePasswordForm() {
    const currentPassword = document.querySelector('#profile-current-password')?.value ?? '';
    const newPassword = document.querySelector('#profile-new-password')?.value ?? '';
    const confirmPassword = document.querySelector('#profile-confirm-password')?.value ?? '';

    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('Please complete all password fields.');
        return;
    }
    if (newPassword.length < 8) {
        alert('Your password must contain at least 8 characters.');
        return;
    }
    if (newPassword !== confirmPassword) {
        alert('Your new passwords do not match.');
        return;
    }

    return api.changePassword(currentPassword, newPassword, confirmPassword).then(response => {
        if (!response.success) {
            notify('failed', response.message || 'Unable to change your password.');
            return;
        }
        document.querySelector('#profile-current-password').value = '';
        document.querySelector('#profile-new-password').value = '';
        document.querySelector('#profile-confirm-password').value = '';
        notify('success', response.message);
    }).catch(error => showFailure(error, 'Unable to change your password.'));
}

function deleteAccountForm(event, content) {
    event.preventDefault();
    const currentPassword = document.querySelector('#profile-delete-password')?.value ?? '';

    return api.deleteAccount(currentPassword).then(response => {
        if (!response.success) {
            notify('failed', response.message || 'Unable to deactivate your account.');
            return;
        }

        clearCurrentUser();
        closeProfileModal();
        content.innerHTML = renderGoodbyeSection();
        notify('success', response.message);
    }).catch(error => showFailure(error, 'Unable to deactivate your account.'));
}

export function initProfileForms(content, profile, onProfileUpdated, showProfileSection) {
    const usernameButton = content.querySelector('#change-username-btn');
    if (usernameButton) {
        usernameButton.onclick = () => changeUsernameForm(profile, onProfileUpdated, showProfileSection);
    }

    const emailButton = content.querySelector('#change-email-btn');
    if (emailButton) {
        emailButton.onclick = () => changeEmailForm(profile, onProfileUpdated, showProfileSection);
    }

    const passwordButton = content.querySelector('#change-password-btn');
    if (passwordButton) {
        passwordButton.onclick = changePasswordForm;
    }

    const deleteButton = content.querySelector('#delete-account-btn');
    if (deleteButton) {
        deleteButton.onclick = () => {
            showDeleteConfirmation();
            const confirmationForm = document.querySelector('#profile-delete-confirm');
            if (confirmationForm) {
                confirmationForm.onsubmit = event => deleteAccountForm(event, content);
            }
            const cancelButton = document.querySelector('#profile-delete-cancel');
            if (cancelButton) {
                cancelButton.onclick = closeProfileModal;
            }
        };
    }

    const cancelDeleteButton = content.querySelector('#cancel-delete-account');
    if (cancelDeleteButton) {
        cancelDeleteButton.onclick = showProfileSection;
    }
}
