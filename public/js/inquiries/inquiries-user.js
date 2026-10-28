import { escapeHtml } from '../utils/string.js';
import { createNotificationElement } from '../utils/notification/notification.js';
import { userInquiriesData, inquiryCategories } from './inquiries-data.js';

// Page state (front-end only, changes are kept in memory)
let myInquiries = [];
let activeFilter = 'All';
let openId = null;

export function initUserInquiries() {
    myInquiries = userInquiriesData.map(inquiry => ({ ...inquiry }));
    activeFilter = 'All';
    openId = null;

    renderCategoryOptions();
    setupInquiryForm();
    setupFilterTabs();
    renderMyInquiries();
}

// FORM
function renderCategoryOptions() {
    const select = document.querySelector('#inquiry-category');
    if (!select) return;

    select.innerHTML = `
        <option value="">Select a category</option>
        ${inquiryCategories.map(category => `
            <option value="${escapeHtml(category)}">${escapeHtml(category)}</option>
        `).join('')}
    `;
}

function setupInquiryForm() {
    const form = document.querySelector('#user-inquiry-form');
    const message = document.querySelector('#inquiry-message');
    const counter = document.querySelector('#inquiry-message-count');

    if (message && counter) {
        message.oninput = () => {
            counter.textContent = `${message.value.length} / ${message.maxLength}`;
        };
    }

    if (!form) return;

    form.onsubmit = event => {
        event.preventDefault();

        const category = form.querySelector('#inquiry-category').value;
        const subject = form.querySelector('#inquiry-subject').value.trim();
        const text = message.value.trim();

        if (!category || !subject || !text) {
            createNotificationElement({ status: 'failed', message: 'Please fill in all fields.' });
            return;
        }

        // TODO: Send the inquiry through the API once the back end is ready.
        const now = new Date();
        myInquiries.unshift({
            id: Date.now(),
            subject,
            category,
            message: text,
            date: [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-'),
            time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: 'Pending',
            reply: ''
        });

        form.reset();
        if (counter) counter.textContent = `0 / ${message.maxLength}`;

        renderMyInquiries();
        createNotificationElement({ status: 'success', message: 'Your inquiry has been sent.' });
    };
}

// FILTER TABS
function setupFilterTabs() {
    const tabs = document.querySelectorAll('.inquiries-tab');

    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeFilter = tab.dataset.filter;
            renderMyInquiries();
        };
    });
}

// MY INQUIRIES LIST
function renderMyInquiries() {
    const list = document.querySelector('#user-inquiries-list');
    if (!list) return;

    const count = document.querySelector('#user-inquiries-count');
    if (count) count.textContent = myInquiries.length;

    const rows = myInquiries.filter(inquiry => activeFilter === 'All' || inquiry.status === activeFilter);

    if (rows.length === 0) {
        list.innerHTML = `
            <li class="admin-empty-state">
                <i class="fa-regular fa-comments admin-empty-icon"></i>
                <strong class="admin-empty-title">No inquiries yet</strong>
                <span class="admin-empty-description">Inquiries you send will appear here.</span>
            </li>
        `;
        return;
    }

    list.innerHTML = rows.map(inquiry => {
        const isOpen = inquiry.id === openId;

        return `
            <li class="user-inquiry-card ${isOpen ? 'open' : ''}" data-id="${inquiry.id}">
                <button type="button" class="user-inquiry-summary flex-between gap-3 w-full text-left">
                    <div class="flex-column flex-1">
                        <strong class="text-sm inquiry-name">${escapeHtml(inquiry.subject)}</strong>
                        <span class="text-xs inquiry-muted">
                            ${escapeHtml(inquiry.category)} &middot; ${escapeHtml(formatDate(inquiry.date))}, ${escapeHtml(inquiry.time)}
                        </span>
                    </div>
                    <span class="inquiry-status inquiry-status-${inquiry.status.toLowerCase()}">
                        ${escapeHtml(inquiry.status)}
                    </span>
                    <i class="fa-solid fa-chevron-down user-inquiry-chevron"></i>
                </button>

                <div class="user-inquiry-body flex-column gap-3">
                    <div class="flex-column gap-1">
                        <span class="inquiry-label">Your Message</span>
                        <div class="inquiry-message text-xs">${escapeHtml(inquiry.message)}</div>
                    </div>

                    <div class="flex-column gap-1">
                        <span class="inquiry-label">Reply from Greens for Growth</span>
                        ${inquiry.reply
                            ? `<div class="inquiry-message inquiry-reply text-xs">${escapeHtml(inquiry.reply)}</div>`
                            : `<span class="text-xs inquiry-muted">
                                   <i class="fa-regular fa-hourglass-half"></i> Waiting for a reply.
                               </span>`}
                    </div>
                </div>
            </li>
        `;
    }).join('');

    list.querySelectorAll('.user-inquiry-card').forEach(card => {
        card.querySelector('.user-inquiry-summary').onclick = () => {
            const id = Number(card.dataset.id);
            openId = openId === id ? null : id;
            renderMyInquiries();
        };
    });
}

// HELPERS
function formatDate(date) {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}
