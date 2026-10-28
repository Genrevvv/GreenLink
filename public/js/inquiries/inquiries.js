import { escapeHtml } from '../utils/string.js';
import { createNotificationElement } from '../utils/notification/notification.js';
import { showOverlay, hideOverlay } from '../utils/overlay.js';
import { getCurrentUser } from '../utils/user.js';
import { inquiriesData } from './inquiries-data.js';
import { initUserInquiries } from './inquiries-user.js';

// Page state (front-end only, changes are kept in memory)
let inquiries = [];
let selectedId = null;

export function initInquiries() {
    const user = getCurrentUser();

    if (user.user_type === 'admin') {
        adminInquiriesScript();
    }
    else if (user.user_type === 'user') {
        initUserInquiries();
    }

    console.log('inquiries.js has been imported');
}

function adminInquiriesScript() {
    inquiries = inquiriesData.map(inquiry => ({ ...inquiry }));
    selectedId = null;

    renderPage();
}

function renderPage() {
    updateSummaryCards();
    renderInquiryRows();
    renderInquiryDetails();
}

function statusBadgeClass(status) {
    return status === 'Responded' ? 'badge-green' : 'badge-yellow';
}

// SUMMARY CARDS
function updateSummaryCards() {
    const countBy = status => inquiries.filter(inquiry => inquiry.status === status).length;

    setText('#inquiries-total-count', inquiries.length);
    setText('#inquiries-pending-count', countBy('Pending'));
    setText('#inquiries-responded-count', countBy('Responded'));
}

// INQUIRY MANAGEMENT TABLE
function renderInquiryRows() {
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
function renderInquiryDetails() {
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

// HELPERS
function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
}
