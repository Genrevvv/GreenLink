import {
    appointmentRowModal,
    appointmentDetailsModal,
    emptyAppointmentDetailsModal,
    emptyAppointmentsRowModal
} from './appointments-modal.js';

let selectedId = null;

// APPOINTMENT SUMMARY
export function updateSummaryCards(appointmentsData) {
    const totalEl = document.querySelector('#total-count');
    const pendingEl = document.querySelector('#pending-count');
    const approvedEl = document.querySelector('#approved-count');

    if (totalEl) {
        totalEl.textContent = appointmentsData.length;
    }

    if (pendingEl) {
        pendingEl.textContent = appointmentsData.filter(
            appointment => appointment.status === 'Pending'
        ).length;
    }

    if (approvedEl) {
        approvedEl.textContent = appointmentsData.filter(
            appointment => appointment.status === 'Approved'
        ).length;
    }
}

// APPOINTMENT MANAGEMENT: Table Row
export function addAppointmentRow(appointmentData, appointmentsData) {
    const tbody = document.querySelector('#appointments-tbody');

    if (!tbody) return;

    const row = document.createElement('tr');
    row.classList.add('appointment-row');
    row.innerHTML = appointmentRowModal(appointmentData);

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
            approveAppointment(appointmentData, row, appointmentsData);
        };
    }

    // Reject appointment
    const rejectBtn = row.querySelector('.reject-btn');

    if (rejectBtn) {
        rejectBtn.onclick = event => {
            event.stopPropagation();
            rejectAppointment(appointmentData, row, appointmentsData);
        };
    }
}

// APPOINTMENT ACTIONS
function approveAppointment(appointmentData, row, appointmentsData) {
    appointmentData.status = 'Approved';

    // Update the existing row
    row.innerHTML = appointmentRowModal(appointmentData);

    setupAppointmentRowActions(row, appointmentData, appointmentsData);

    // Update affected UI
    updateSummaryCards(appointmentsData);
    showAppointmentDetails(appointmentsData);
}

function rejectAppointment(appointmentData, row, appointmentsData) {
    const confirmed = confirm(
        'Are you sure you want to reject this request?'
    );

    if (!confirmed) return;

    const index = appointmentsData.findIndex(
        appointment => appointment.id === appointmentData.id
    );

    if (index === -1) return;

    appointmentsData.splice(index, 1);
    row.remove();

    if (selectedId === appointmentData.id) {
        selectedId = null;
    }

    // Show empty state if no appointments remain
    const tbody = document.querySelector('#appointments-tbody');

    if (tbody && appointmentsData.length === 0) {
        tbody.innerHTML = emptyAppointmentsRowModal();
    }

    // Update affected UI
    updateSummaryCards(appointmentsData);
    showAppointmentDetails(appointmentsData);
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
