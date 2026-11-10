import { escapeHtml } from '../utils/string.js';

export function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
}

export function emptyState(icon, text) {
    return `
        <li class="dashboard-empty flex-column flex-center gap-2 p-4">
            <i class="${icon}"></i>
            <span>${escapeHtml(text)}</span>
        </li>
    `;
}

export function formatMonth(date) {
    return new Date(`${date}T00:00:00`).toLocaleString('en-US', { month: 'short' });
}

export function formatDay(date) {
    return new Date(`${date}T00:00:00`).getDate();
}

/* ===================== STATUS BADGES ===================== */

const badgeClasses = {
    'in stock': 'badge-green',
    'out of stock': 'badge-red',
    'low stock': 'badge-yellow',
    'confirmed': 'badge-green',
    'approved': 'badge-green',
    'responded': 'badge-green',
    'answered': 'badge-green',
    'resolved': 'badge-green',
    'closed': 'badge-green',
    'pending': 'badge-yellow'
};

export function badge(status) {
    const safeStatus = String(status ?? 'Pending');
    const badgeClass = badgeClasses[safeStatus.toLowerCase()] ?? 'badge-gray';

    return `<span class="dashboard-badge ${badgeClass}">${escapeHtml(safeStatus)}</span>`;
}

export function formatAppointmentDate(dateString) {
    if (!dateString) return 'Date unavailable';

    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) return escapeHtml(dateString);

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}
