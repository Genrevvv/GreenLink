import { getCurrentUser } from '../utils/user.js';
import { createNotificationElement } from '../utils/notification/notification.js';
import { fetchInquiries, fetchUserInquiries } from './api.js';
import { loadInquiries } from './table.js';
import { setupInquiryForm, renderPreviousInquiries } from './form.js';

export async function initInquiries(targetId = null) {
    const user = getCurrentUser();

    try {
        if (user.user_type === 'admin') {
            const inquiries = await fetchInquiries();
            adminInquiriesScript(inquiries, targetId);
        }
        else if (user.user_type === 'user') {
            const myInquiries = await fetchUserInquiries();
            userInquiriesScript(myInquiries, targetId);
        }

    } catch (error) {
        console.error('Failed to initialize inquiries:', error);

        createNotificationElement({ status: 'failed', message: 'Failed to load inquiries' });
    }

    console.log('inquiries.js has been imported');
}

function adminInquiriesScript(inquiries, targetId) {
    loadInquiries(inquiries, targetId);
}

function userInquiriesScript(myInquiries, targetId) {
    setupInquiryForm(myInquiries);
    renderPreviousInquiries(myInquiries, targetId);
}
