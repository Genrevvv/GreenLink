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
        <article class="user-appointment-card" data-appointment-id="${escapeHtml(appointment.id)}">
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
