import { escapeHtml, titleCase } from '../utils/string.js';
import { badge, emptyState, formatAppointmentDate } from './helpers.js';

/* ===================== ADMIN DASHBOARD ===================== */

// INVENTORY SUMMARY CARDS
export function renderAdminStatCards(stats) {
    const container = document.querySelector('#admin-stat-cards');
    if (!container) return;

    container.innerHTML = stats.map(stat => `
        <div class="dashboard-card admin-stat-card admin-stat-${escapeHtml(stat.key)} flex-column gap-4">
            <div class="flex-between">
                <span class="admin-stat-label">${escapeHtml(stat.label)}</span>
                <div class="admin-stat-icon flex-center">
                    <i class="${escapeHtml(stat.icon)}"></i>
                </div>
            </div>
            <strong class="admin-stat-value">${Number(stat.value).toLocaleString()}</strong>
        </div>
    `).join('');
}

// INVENTORY AVAILABILITY DONUT CHART
export function renderInventoryChart(inventory) {
    const chart = document.querySelector('#inventory-chart');
    const donut = document.querySelector('#inventory-donut');
    const legend = document.querySelector('#inventory-legend');
    const tooltip = document.querySelector('#inventory-tooltip');

    if (!chart || !donut || !legend) return;

    const total = inventory.reduce((sum, slice) => sum + slice.value, 0);

    if (total === 0) {
        donut.style.background = '#E9ECEF';
        legend.innerHTML = '';
        chart.setAttribute('aria-label', 'No products registered yet.');

        if (tooltip) tooltip.classList.add('hidden');

        return;
    }

    const gap = 3 / 360 * 100;
    const visible = inventory.filter(slice => slice.value > 0);
    const ranges = [];
    let start = 0;

    const slices = visible.map((slice, index) => {
        const end = start + (slice.value / total) * 100;
        const sliceEnd = index < visible.length - 1 ? end - gap : end;

        ranges.push({ slice, start, end });
        start = end;

        return `${slice.color} ${ranges[ranges.length - 1].start}% ${Math.max(sliceEnd, ranges[ranges.length - 1].start)}%`;
    });

    donut.style.background = `conic-gradient(${slices.join(', ')})`;

    legend.innerHTML = inventory.map(slice => `
        <span class="flex align-center gap-1">
            <span class="legend-dot" style="background-color: ${slice.color}"></span>
            ${escapeHtml(slice.label)}
        </span>
    `).join('');

    if (!tooltip) return;

    donut.onmousemove = event => {
        const box = donut.getBoundingClientRect();
        const x = event.clientX - box.left - box.width / 2;
        const y = event.clientY - box.top - box.height / 2;
        const distance = Math.hypot(x, y);

        if (distance < box.width / 4 || distance > box.width / 2) {
            tooltip.classList.add('hidden');
            return;
        }

        const angle = (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360;
        const percent = angle / 360 * 100;
        const hit = ranges.find(range => percent >= range.start && percent < range.end);

        if (!hit) return;

        tooltip.innerHTML = `${escapeHtml(hit.slice.label)}: <strong>${hit.slice.value} product${hit.slice.value !== 1 ? 's' : ''}</strong>`;

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

    if (!alerts.length) {
        list.innerHTML = emptyState(
            'fa-regular fa-circle-check',
            'All products are well-stocked.'
        );
        return;
    }

    list.innerHTML = [...alerts]
        .sort((a, b) => a.units - b.units)
        .map(alert => `
            <li class="stock-alert-row flex-between gap-3">
                <div class="flex align-center gap-3">
                    <span class="stock-alert-icon">${escapeHtml(alert.icon)}</span>
                    <div>
                        <p class="dashboard-row-title">${escapeHtml(alert.name)}</p>
                        <p class="dashboard-row-sub">${escapeHtml(titleCase(alert.category ?? ''))}</p>
                    </div>
                </div>
                <div class="flex align-center gap-3">
                    ${badge(alert.status)}
                </div>
            </li>
        `).join('');
}

// UPCOMING APPOINTMENTS (ADMIN)
export function renderUpcomingAppointments(appointments) {
    const list = document.querySelector('#upcoming-appointments-list');
    if (!list) return;

    if (!appointments.length) {
        list.innerHTML = emptyState(
            'fa-regular fa-calendar',
            'No upcoming appointments.'
        );
        return;
    }

    list.innerHTML = appointments.map(appointment => `
        <li class="appointment-row-card flex-between gap-3">
            <div>
                <p class="dashboard-row-title">${escapeHtml(appointment.customer)}</p>
                <p class="dashboard-row-sub">${escapeHtml(appointment.purpose)}</p>
                <p class="dashboard-row-sub">${formatAppointmentDate(appointment.date)} &middot; ${escapeHtml(appointment.time)}</p>
            </div>
            ${badge(appointment.status)}
        </li>
    `).join('');
}

// DASHBOARD NAVIGATION LINKS
export function setupDashboardLinks() {
    document.querySelectorAll('.dashboard-link-btn').forEach(button => {
        button.onclick = () => {
            const page = button.dataset.page;
            const option = document.querySelector(`.option[data-page="${page}"]`);

            if (option) option.click();
        };
    });
}
