import { escapeHtml } from '../utils/string.js';
import { createNotificationElement } from '../utils/notification/notification.js';
import { getCurrentUser } from '../utils/user.js';
import { inquiriesData } from './inquiries-data.js';
import { initUserInquiries } from './inquiries-user.js';

// Page state (front-end only, changes are kept in memory)
let inquiries = [];
let selectedId = null;
let activeFilter = 'All';
let searchText = '';

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
    activeFilter = 'All';
    searchText = '';

    setupFilters();
    renderPage();
}

function renderPage() {
    updateSummaryCards();
    renderInquiryRows();
    renderInquiryDetails();
}

// SUMMARY CARDS
function updateSummaryCards() {
    const countBy = status => inquiries.filter(inquiry => inquiry.status === status).length;

    setText('#inquiries-total-count', inquiries.length);
    setText('#inquiries-new-count', countBy('New'));
    setText('#inquiries-read-count', countBy('Read'));
    setText('#inquiries-replied-count', countBy('Replied'));
}

// FILTER TABS AND SEARCH
function setupFilters() {
    const tabs = document.querySelectorAll('.inquiries-tab');
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeFilter = tab.dataset.filter;
            renderInquiryRows();
        };
    });

    const searchInput = document.querySelector('#inquiries-search');
    if (searchInput) {
        searchInput.oninput = () => {
            searchText = searchInput.value.trim().toLowerCase();
            renderInquiryRows();
        };
    }
}

function getFilteredInquiries() {
    return inquiries.filter(inquiry => {
        const matchesFilter = activeFilter === 'All' || inquiry.status === activeFilter;
        const matchesSearch = !searchText
            || inquiry.name.toLowerCase().includes(searchText)
            || inquiry.subject.toLowerCase().includes(searchText);

        return matchesFilter && matchesSearch;
    });
}

// INQUIRIES TABLE
function renderInquiryRows() {
    const tbody = document.querySelector('#inquiries-tbody');
    if (!tbody) return;

    const rows = getFilteredInquiries();

    if (rows.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="admin-table-empty-cell">
                    <div class="admin-empty-state">
                        <i class="fa-regular fa-comments admin-empty-icon"></i>
                        <strong class="admin-empty-title">No inquiries found</strong>
                        <span class="admin-empty-description">
                            Try a different filter or search.
                        </span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = rows.map(inquiry => `
        <tr class="inquiry-row ${inquiry.id === selectedId ? 'inquiry-row-selected' : ''} ${inquiry.status === 'New' ? 'inquiry-row-new' : ''}"
            data-id="${inquiry.id}">
            <td>
                <div class="flex-column">
                    <strong>${escapeHtml(inquiry.name)}</strong>
                    <small class="inquiry-muted">${escapeHtml(inquiry.email)}</small>
                </div>
            </td>
            <td class="inquiry-subject">${escapeHtml(inquiry.subject)}</td>
            <td>
                ${escapeHtml(formatDate(inquiry.date))}
                <br>
                <small class="inquiry-muted">${escapeHtml(inquiry.time)}</small>
            </td>
            <td>
                <span class="inquiry-status inquiry-status-${inquiry.status.toLowerCase()}">
                    ${escapeHtml(inquiry.status)}
                </span>
            </td>
            <td>
                <div class="flex gap-1">
                    <button type="button" class="inquiry-action-btn inquiry-view-btn" aria-label="View inquiry" title="View">
                        <i class="fa-regular fa-eye"></i>
                    </button>
                    <button type="button" class="inquiry-action-btn inquiry-delete-btn" aria-label="Delete inquiry" title="Delete">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    tbody.querySelectorAll('.inquiry-row').forEach(row => {
        const id = Number(row.dataset.id);

        row.onclick = () => selectInquiry(id);

        row.querySelector('.inquiry-delete-btn').onclick = event => {
            event.stopPropagation();
            deleteInquiry(id);
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
            <div class="admin-empty-state admin-details-empty-state">
                <i class="fa-regular fa-envelope-open admin-empty-icon"></i>
                <span class="admin-empty-description">
                    Select an inquiry to view details
                </span>
            </div>
        `;
        return;
    }

    details.innerHTML = `
        <div class="flex-column gap-3">
            <div class="flex align-center gap-3">
                <div class="inquiry-avatar flex-center">${escapeHtml(getInitials(inquiry.name))}</div>
                <div class="flex-column flex-1">
                    <strong class="text-sm inquiry-name">${escapeHtml(inquiry.name)}</strong>
                    <span class="inquiry-status inquiry-status-${inquiry.status.toLowerCase()} w-fit">
                        ${escapeHtml(inquiry.status)}
                    </span>
                </div>
            </div>

            <div class="inquiry-info flex-column gap-1 text-xs">
                <span><i class="fa-regular fa-envelope"></i> ${escapeHtml(inquiry.email)}</span>
                <span><i class="fa-solid fa-phone"></i> ${escapeHtml(inquiry.phone)}</span>
                <span><i class="fa-regular fa-clock"></i> ${escapeHtml(formatDate(inquiry.date))}, ${escapeHtml(inquiry.time)}</span>
            </div>

            <div class="flex-column gap-1">
                <span class="inquiry-label">Subject</span>
                <strong class="text-sm inquiry-name">${escapeHtml(inquiry.subject)}</strong>
            </div>

            <div class="flex-column gap-1">
                <span class="inquiry-label">Message</span>
                <div class="inquiry-message text-xs">${escapeHtml(inquiry.message)}</div>
            </div>

            ${inquiry.reply ? `
                <div class="flex-column gap-1">
                    <span class="inquiry-label">Your Reply</span>
                    <div class="inquiry-message inquiry-reply text-xs">${escapeHtml(inquiry.reply)}</div>
                </div>
            ` : `
                <div class="flex-column gap-2">
                    <span class="inquiry-label">Reply</span>
                    <textarea id="inquiry-reply-input" class="input inquiry-reply-input" rows="4"
                        placeholder="Write a reply to ${escapeHtml(inquiry.name)}..."></textarea>
                    <button type="button" id="inquiry-send-btn" class="btn btn-primary inquiry-send-btn flex-center gap-2">
                        <i class="fa-solid fa-paper-plane"></i> Send Reply
                    </button>
                </div>
            `}
        </div>
    `;

    const sendBtn = details.querySelector('#inquiry-send-btn');
    if (sendBtn) {
        sendBtn.onclick = () => sendReply(inquiry);
    }
}

// ACTIONS
function selectInquiry(id) {
    selectedId = id;

    const inquiry = inquiries.find(i => i.id === id);
    if (inquiry && inquiry.status === 'New') {
        inquiry.status = 'Read';
    }

    renderPage();
}

function sendReply(inquiry) {
    const input = document.querySelector('#inquiry-reply-input');
    const reply = input ? input.value.trim() : '';

    if (!reply) {
        createNotificationElement({ status: 'failed', message: 'Please write a reply first.' });
        return;
    }

    // TODO: Send the reply through the API once the back end is ready.
    inquiry.reply = reply;
    inquiry.status = 'Replied';

    renderPage();
    createNotificationElement({ status: 'success', message: `Reply sent to ${escapeHtml(inquiry.name)}.` });
}

function deleteInquiry(id) {
    const inquiry = inquiries.find(i => i.id === id);
    if (!inquiry) return;

    if (!confirm(`Delete the inquiry from ${inquiry.name}?`)) return;

    inquiries = inquiries.filter(i => i.id !== id);

    if (selectedId === id) {
        selectedId = null;
    }

    renderPage();
    createNotificationElement({ status: 'success', message: 'Inquiry deleted.' });
}

// HELPERS
function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
}

function getInitials(name) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase())
        .join('');
}

function formatDate(date) {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}
