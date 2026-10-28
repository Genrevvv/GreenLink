import { setText } from './inquiries-helper.js'
import { escapeHtml } from '../utils/string.js';
import { createNotificationElement } from '../utils/notification/notification.js';
import { showOverlay, hideOverlay } from '../utils/overlay.js';

/* ===================== ADMIN INQUIRIES ===================== */

function statusBadgeClass(status) {
    return status === 'Responded' ? 'badge-green' : 'badge-yellow';
}

// SUMMARY CARDS
export function updateSummaryCards(inquiries) {
    const countBy = status => inquiries.filter(inquiry => inquiry.status === status).length;

    setText('#inquiries-total-count', inquiries.length);
    setText('#inquiries-pending-count', countBy('Pending'));
    setText('#inquiries-responded-count', countBy('Responded'));
}

// INQUIRY MANAGEMENT TABLE
export function renderInquiryRows(inquiries, selectedId) {
    const tbody = document.querySelector('#inquiries-tbody');
    if (!tbody) return;

    tbody.innerHTML = inquiries.map(inquiry => `
        <tr class="inquiry-row ${inquiry.id === selectedId ? 'selected' : ''}" data-id="${inquiry.id}">
            <td class="inquiry-customer">${escapeHtml(inquiry.customer)}</td>
            <td>${escapeHtml(inquiry.subject)}</td>
            <td>${escapeHtml(inquiry.date)}</td>
            <td>
                <span class="dashboard-badge ${statusBadgeClass(inquiry.status)}">${escapeHtml(inquiry.status)}</span>
            </td>
            <td>
                <button type="button" class="inquiry-reply-btn flex align-center gap-1">
                    <i class="fa-solid fa-reply"></i>
                    ${inquiry.status === 'Responded' ? 'Edit' : 'Reply'}
                </button>
            </td>
        </tr>
    `).join('');

    tbody.querySelectorAll('.inquiry-row').forEach(row => {
        const id = Number(row.dataset.id);

        row.onclick = () => {
            selectedId = id;
            renderInquiryRows();
            renderInquiryDetails();
        };

        row.querySelector('.inquiry-reply-btn').onclick = event => {
            event.stopPropagation();
            selectedId = id;
            renderInquiryRows();
            renderInquiryDetails();
            showReplyDialog(id);
        };
    });
}

// INQUIRY DETAILS
export function renderInquiryDetails(inquiries, selectedId) {
    const details = document.querySelector('#inquiry-details');
    if (!details) return;

    const inquiry = inquiries.find(i => i.id === selectedId);

    if (!inquiry) {
        details.innerHTML = `
            <div class="inquiry-details-empty text-center">
                <i class="fa-regular fa-message"></i>
                <p>Select an inquiry to view details</p>
            </div>
        `;
        return;
    }

    const field = (label, value, isText = false) => `
        <div class="inquiry-info-box">
            <p class="inquiry-info-label">${label}</p>
            <p class="${isText ? 'inquiry-info-text' : 'inquiry-info-value'}">${escapeHtml(value)}</p>
        </div>
    `;

    details.innerHTML = `
        <div class="flex-column gap-4">
            ${field('Customer Name', inquiry.customer)}
            ${field('Email', inquiry.email)}
            ${field('Subject', inquiry.subject)}
            ${field('Message', inquiry.message, true)}
            ${field('Date Submitted', inquiry.date)}

            ${inquiry.response ? `
                <div class="inquiry-info-box inquiry-response-box">
                    <p class="inquiry-info-label bold">Your Response</p>
                    <p class="inquiry-info-text">${escapeHtml(inquiry.response)}</p>
                </div>
            ` : ''}

            <span class="dashboard-badge inquiry-status-full ${statusBadgeClass(inquiry.status)}">
                ${escapeHtml(inquiry.status)}
            </span>
        </div>
    `;
}

// REPLY DIALOG
function showReplyDialog(id) {
    const inquiry = inquiries.find(i => i.id === id);
    if (!inquiry) return;

    showOverlay(`
        <div class="inquiry-dialog flex-column gap-4" role="dialog" aria-modal="true" aria-labelledby="inquiry-dialog-title">
            <button type="button" class="inquiry-dialog-close close-overlay" aria-label="Close">
                <i class="fa-solid fa-xmark"></i>
            </button>

            <h3 class="inquiry-dialog-title" id="inquiry-dialog-title">Reply to: ${escapeHtml(inquiry.subject)}</h3>

            <div class="inquiry-info-box">
                <p class="inquiry-info-label">Customer</p>
                <p class="inquiry-info-value">${escapeHtml(inquiry.customer)}</p>
            </div>

            <div class="inquiry-info-box">
                <p class="inquiry-info-label">Original Message</p>
                <p class="inquiry-info-text">${escapeHtml(inquiry.message)}</p>
            </div>

            <div class="flex-column gap-2">
                <label for="inquiry-reply-text" class="inquiry-dialog-label">Your Reply</label>
                <textarea id="inquiry-reply-text" class="inquiry-input inquiry-textarea" rows="6"
                    placeholder="Type your response here...">${escapeHtml(inquiry.response)}</textarea>
            </div>

            <button type="button" class="inquiry-primary-btn flex-center gap-2" id="inquiry-send-reply">
                <i class="fa-solid fa-reply"></i> Send Reply
            </button>
        </div>
    `);

    const textarea = document.querySelector('#inquiry-reply-text');
    textarea.focus();

    document.querySelector('#inquiry-send-reply').onclick = () => {
        const reply = textarea.value.trim();

        if (!reply) {
            createNotificationElement({ status: 'failed', message: 'Please enter a reply message' });
            return;
        }

        // TODO: Send the reply through the API once the back end is ready.
        inquiry.status = 'Responded';
        inquiry.response = reply;

        hideOverlay();
        renderPage();
        createNotificationElement({ status: 'success', message: 'Reply sent successfully' });
    };
}



/* ===================== USER INQUIRIES ===================== */

export function setupInquiryForm(myInquiries) {
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
