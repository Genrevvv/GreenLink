import { escapeHtml } from '../utils/string.js';
import { createNotificationElement } from '../utils/notification/notification.js';
import { userInquiriesData } from './inquiries-data.js';

// Page state (front-end only, changes are kept in memory)
let myInquiries = [];

export function initUserInquiries() {
    myInquiries = userInquiriesData.map(inquiry => ({ ...inquiry }));

    setupInquiryForm();
    renderPreviousInquiries();
}

// SUBMIT NEW INQUIRY
function setupInquiryForm() {
    const form = document.querySelector('#user-inquiry-form');
    if (!form) return;

    form.onsubmit = event => {
        event.preventDefault();

        const subject = form.querySelector('#inquiry-subject').value.trim();
        const message = form.querySelector('#inquiry-message').value.trim();

        if (!subject || !message) {
            createNotificationElement({ status: 'failed', message: 'Please fill in all fields' });
            return;
        }

        // TODO: Send the inquiry through the API once the back end is ready.
        myInquiries.unshift({
            id: Date.now(),
            subject,
            message,
            date: getToday(),
            status: 'Pending',
            response: ''
        });

        form.reset();
        renderPreviousInquiries();
        createNotificationElement({ status: 'success', message: 'Inquiry submitted successfully' });
    };
}

// PREVIOUS INQUIRIES
function renderPreviousInquiries() {
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
                <span class="dashboard-badge ${inquiry.status === 'Responded' ? 'badge-green' : 'badge-yellow'}">${escapeHtml(inquiry.status)}</span>
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

// HELPERS
function getToday() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${now.getFullYear()}-${month}-${day}`;
}
