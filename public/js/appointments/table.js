import {
    appointmentRowModal,
    appointmentDetailsModal,
    emptyAppointmentDetailsModal,
    emptyAppointmentsRowModal
} from './modal.js';
import { updateSummaryCards } from './summary.js';
import { getSelectedStatus, initStatusFilter, matchesStatusFilter } from './filter.js';
import { createNotificationElement } from '../utils/notification/notification.js';
import * as api from './api.js';

const STATUS_FILTER = '#filter-appointment-status';

let selectedId = null;

// LOAD APPOINTMENTS
export function loadAppointments(appointmentsData, initialSelectedId = null) {
    selectedId = initialSelectedId ? Number(initialSelectedId) : null;

    initStatusFilter(STATUS_FILTER, () => {
        renderAppointments(appointmentsData);
    });

    renderAppointments(appointmentsData);
}

// RENDER APPOINTMENTS (filtered by status)
export function renderAppointments(appointmentsData) {
    const tbody = document.querySelector('#appointments-tbody');

    if (!tbody) return;

    tbody.innerHTML = '';

    const selectedStatus = getSelectedStatus(STATUS_FILTER);
    const visibleAppointments = appointmentsData.filter(appointment =>
        matchesStatusFilter(appointment, selectedStatus)
    );

    if (visibleAppointments.length === 0) {
        tbody.innerHTML = emptyAppointmentsRowModal(appointmentsData.length > 0);
    }

    for (const appointmentData of visibleAppointments) {
        addAppointmentRow(appointmentData, appointmentsData);
    }

    // Clear the details panel when the selected appointment is filtered out.
    if (!visibleAppointments.some(appointment => appointment.id === selectedId)) {
        selectedId = null;
    }

    updateSummaryCards(appointmentsData);
    showAppointmentDetails(appointmentsData);
}

// APPOINTMENT MANAGEMENT: Table Row
export function addAppointmentRow(appointmentData, appointmentsData) {
    const tbody = document.querySelector('#appointments-tbody');

    if (!tbody) return;

    const row = document.createElement('tr');
    row.classList.add('appointment-row');
    row.dataset.status = appointmentData.status.toLowerCase();
    row.innerHTML = appointmentRowModal(appointmentData);

    if (appointmentData.id === selectedId) {
        row.classList.add('appointment-row-selected');
    }

    tbody.appendChild(row);

    setupAppointmentRowActions(row, appointmentData, appointmentsData);
}

function setupAppointmentRowActions(row, appointmentData, appointmentsData) {
    // Select appointment
    row.onclick = () => {
        selectedId = appointmentData.id;

        document.querySelectorAll('.appointment-row').forEach(row => {
            row.classList.remove('appointment-row-selected');
        });

        row.classList.add('appointment-row-selected');

        showAppointmentDetails(appointmentsData);
    };

    // Approve appointment
    const approveBtn = row.querySelector('.approve-btn');

    if (approveBtn) {
        approveBtn.onclick = event => {
            event.stopPropagation();
            changeAppointmentStatus(appointmentData, appointmentsData, 'Approved', event.currentTarget);
        };
    }

    // Reject appointment
    const rejectBtn = row.querySelector('.reject-btn');

    if (rejectBtn) {
        rejectBtn.onclick = event => {
            event.stopPropagation();

            if (!confirm('Are you sure you want to reject this request?')) return;

            changeAppointmentStatus(appointmentData, appointmentsData, 'Rejected', event.currentTarget);
        };
    }

    // Cancel an approved appointment (the record is kept as Cancelled)
    const cancelBtn = row.querySelector('.cancel-btn');

    if (cancelBtn) {
        cancelBtn.onclick = event => {
            event.stopPropagation();

            if (!confirm('Cancel this approved appointment? The record will be kept as Cancelled.')) return;

            changeAppointmentStatus(appointmentData, appointmentsData, 'Cancelled', event.currentTarget);
        };
    }
}

// APPOINTMENT ACTIONS
const statusMessages = {
    Approved: { success: 'Appointment approved successfully', failed: 'Failed to approve appointment' },
    Rejected: { success: 'Appointment rejected', failed: 'Failed to reject appointment' },
    Cancelled: { success: 'Appointment cancelled', failed: 'Failed to cancel appointment' }
};

async function changeAppointmentStatus(appointmentData, appointmentsData, status, button) {
    const messages = statusMessages[status];

    if (button) button.disabled = true;

    let data;

    try {
        data = await api.updateAppointmentStatus(appointmentData.id, status);
    } catch (error) {
        console.error('Failed to update appointment status:', error);
        data = { success: false };
    }

    if (!data.success) {
        if (button) button.disabled = false;

        createNotificationElement({
            status: 'failed',
            message: data.message ?? messages.failed
        });
        return;
    }

    // Records are never removed; only the status changes.
    appointmentData.status = status;

    renderAppointments(appointmentsData);

    createNotificationElement({
        status: 'success',
        message: messages.success
    });
}

// APPOINTMENT DISPLAY: Details Panel
export function showAppointmentDetails(appointmentsData) {
    const container = document.querySelector('#details-content');

    if (!container) return;

    const appointment = appointmentsData.find(
        item => item.id === selectedId
    );

    if (!appointment) {
        container.innerHTML = emptyAppointmentDetailsModal();
        return;
    }

    container.innerHTML = appointmentDetailsModal(appointment);
}
