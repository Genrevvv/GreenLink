import { escapeHtml } from '../utils/string.js';
import { 
    setText, 
    emptyState, 
    formatMonth, 
    formatDay
} from './dashbord-helpers.js'; 

// STAT CARDS
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
            <span class="text-xs stat-card-sub">
                <strong>${stat.subValue}</strong> ${escapeHtml(stat.subLabel)}
            </span>
        </div>
    `).join('');
}

// MONTHLY ACTIVITY (bar chart)
export function renderMonthlyActivity(activity) {
    const chart = document.querySelector('#activity-chart');
    if (!chart) return;

    const maxValue = Math.max(...activity.map(m => Math.max(m.orders, m.appointments)), 1);
    const percent = value => Math.round((value / maxValue) * 100);

    chart.innerHTML = activity.map(m => `
        <div class="activity-month flex-column align-center gap-1 h-full">
            <div class="activity-bars flex justify-center gap-1 w-full">
                <div class="activity-bar activity-bar-orders" style="height: ${percent(m.orders)}%"
                     title="${m.orders} orders">
                    <span class="activity-bar-value">${m.orders}</span>
                </div>
                <div class="activity-bar activity-bar-appointments" style="height: ${percent(m.appointments)}%"
                     title="${m.appointments} appointments">
                    <span class="activity-bar-value">${m.appointments}</span>
                </div>
            </div>
            <span class="text-xs activity-month-label">${escapeHtml(m.month)}</span>
        </div>
    `).join('');

    const totalOrders = activity.reduce((sum, m) => sum + m.orders, 0);
    const totalAppointments = activity.reduce((sum, m) => sum + m.appointments, 0);

    setText('#activity-total-orders', totalOrders);
    setText('#activity-total-appointments', totalAppointments);
}

// RECENT ORDERS
export function renderRecentOrders(orders) {
    const list = document.querySelector('#recent-orders-list');
    if (!list) return;

    setText('#recent-orders-count', orders.length);

    if (orders.length === 0) {
        list.innerHTML = emptyState('fa-solid fa-cart-shopping', 'No recent orders');
        return;
    }

    list.innerHTML = orders.map(order => `
        <li class="dashboard-list-item flex-between gap-3">
            <div class="flex align-center gap-3 flex-1">
                <div class="dashboard-list-icon flex-center"><i class="fa-solid fa-receipt"></i></div>
                <div class="flex-column flex-1">
                    <span class="text-sm bold">${escapeHtml(order.customer)}</span>
                    <span class="text-xs dashboard-muted">
                        ${escapeHtml(order.id)} &middot; ${escapeHtml(order.items)}
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

// PENDING APPOINTMENT REQUESTS
export function renderPendingAppointments(appointments) {
    const list = document.querySelector('#pending-appointments-list');
    if (!list) return;

    setText('#pending-appointments-count', appointments.length);

    if (appointments.length === 0) {
        list.innerHTML = emptyState('fa-regular fa-calendar-check', 'No pending requests');
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
                    <span class="text-sm bold">${escapeHtml(appointment.customer)}</span>
                    <span class="text-xs dashboard-muted">
                        ${escapeHtml(appointment.purpose)} &middot; ${escapeHtml(appointment.time)}
                    </span>
                </div>
            </div>
            <div class="flex-column text-right">
                <span class="text-xs dashboard-muted">
                    <i class="fa-solid fa-user-group"></i> ${appointment.visitors}
                </span>
                <span class="status-pill status-pending">Pending</span>
            </div>
        </li>
    `).join('');
}