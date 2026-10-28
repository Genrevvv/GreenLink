import { escapeHtml } from '../utils/string.js';
import { 
    setText, 
    emptyState, 
    formatMonth, 
    formatDay
} from './dashbord-helpers.js'; 

// STAT CARDS (user dashboard)
export function renderStatCards(stats) {
    const container = document.querySelector('#stat-cards');
    if (!container) return;

    container.innerHTML = stats.map(stat => `
        <div class="card stat-card stat-card-${stat.key} flex-column gap-2 shadow-bottom">
            <div class="flex-between">
                <span class="text-xs stat-card-label">${escapeHtml(stat.label)}</span>
                <div class="stat-card-icon flex-center"><i class="${stat.icon}"></i></div>
            </div>
            <strong class="stat-card-value">${stat.value.toLocaleString()}</strong>
            ${stat.subLabel ? `
                <span class="text-xs stat-card-sub">
                    <strong>${stat.subValue}</strong> ${escapeHtml(stat.subLabel)}
                </span>
            ` : ''}
        </div>
    `).join('');
}

/* ===================== ADMIN DASHBOARD ===================== */

// SUMMARY CARDS
export function renderAdminStatCards(stats) {
    const container = document.querySelector('#admin-stat-cards');
    if (!container) return;

    container.innerHTML = stats.map(stat => `
        <div class="admin-stat-card admin-stat-${stat.key} flex-column justify-between">
            <div class="flex-between">
                <span class="text-xs bold admin-stat-label">${escapeHtml(stat.label)}</span>
                <div class="admin-stat-icon flex-center"><i class="${stat.icon}"></i></div>
            </div>
            <strong class="admin-stat-value">${stat.value.toLocaleString()}</strong>
        </div>
    `).join('');
}

// INVENTORY AVAILABILITY (donut chart)
export function renderInventoryChart(inventory) {
    const donut = document.querySelector('#inventory-donut');
    const legend = document.querySelector('#inventory-legend');
    if (!donut || !legend) return;

    const total = inventory.reduce((sum, slice) => sum + slice.value, 0);

    // Build the slices with a conic gradient (small white gap between slices)
    let start = 0;
    const slices = inventory
        .filter(slice => slice.value > 0)
        .map(slice => {
            const end = start + (slice.value / total) * 100;
            const part = `${slice.color} ${start}% calc(${end}% - 0.4%), white calc(${end}% - 0.4%) ${end}%`;
            start = end;
            return part;
        });

    donut.style.background = total > 0
        ? `conic-gradient(${slices.join(', ')})`
        : '#e5e7eb';

    donut.title = inventory.map(slice => `${slice.label}: ${slice.value}`).join(' | ');

    legend.innerHTML = inventory.map(slice => `
        <span class="flex align-center gap-1">
            <span class="legend-dot" style="background-color: ${slice.color}"></span>
            ${escapeHtml(slice.label)}
        </span>
    `).join('');
}

// STOCK ALERTS
export function renderStockAlerts(alerts) {
    const list = document.querySelector('#stock-alerts-list');
    if (!list) return;

    if (alerts.length === 0) {
        list.innerHTML = emptyState('fa-regular fa-circle-check', 'All products are in stock');
        return;
    }

    list.innerHTML = alerts.map(alert => `
        <li class="dashboard-row flex-between gap-3">
            <div class="flex align-center gap-3">
                <span class="stock-alert-icon">${alert.icon}</span>
                <div class="flex-column">
                    <span class="text-sm bold dashboard-row-title">${escapeHtml(alert.name)}</span>
                    <span class="text-xs dashboard-row-sub">${escapeHtml(alert.category)}</span>
                </div>
            </div>
            <div class="flex align-center gap-2">
                <span class="text-sm bold">${alert.units} units</span>
                <span class="dashboard-pill pill-out-of-stock">${escapeHtml(alert.status)}</span>
            </div>
        </li>
    `).join('');
}

// UPCOMING APPOINTMENTS
export function renderUpcomingAppointments(appointments) {
    const list = document.querySelector('#upcoming-appointments-list');
    if (!list) return;

    if (appointments.length === 0) {
        list.innerHTML = emptyState('fa-regular fa-calendar', 'No upcoming appointments');
        return;
    }

    list.innerHTML = appointments.map(appointment => `
        <li class="dashboard-row appointment-row-card flex-between gap-3">
            <div class="flex-column">
                <span class="text-sm bold dashboard-row-title">${escapeHtml(appointment.customer)}</span>
                <span class="text-xs dashboard-row-sub">${escapeHtml(appointment.purpose)}</span>
                <span class="text-xs dashboard-row-sub">
                    ${escapeHtml(formatFullDate(appointment.date))} &middot; ${escapeHtml(appointment.time)}
                </span>
            </div>
            <span class="dashboard-pill pill-${appointment.status.toLowerCase()}">${escapeHtml(appointment.status)}</span>
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

function formatFullDate(date) {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

/* ===================== USER DASHBOARD ===================== */

// WELCOME BANNER
export function renderWelcome(user) {
    const name = user?.username ? escapeHtml(user.username) : 'there';
    const welcome = document.querySelector('#welcome-name');
    if (welcome) welcome.innerHTML = name;
}

// QUICK ACTIONS (opens the page through the sidebar)
export function renderQuickActions(actions) {
    const container = document.querySelector('#quick-actions');
    if (!container) return;

    container.innerHTML = actions.map(action => `
        <button type="button" class="quick-action flex align-center gap-3 p-3 text-left" data-page="${action.page}">
            <div class="quick-action-icon flex-center"><i class="${action.icon}"></i></div>
            <div class="flex-column flex-1">
                <span class="text-sm bold">${escapeHtml(action.label)}</span>
                <span class="text-xs dashboard-muted">${escapeHtml(action.description)}</span>
            </div>
            <i class="fa-solid fa-chevron-right quick-action-arrow"></i>
        </button>
    `).join('');

    container.querySelectorAll('.quick-action').forEach(button => {
        button.onclick = () => {
            const option = document.querySelector(`.option[data-page="${button.dataset.page}"]`);
            if (option) option.click();
        };
    });
}

// MY RECENT ORDERS
export function renderUserRecentOrders(orders) {
    const list = document.querySelector('#user-orders-list');
    if (!list) return;

    if (orders.length === 0) {
        list.innerHTML = emptyState('fa-solid fa-cart-shopping', 'You have no orders yet');
        return;
    }

    list.innerHTML = orders.map(order => `
        <li class="dashboard-list-item flex-between gap-3">
            <div class="flex align-center gap-3 flex-1">
                <div class="dashboard-list-icon flex-center"><i class="fa-solid fa-receipt"></i></div>
                <div class="flex-column flex-1">
                    <span class="text-sm bold">${escapeHtml(order.items)}</span>
                    <span class="text-xs dashboard-muted">
                        ${escapeHtml(order.id)} &middot; ${formatMonth(order.date)} ${formatDay(order.date)}
                    </span>
                </div>
            </div>
            <div class="flex-column text-right">
                <span class="text-sm bold">₱${order.total.toLocaleString()}</span>
                <span class="status-pill status-${order.status.toLowerCase()}">${escapeHtml(order.status)}</span>
            </div>
        </li>
    `).join('');
}

// MY UPCOMING APPOINTMENTS
export function renderUserAppointments(appointments) {
    const list = document.querySelector('#user-upcoming-list');
    if (!list) return;

    if (appointments.length === 0) {
        list.innerHTML = emptyState('fa-regular fa-calendar', 'No upcoming appointments');
        return;
    }

    list.innerHTML = appointments.map(appointment => `
        <li class="dashboard-list-item flex-between gap-3">
            <div class="flex align-center gap-3 flex-1">
                <div class="date-badge flex-column flex-center">
                    <span class="date-badge-month">${formatMonth(appointment.date)}</span>
                    <strong class="date-badge-day">${formatDay(appointment.date)}</strong>
                </div>
                <div class="flex-column flex-1">
                    <span class="text-sm bold">${escapeHtml(appointment.purpose)}</span>
                    <span class="text-xs dashboard-muted">
                        ${escapeHtml(appointment.time)} &middot;
                        <i class="fa-solid fa-user-group"></i> ${appointment.visitors}
                    </span>
                </div>
            </div>
            <span class="status-pill status-${appointment.status.toLowerCase()}">${escapeHtml(appointment.status)}</span>
        </li>
    `).join('');
}
