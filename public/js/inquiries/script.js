import { getCurrentUser } from '../utils/user.js';
import { fetchInquiries, fetchUserInquiries } from './api.js';
import { loadInquiries } from './table.js';
import { setupInquiryForm, renderPreviousInquiries } from './form.js';

export async function initInquiries() {
    const user = getCurrentUser();

    try {
        if (user.user_type === 'admin') {
            const inquiries = await fetchInquiries();
            adminInquiriesScript(inquiries);
        }
        else if (user.user_type === 'user') {
            const myInquiries = await fetchUserInquiries();
            userInquiriesScript(myInquiries);
        }

    } catch (error) {
        console.error('Failed to initialize inquiries:', error);
    }

    console.log('inquiries/script.js has been imported');
}

function adminInquiriesScript(inquiries) {
    loadInquiries(inquiries);
}

function userInquiriesScript(myInquiries) {
    setupInquiryForm(myInquiries);
    renderPreviousInquiries(myInquiries);
}
