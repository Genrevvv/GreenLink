import { escapeHtml } from '../utils/string.js';

// APPOINTMENT TABLE
export function emptyAppointmentsRowModal() {
    return `
        <tr>
            <td colspan="6" class="admin-table-empty-cell">
                <div class="admin-empty-state">
                    <i class="fa-regular fa-calendar-xmark admin-empty-icon"></i>
                    <strong class="admin-empty-title">No appointments found</strong>
                    <span class="admin-empty-description">
                        No appointment requests received yet.
                    </span>
                </div>
            </td>
        </tr>
    `;
}

export function appointmentRowModal(appointment) {
    const customer = escapeHtml(appointment.customer);
    const date = escapeHtml(appointment.date);
    const time = escapeHtml(appointment.time);
    const purpose = escapeHtml(appointment.purpose);
    const visitors = escapeHtml(appointment.visitors);
    const status = escapeHtml(appointment.status);

    const isApproved = appointment.status === 'Approved';
    const isPending = appointment.status === 'Pending';

    const statusClass = isApproved
        ? 'appointment-status-approved'
        : 'appointment-status-pending';

    return `
        <td class="appointment-cell appointment-customer">
            <strong>${customer}</strong>
        </td>
        <td class="appointment-cell appointment-date">
            ${date}
            <br>
            <small>${time}</small>
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
                    aria-label="Approve appointment">
                    <i class="fa-solid fa-check"></i>
                </button>
                <button
                    type="button"
                    class="reject-btn appointment-action-btn appointment-reject-btn"
                    aria-label="Reject appointment">
                    <i class="fa-solid fa-xmark"></i>
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
    const time = escapeHtml(appointment.time);
    const visitors = escapeHtml(appointment.visitors);
    const purpose = escapeHtml(appointment.purpose);

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
                    ${date} at ${time}
                </strong>
            </div>

            <div class="appointment-detail-item">
                <span class="appointment-detail-label">Visitors &amp; Purpose</span>
                <strong class="appointment-detail-value">
                    ${visitors} visitors - ${purpose}
                </strong>
            </div>

            <div class="appointment-detail-item">
                <span class="appointment-detail-label">Notes</span>
                <span class="appointment-detail-notes">${notes}</span>
            </div>
        </div>
    `;
}

// USER APPOINTMENTS
export function emptyUserAppointmentsModal() {
    return `
        <div class="admin-empty-state user-appointments-empty">
            <i class="fa-regular fa-calendar admin-empty-icon"></i>
            <strong class="admin-empty-title">
                No upcoming appointments
            </strong>
            <span class="admin-empty-description">
                Your appointment requests will appear here.
            </span>
        </div>
    `;
}

export function userAppointmentCardModal(appointment) {
    const purpose = escapeHtml(appointment.purpose);
    const date = escapeHtml(appointment.date);
    const time = escapeHtml(appointment.time);
    const visitors = escapeHtml(appointment.visitors);
    const status = escapeHtml(appointment.status);

    const notes = String(appointment.notes ?? '').trim();

    const statusClass = {
        Approved: 'user-appointment-status-approved',
        Pending: 'user-appointment-status-pending',
        Rejected: 'user-appointment-status-rejected'
    }[appointment.status] || 'user-appointment-status-pending';

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
                <span>${time}</span>
            </div>

            <div class="user-appointment-card-details">
                <i class="fa-solid fa-users" aria-hidden="true"></i>
                <span>${visitors} visitors</span>
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
        </article>
    `;
}