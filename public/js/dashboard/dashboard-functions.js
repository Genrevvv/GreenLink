import { escapeHtml } from '../utils/string.js';
import { emptyState } from './dashbord-helpers.js'; 

// Badge colors for each status
const badgeClasses = {
    'in stock': 'badge-green',
    'out of stock': 'badge-red',
    'confirmed': 'badge-green',
    'approved': 'badge-green',
    'responded': 'badge-green',
    'pending': 'badge-yellow'
};

function badge(status) {
    const badgeClass = badgeClasses[status.toLowerCase()] ?? 'badge-gray';
    return `<span class="dashboard-badge ${badgeClass}">${escapeHtml(status)}</span>`;
}

/* ===================== ADMIN DASHBOARD ===================== */

// INVENTORY SUMMARY CARDS
export function renderAdminStatCards(stats) {
    const container = document.querySelector('#admin-stat-cards');
    if (!container) return;

    container.innerHTML = stats.map(stat => `
        <div class="dashboard-card admin-stat-card admin-stat-${stat.key} flex-column gap-4">
            <div class="flex-between">
                <span class="admin-stat-label">${escapeHtml(stat.label)}</span>
                <div class="admin-stat-icon flex-center"><i class="${stat.icon}"></i></div>
            </div>
            <strong class="admin-stat-value">${stat.value.toLocaleString()}</strong>
        </div>
    `).join('');
}

// INVENTORY AVAILABILITY (doughnut chart)
export function renderInventoryChart(inventory) {
    const chart = document.querySelector('#inventory-chart');
    const donut = document.querySelector('#inventory-donut');
    const legend = document.querySelector('#inventory-legend');
    const tooltip = document.querySelector('#inventory-tooltip');
    if (!chart || !donut || !legend) return;

    const total = inventory.reduce((sum, slice) => sum + slice.value, 0);

    if (total === 0) {
        chart.innerHTML = `
            <div class="dashboard-empty flex-column flex-center gap-2">
                <i class="fa-solid fa-box"></i>
                <span>No products registered yet.</span>
            </div>
        `;
        return;
    }

    // Build the slices with a conic gradient, with a small gap between slices
    const gap = 3 / 360 * 100;
    const visible = inventory.filter(slice => slice.value > 0);
    const ranges = [];
    let start = 0;

    const slices = visible.map(slice => {
        const end = start + (slice.value / total) * 100;
        const sliceEnd = visible.length > 1 ? end - gap : end;
        ranges.push({ slice, start, end });
        const part = `${slice.color} ${start}% ${sliceEnd}%, white ${sliceEnd}% ${end}%`;
        start = end;
        return part;
    });

    donut.style.background = `conic-gradient(${slices.join(', ')})`;

    legend.innerHTML = inventory.map(slice => `
        <span class="flex align-center gap-1">
            <span class="legend-dot" style="background-color: ${slice.color}"></span>
            ${escapeHtml(slice.label)}
        </span>
    `).join('');

    // Tooltip: find the slice under the mouse from its angle
    if (!tooltip) return;

    donut.onmousemove = event => {
        const box = donut.getBoundingClientRect();
        const x = event.clientX - box.left - box.width / 2;
        const y = event.clientY - box.top - box.height / 2;
        const distance = Math.hypot(x, y);

        if (distance < box.width / 2 - 30 || distance > box.width / 2) {
            tooltip.classList.add('hidden');
            return;
        }

        const angle = (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360;
        const percent = angle / 360 * 100;
        const hit = ranges.find(range => percent >= range.start && percent < range.end);
        if (!hit) return;

        const count = hit.slice.value;
        tooltip.innerHTML = `${escapeHtml(hit.slice.label)}: <strong>${count} product${count !== 1 ? 's' : ''}</strong>`;

        const chartBox = chart.getBoundingClientRect();
        tooltip.style.left = `${event.clientX - chartBox.left + 12}px`;
        tooltip.style.top = `${event.clientY - chartBox.top + 12}px`;
        tooltip.classList.remove('hidden');
    };

    donut.onmouseleave = () => tooltip.classList.add('hidden');
}

// STOCK ALERTS
export function renderStockAlerts(alerts) {
    const list = document.querySelector('#stock-alerts-list');
    if (!list) return;

    if (alerts.length === 0) {
        list.innerHTML = `
            <li class="dashboard-empty flex-column flex-center gap-2">
                <i class="fa-regular fa-circle-check" style="color: var(--base-green)"></i>
                <span>All products are well-stocked.</span>
            </li>
        `;
        return;
    }

    list.innerHTML = [...alerts]
        .sort((a, b) => a.units - b.units)
        .map(alert => `
            <li class="stock-alert-row flex-between gap-3">
                <div class="flex align-center gap-3">
                    <span class="stock-alert-icon">${alert.icon}</span>
                    <div>
                        <p class="dashboard-row-title">${escapeHtml(alert.name)}</p>
                        <p class="dashboard-row-sub">${escapeHtml(alert.category)}</p>
                    </div>
                </div>
                <div class="flex align-center gap-3">
                    <span class="stock-alert-units">${alert.units} ${alert.units === 1 ? 'unit' : 'units'}</span>
                    ${badge(alert.status)}
                </div>
            </li>
        `).join('');
}

// UPCOMING APPOINTMENTS
export function renderUpcomingAppointments(appointments) {
    const list = document.querySelector('#upcoming-appointments-list');
    if (!list) return;

    if (appointments.length === 0) {
        list.classList.remove('grid-2');
        list.innerHTML = emptyState('fa-regular fa-calendar', 'No upcoming appointments.');
        return;
    }

    list.innerHTML = appointments.map(appointment => `
        <li class="appointment-row-card flex-between gap-3">
            <div>
                <p class="dashboard-row-title">${escapeHtml(appointment.customer)}</p>
                <p class="dashboard-row-sub">${escapeHtml(appointment.type)}</p>
                <p class="dashboard-row-sub">${escapeHtml(appointment.date)} &middot; ${escapeHtml(appointment.time)}</p>
            </div>
            ${badge(appointment.status)}
        </li>
    `).join('');
}

// "View Products" / "View All" buttons open the page through the sidebar
export function setupDashboardLinks() {
    document.querySelectorAll('.dashboard-link-btn').forEach(button => {
        button.onclick = () => {
            const option = document.querySelector(`.option[data-page="${button.dataset.page}"]`);
            if (option) option.click();
        };
    });
}

/* ===================== USER DASHBOARD ===================== */

// SUMMARY CARDS
export function renderUserStatCards(stats) {
    const container = document.querySelector('#user-stat-cards');
    if (!container) return;

    container.innerHTML = stats.map(stat => `
        <div class="dashboard-card dashboard-card-lg user-stat-card user-stat-${stat.key} flex align-center">
            <div class="user-stat-icon flex-center"><i class="${stat.icon}"></i></div>
            <div class="user-stat-text flex-1">
                <p class="user-stat-label">${escapeHtml(stat.label)}</p>
                <p class="user-stat-value">${stat.value.toLocaleString()}</p>
            </div>
        </div>
    `).join('');
}

// APPOINTMENT STATUS
export function renderUserAppointmentStatus(appointments) {
    const list = document.querySelector('#user-appointment-status-list');
    if (!list) return;

    if (appointments.length === 0) {
        list.innerHTML = emptyState('fa-regular fa-calendar', 'No appointments yet.');
        return;
    }

    list.innerHTML = appointments.map(appointment => `
        <li class="user-dashboard-row flex-between gap-3">
            <div class="flex-1">
                <p class="dashboard-row-title">${escapeHtml(appointment.date)}</p>
                <p class="dashboard-row-sub">${escapeHtml(appointment.time)} &bull; ${appointment.visitors} visitors</p>
            </div>
            ${badge(appointment.status)}
        </li>
    `).join('');
}

// RECENT INQUIRY UPDATES
export function renderUserInquiryUpdates(inquiries) {
    const list = document.querySelector('#user-inquiry-updates-list');
    if (!list) return;

    if (inquiries.length === 0) {
        list.innerHTML = emptyState('fa-regular fa-message', 'No inquiries yet.');
        return;
    }

    list.innerHTML = inquiries.map(inquiry => `
        <li class="user-dashboard-row flex-between gap-3">
            <div class="flex-1">
                <p class="dashboard-row-title">${escapeHtml(inquiry.subject)}</p>
                <p class="dashboard-row-sub">${escapeHtml(inquiry.date)}</p>
            </div>
            ${badge(inquiry.status)}
        </li>
    `).join('');
}
