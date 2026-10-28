export function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
}

export function emptyState(icon, text) {
    return `
        <li class="dashboard-empty flex-column flex-center gap-2 p-4">
            <i class="${icon}"></i>
            <span class="text-xs">${escapeHtml(text)}</span>
        </li>
    `;
}

export function formatMonth(date) {
    return new Date(`${date}T00:00:00`).toLocaleString('en-US', { month: 'short' });
}

export function formatDay(date) {
    return new Date(`${date}T00:00:00`).getDate();
}
