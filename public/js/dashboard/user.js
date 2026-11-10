import { escapeHtml, titleCase } from '../utils/string.js';
import { badge, emptyState, formatAppointmentDate } from './helpers.js';

/* ===================== USER DASHBOARD ===================== */

// PERSONALIZED GREETING
export function renderUserWelcome(user) {
    const heading = document.querySelector('#user-dashboard-greeting');
    if (!heading) return;

    const name = user?.name
        ?? user?.username
        ?? user?.full_name
        ?? user?.email
        ?? 'there';

    heading.textContent = `Hello, ${name}`;
}

// SUMMARY CARDS
export function renderUserStatCards(stats) {
    const container = document.querySelector('#user-stat-cards');
    if (!container) return;

    container.innerHTML = stats.map(stat => `
        <div class="dashboard-card user-stat-card user-stat-${escapeHtml(stat.key)}">
            <p class="user-stat-label">${escapeHtml(stat.label)}</p>
            <strong class="user-stat-value">${Number(stat.value).toLocaleString()}</strong>
        </div>
    `).join('');
}

// APPOINTMENT STATUS AND FEATURED NEXT APPOINTMENT
export function renderUserAppointmentStatus(appointments) {
    const list = document.querySelector('#user-appointment-status-list');
    if (!list) return;

    if (!appointments.length) {
        list.innerHTML = emptyState(
            'fa-regular fa-calendar',
            'No upcoming appointments.'
        );
        return;
    }

    const [nextAppointment, ...remainingAppointments] = appointments;

    list.innerHTML = `
        <li class="next-appointment-card">
            <span class="next-appointment-label">NEXT APPOINTMENT</span>
            <div class="next-appointment-main">
                <div>
                    <p class="next-appointment-date">
                        ${formatAppointmentDate(nextAppointment.date)} · ${escapeHtml(nextAppointment.time ?? '')}
                    </p>
                    <p class="next-appointment-details">
                        ${escapeHtml(nextAppointment.purpose ?? 'Appointment')}
                        · ${Number(nextAppointment.visitors ?? 1)} visitors
                    </p>
                </div>
                ${badge(nextAppointment.status)}
            </div>
        </li>
        ${remainingAppointments.map(appointment => `
            <li class="user-dashboard-row">
                <div>
                    <p class="dashboard-row-title">
                        ${formatAppointmentDate(appointment.date)} · ${escapeHtml(appointment.time ?? '')}
                    </p>
                    <p class="dashboard-row-sub">
                        ${escapeHtml(appointment.purpose ?? 'Appointment')}
                        · ${Number(appointment.visitors ?? 1)} visitors
                    </p>
                </div>
                ${badge(appointment.status)}
            </li>
        `).join('')}
    `;
}

// PRODUCT AVAILABILITY PREVIEW
export function renderUserProductAvailability(products) {
    const list = document.querySelector('#user-product-availability-list');
    if (!list) return;

    if (!products.length) {
        list.innerHTML = emptyState(
            'fa-solid fa-box-open',
            'No products available to display.'
        );
        return;
    }

    list.innerHTML = products.map(product => `
        <li class="product-availability-row">
            <div class="product-availability-info">
                <p class="dashboard-row-title">${escapeHtml(product.name)}</p>
                <p class="dashboard-row-sub">${escapeHtml(titleCase(product.category ?? ''))}</p>
            </div>
            ${badge(product.status)}
        </li>
    `).join('');
}

// RECENT INQUIRY UPDATES
export function renderUserInquiryUpdates(inquiries) {
    const list = document.querySelector('#user-inquiry-updates-list');
    if (!list) return;

    if (!inquiries.length) {
        list.innerHTML = emptyState(
            'fa-regular fa-message',
            'No inquiries yet.'
        );
        return;
    }

    list.innerHTML = inquiries.map(inquiry => `
        <li class="user-inquiry-card">
            <p class="dashboard-row-title">${escapeHtml(inquiry.subject ?? 'Untitled inquiry')}</p>
            <p class="dashboard-row-sub">${escapeHtml(inquiry.date ?? '')}</p>
            ${badge(inquiry.status ?? 'Pending')}
        </li>
    `).join('');
}
