import * as api from './api.js';
import { initProfileNavigation } from './navigation.js';
import { initProfileForms } from './form.js';
import { createNotificationElement } from '../utils/notification/notification.js';
import { getCurrentUser } from '../utils/user.js';

export async function initProfile() {
    const navigation = document.querySelector('#profile-navigation');
    const content = document.querySelector('#profile-content');
    if (!navigation || !content) return () => {};

    let profile;
    try {
        profile = await api.fetchProfile();
    } catch (error) {
        content.textContent = 'Unable to load your profile. Please try again.';
        createNotificationElement({
            status: 'failed',
            message: error instanceof Error ? error.message : 'Unable to load your profile.'
        });
        return () => {};
    }

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
