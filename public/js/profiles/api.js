import { apiFetchJSON } from '../utils/api.js';

export async function fetchProfile() {
    const data = await apiFetchJSON('/profile', 'GET');
    if (!data.success) {
        throw new Error(data.message || 'Unable to load your profile.');
    }
    return data.user;
}

export async function changeUsername(username) {
    return apiFetchJSON('/profile/username', 'POST', { username });
}

export async function changeEmail(email, currentPassword) {
    return apiFetchJSON('/profile/email', 'POST', { email, currentPassword });
}

export async function changePassword(currentPassword, newPassword, confirmPassword) {
    return apiFetchJSON('/profile/password', 'POST', {
        currentPassword,
        newPassword,
        confirmPassword
    });
}

export async function deleteAccount(currentPassword) {
    return apiFetchJSON('/profile/delete', 'POST', { currentPassword });
}
