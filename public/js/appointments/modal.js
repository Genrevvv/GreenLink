import { escapeHtml } from '../utils/string.js';
import { formatDuration, formatTimeRange } from './schedule.js';

const statusClasses = {
    Pending: 'pending',
    Approved: 'approved',
    Rejected: 'rejected',
    Cancelled: 'cancelled'
};

function getStatusModifier(status) {
    return statusClasses[status] ?? 'pending';
}

// APPOINTMENT TABLE
export function emptyAppointmentsRowModal(isFiltered = false) {
    return `
        <tr>
            <td colspan="6" class="admin-table-empty-cell">
                <div class="admin-empty-state">
                    <i class="fa-regular fa-calendar-xmark admin-empty-icon"></i>
                    <strong class="admin-empty-title">No appointments found</strong>
                    <span class="admin-empty-description">
                        ${isFiltered
                            ? 'No appointments match the selected status.'
                            : 'No appointment requests received yet.'}
                    </span>
                </div>
            </td>
        </tr>
    `;
}

export function appointmentRowModal(appointment) {
    const customer = escapeHtml(appointment.customer);
    const date = escapeHtml(appointment.date);
    const timeRange = escapeHtml(formatTimeRange(appointment));
    const purpose = escapeHtml(appointment.purpose);
    const visitors = escapeHtml(appointment.visitors);
    const status = escapeHtml(appointment.status);

    const isApproved = appointment.status === 'Approved';
    const isPending = appointment.status === 'Pending';

    const statusClass = `appointment-status-${getStatusModifier(appointment.status)}`;

    return `
        <td class="appointment-cell appointment-customer">
            <strong>${customer}</strong>
        </td>
        <td class="appointment-cell appointment-date">
            ${date}
            <br>
            <small>${timeRange}</small>
        </td>
        <td class="appointment-cell appointment-purpose">
            ${purpose}
        </td>
        <td class="appointment-cell appointment-visitors">
            ${visitors}
        </td>
        <td class="appointment-cell">
            <span class="appointment-status ${statusClass}">
                ${status}
            </span>
        </td>
        <td class="appointment-cell appointment-actions">
            ${isPending ? `
                <button
                    type="button"
                    class="approve-btn appointment-action-btn appointment-approve-btn"
                    title="Approve appointment"
                    aria-label="Approve appointment">
                    <i class="fa-solid fa-check"></i>
                </button>
                <button
                    type="button"
                    class="reject-btn appointment-action-btn appointment-reject-btn"
                    title="Reject appointment"
                    aria-label="Reject appointment">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            ` : ''}
            ${isApproved ? `
                <button
                    type="button"
                    class="cancel-btn appointment-action-btn appointment-cancel-btn"
                    title="Cancel appointment"
                    aria-label="Cancel appointment">
                    <i class="fa-solid fa-ban"></i>
                </button>
            ` : ''}
        </td>
    `;
}

// APPOINTMENT DETAILS
export function emptyAppointmentDetailsModal() {
    return `
        <div class="admin-empty-state admin-details-empty-state">
            <i class="fa-regular fa-calendar admin-empty-icon"></i>
            <span class="admin-empty-description">
                Select an appointment to view details
            </span>
        </div>
    `;
}

export function appointmentDetailsModal(appointment) {
    const customer = escapeHtml(appointment.customer);
    const email = escapeHtml(appointment.email);
    const date = escapeHtml(appointment.date);
    const timeRange = escapeHtml(formatTimeRange(appointment));
    const duration = escapeHtml(formatDuration(appointment.duration || 60));
    const visitors = escapeHtml(appointment.visitors);
    const purpose = escapeHtml(appointment.purpose);
    const status = escapeHtml(appointment.status);

    const notes = escapeHtml(
        appointment.notes || 'No notes provided.'
    );

    return `
        <div class="appointment-details-list">
            <div class="appointment-detail-item">
                <span class="appointment-detail-label">Customer Name</span>
                <strong class="appointment-detail-value">${customer}</strong>
            </div>

            <div class="appointment-detail-item">
                <span class="appointment-detail-label">Email</span>
                <strong class="appointment-detail-value">${email}</strong>
            </div>

            <div class="appointment-detail-item">
                <span class="appointment-detail-label">Date &amp; Time</span>
                <strong class="appointment-detail-value">
                    ${date} at ${timeRange}
                </strong>
            </div>

            <div class="appointment-detail-item">
                <span class="appointment-detail-label">Estimated Duration</span>
                <strong class="appointment-detail-value">${duration}</strong>
            </div>

            <div class="appointment-detail-item">
                <span class="appointment-detail-label">Visitors &amp; Purpose</span>
                <strong class="appointment-detail-value">
                    ${visitors} visitors - ${purpose}
                </strong>
            </div>

            <div class="appointment-detail-item">
                <span class="appointment-detail-label">Status</span>
                <strong class="appointment-detail-value">${status}</strong>
            </div>

            <div class="appointment-detail-item">
                <span class="appointment-detail-label">Notes</span>
                <span class="appointment-detail-notes">${notes}</span>
            </div>
        </div>
    `;
}

// USER APPOINTMENTS
export function emptyUserAppointmentsModal(isFiltered = false) {
    return `
        <div class="admin-empty-state user-appointments-empty">
            <i class="fa-regular fa-calendar admin-empty-icon"></i>
            <strong class="admin-empty-title">
                No upcoming appointments
            </strong>
            <span class="admin-empty-description">
                ${isFiltered
                    ? 'No appointments match the selected status.'
                    : 'Your appointment requests will appear here.'}
            </span>
        </div>
    `;
}

export function userAppointmentCardModal(appointment) {
    const purpose = escapeHtml(appointment.purpose);
    const date = escapeHtml(appointment.date);
    const timeRange = escapeHtml(formatTimeRange(appointment));
    const duration = escapeHtml(formatDuration(appointment.duration || 60));
    const visitors = escapeHtml(appointment.visitors);
    const status = escapeHtml(appointment.status);

    const notes = String(appointment.notes ?? '').trim();

    const statusClass = `user-appointment-status-${getStatusModifier(appointment.status)}`;
    const canCancel = ['Pending', 'Approved'].includes(appointment.status);

    return `
        <article class="user-appointment-card">
            <div class="user-appointment-card-header">
                <h3 class="user-appointment-card-title">${purpose}</h3>

                <span class="user-appointment-status ${statusClass}">
                    ${status}
                </span>
            </div>

            <div class="user-appointment-card-details">
                <i class="fa-regular fa-calendar" aria-hidden="true"></i>
                <span>${date}</span>

                <i class="fa-regular fa-clock" aria-hidden="true"></i>
                <span>${timeRange}</span>
            </div>

            <div class="user-appointment-card-details">
                <i class="fa-solid fa-users" aria-hidden="true"></i>
                <span>${visitors} visitors</span>

                <i class="fa-solid fa-hourglass-half" aria-hidden="true"></i>
                <span>About ${duration}</span>
            </div>

            ${notes ? `
                <div class="user-appointment-card-notes">
                    <span class="user-appointment-card-notes-label">
                        <i class="fa-regular fa-note-sticky" aria-hidden="true"></i>
                        Notes
                    </span>

                    <p class="user-appointment-card-notes-text">${escapeHtml(notes)}</p>
                </div>
            ` : ''}

            ${canCancel ? `
                <button
                    type="button"
                    class="user-appointment-cancel-btn"
                    data-cancel-id="${escapeHtml(appointment.id)}">
                    <i class="fa-solid fa-ban" aria-hidden="true"></i>
                    Cancel Appointment
                </button>
            ` : ''}
        </article>
    `;
}

function formatLongDate(date) {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}

// CALENDAR HOVER CARD (appointments on one date)
// The user calendar shows the signed-in user's own appointments; the admin
// calendar passes showCustomer so every customer's name is listed too.
export function calendarDayTooltipModal(date, appointments, options = {}) {
    const { showCustomer = false, maxItems = Infinity } = options;
    const dateLabel = escapeHtml(formatLongDate(date));
    const count = appointments.length;
    const hiddenCount = Math.max(0, count - maxItems);

    const subtitle = showCustomer
        ? `${count} appointment${count === 1 ? '' : 's'}`
        : `Your appointment${count === 1 ? '' : 's'}`;

    const items = appointments.slice(0, maxItems).map(appointment => {
        const visitors = Number(appointment.visitors) || 0;
        const statusClass = `user-appointment-status-${getStatusModifier(appointment.status)}`;

        return `
            <li class="calendar-day-tooltip-item">
                <div class="flex justify-between align-center gap-2">
                    <strong>${escapeHtml(appointment.purpose)}</strong>
                    <span class="user-appointment-status ${statusClass}">
                        ${escapeHtml(appointment.status)}
                    </span>
                </div>
                ${showCustomer ? `
                    <span class="calendar-day-tooltip-detail">
                        <i class="fa-regular fa-user" aria-hidden="true"></i>
                        ${escapeHtml(appointment.customer)}
                    </span>
                ` : ''}
                <span class="calendar-day-tooltip-detail">
                    <i class="fa-regular fa-clock" aria-hidden="true"></i>
                    ${escapeHtml(formatTimeRange(appointment))}
                </span>
                <span class="calendar-day-tooltip-detail">
                    <i class="fa-solid fa-users" aria-hidden="true"></i>
                    ${visitors} visitor${visitors === 1 ? '' : 's'}
                    &middot;
                    ${escapeHtml(formatDuration(appointment.duration || 60))}
                </span>
            </li>
        `;
    }).join('');

    return `
        <strong class="calendar-day-tooltip-title">${dateLabel}</strong>
        <span class="calendar-day-tooltip-subtitle">${subtitle}</span>
        <ul class="calendar-day-tooltip-list">${items}</ul>
        ${hiddenCount > 0 ? `
            <span class="calendar-day-tooltip-more">
                +${hiddenCount} more. Click the date to see all.
            </span>
        ` : ''}
    `;
}

// ADMIN CALENDAR: appointments of the clicked date (right panel)
export function adminDateAppointmentsTitleModal(date) {
    return date ? escapeHtml(formatLongDate(date)) : 'Appointments';
}

export function emptyAdminDateAppointmentsModal(date, isFiltered = false) {
    let description = 'Click a date on the calendar to see its appointments.';

    if (date) {
        description = isFiltered
            ? 'No appointments on this date match the selected status.'
            : 'There are no appointments on this date.';
    }

    return `
        <div class="admin-empty-state admin-details-empty-state">
            <i class="fa-regular fa-calendar admin-empty-icon"></i>
            ${date ? '<strong class="admin-empty-title">No appointments</strong>' : ''}
            <span class="admin-empty-description">${description}</span>
        </div>
    `;
}

export function adminDateAppointmentCardModal(appointment) {
    const customer = escapeHtml(appointment.customer);
    const email = escapeHtml(appointment.email);
    const purpose = escapeHtml(appointment.purpose);
    const timeRange = escapeHtml(formatTimeRange(appointment));
    const duration = escapeHtml(formatDuration(appointment.duration || 60));
    const visitors = Number(appointment.visitors) || 0;
    const status = escapeHtml(appointment.status);
    const id = escapeHtml(appointment.id);

    const notes = String(appointment.notes ?? '').trim();

    const statusClass = `user-appointment-status-${getStatusModifier(appointment.status)}`;
    const isPending = appointment.status === 'Pending';
    const isApproved = appointment.status === 'Approved';

    return `
        <article class="user-appointment-card admin-date-appointment-card">
            <div class="user-appointment-card-header">
                <h3 class="user-appointment-card-title">${purpose}</h3>

                <span class="user-appointment-status ${statusClass}">
                    ${status}
                </span>
            </div>

            <div class="user-appointment-card-details">
                <i class="fa-regular fa-user" aria-hidden="true"></i>
                <strong>${customer}</strong>
                ${email ? `<span class="admin-date-appointment-email">${email}</span>` : ''}
            </div>

            <div class="user-appointment-card-details">
                <i class="fa-regular fa-clock" aria-hidden="true"></i>
                <span>${timeRange}</span>

                <i class="fa-solid fa-hourglass-half" aria-hidden="true"></i>
                <span>About ${duration}</span>
            </div>

            <div class="user-appointment-card-details">
                <i class="fa-solid fa-users" aria-hidden="true"></i>
                <span>${visitors} visitor${visitors === 1 ? '' : 's'}</span>
            </div>

            ${notes ? `
                <div class="user-appointment-card-notes">
                    <span class="user-appointment-card-notes-label">
                        <i class="fa-regular fa-note-sticky" aria-hidden="true"></i>
                        Notes
                    </span>

                    <p class="user-appointment-card-notes-text">${escapeHtml(notes)}</p>
                </div>
            ` : ''}

            ${isPending || isApproved ? `
                <div class="flex gap-2 admin-date-appointment-actions">
                    ${isPending ? `
                        <button
                            type="button"
                            class="admin-date-action-btn appointment-approve-btn"
                            data-id="${id}"
                            data-status="Approved">
                            <i class="fa-solid fa-check" aria-hidden="true"></i>
                            Approve
                        </button>
                        <button
                            type="button"
                            class="admin-date-action-btn appointment-reject-btn"
                            data-id="${id}"
                            data-status="Rejected">
                            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                            Reject
                        </button>
                    ` : ''}
                    ${isApproved ? `
                        <button
                            type="button"
                            class="admin-date-action-btn appointment-cancel-btn"
                            data-id="${id}"
                            data-status="Cancelled">
                            <i class="fa-solid fa-ban" aria-hidden="true"></i>
                            Cancel
                        </button>
                    ` : ''}
                </div>
            ` : ''}
        </article>
    `;
}
