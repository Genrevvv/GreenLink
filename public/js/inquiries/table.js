import { escapeHtml } from '../utils/string.js';
import { statusBadgeClass } from './helpers.js';
import { updateSummaryCards } from './summary.js';
import { showReplyDialog } from './reply.js';

/* ===================== ADMIN INQUIRIES ===================== */

export let inquiries = [];
let selectedId = null;

// LOAD INQUIRIES
export function loadInquiries(inquiriesData) {
    inquiries = inquiriesData;
    selectedId = null;

    renderInquiries();
}

// RENDER PAGE
export function renderInquiries() {
    updateSummaryCards(inquiries);
    renderInquiryRows();
    renderInquiryDetails();
}

// INQUIRY MANAGEMENT TABLE
export function renderInquiryRows() {
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

            const inquiry = inquiries.find(i => i.id === id);
            if (inquiry) showReplyDialog(inquiry, renderInquiries);
        };
    });
}

// INQUIRY DETAILS
export function renderInquiryDetails() {
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
