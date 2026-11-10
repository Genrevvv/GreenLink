import { escapeHtml } from '../utils/string.js';
import { createNotificationElement } from '../utils/notification/notification.js';
import { getToday, statusBadgeClass } from './helpers.js';
import * as api from './api.js';

/* ===================== USER INQUIRIES ===================== */

export function setupInquiryForm(myInquiries) {
    const form = document.querySelector('#user-inquiry-form');
    if (!form) return;

    form.onsubmit = async event => {
        event.preventDefault();

        const subject = form.querySelector('#inquiry-subject').value.trim();
        const message = form.querySelector('#inquiry-message').value.trim();

        if (!subject || !message) {
            createNotificationElement({ status: 'failed', message: 'Please fill in all fields' });
            return;
        }

        let data;

        try {
            data = await api.addInquiry({ subject, message });
        } catch (error) {
            console.error('Failed to submit inquiry:', error);
            data = { success: false };
        }

        if (!data.success) {
            createNotificationElement({ status: 'failed', message: data.message ?? 'Failed to submit inquiry' });
            return;
        }

        myInquiries.unshift({
            id: data.id,
            subject,
            message,
            date: data.date ?? getToday(),
            status: 'Pending',
            response: ''
        });

        form.reset();
        renderPreviousInquiries(myInquiries);
        createNotificationElement({ status: 'success', message: 'Inquiry submitted successfully' });
    };
}

export function renderPreviousInquiries(myInquiries) {
    const list = document.querySelector('#user-inquiries-list');
    if (!list) return;

    if (myInquiries.length === 0) {
        list.innerHTML = `
            <li class="inquiry-details-empty text-center">
                <i class="fa-regular fa-message"></i>
                <p>You have no inquiries yet</p>
            </li>
        `;
        return;
    }

    list.innerHTML = myInquiries.map(inquiry => `
        <li class="previous-inquiry-card">
            <div class="previous-inquiry-top flex justify-between gap-3">
                <div class="flex-1">
                    <h4 class="previous-inquiry-subject">${escapeHtml(inquiry.subject)}</h4>
                    <p class="previous-inquiry-date">${escapeHtml(inquiry.date)}</p>
                </div>
                <span class="dashboard-badge ${statusBadgeClass(inquiry.status)}">${escapeHtml(inquiry.status)}</span>
            </div>

            <div class="previous-inquiry-section">
                <p class="previous-inquiry-label">Your Message:</p>
                <p class="previous-inquiry-message">${escapeHtml(inquiry.message)}</p>
            </div>

            ${inquiry.response ? `
                <div class="previous-inquiry-section previous-inquiry-response-section">
                    <p class="previous-inquiry-label">Response:</p>
                    <p class="previous-inquiry-message previous-inquiry-response">${escapeHtml(inquiry.response)}</p>
                </div>
            ` : ''}
        </li>
    `).join('');
}
