import * as api from './api.js';
import { initProfileNavigation } from './navigation.js';
import { initProfileForms } from './form.js';
import { createNotificationElement } from '../utils/notification/notification.js';
import { getCurrentUser } from '../utils/user.js';

export async function initProfile() {
    const navigation = document.querySelector('#profile-navigation');
    const content = document.querySelector('#profile-content');
    if (!navigation || !content) return () => {};

    const response = await api.fetchProfile();
    if (!response.success) {
        content.textContent = 'Unable to load your profile. Please try again.';
        createNotificationElement({
            status: 'failed',
            message: response.message || 'Unable to load your profile.'
        });
        return () => {};
    }
    const profile = response.user;

    const updateCurrentUser = (updatedProfile) => {
        const currentUser = getCurrentUser() ?? {};
        sessionStorage.setItem('user', JSON.stringify({
            ...currentUser,
            username: updatedProfile.username,
            email: updatedProfile.email
        }));
    };
    const profileNavigation = initProfileNavigation(
        navigation,
        content,
        profile,
        showProfileSection => initProfileForms(content, profile, updateCurrentUser, showProfileSection)
    );

    return () => {
        profileNavigation.cleanup();
    };
}
