import { getCurrentUser } from '../utils/user.js';
import { appointmentsData } from './appointments-data.js';

import {
    updateSummaryCards,
    addAppointmentRow,
    showAppointmentDetails
} from './appointments-function.js';

export function initAppointments() {
    const user = getCurrentUser();

    if (user.user_type === 'admin') {
        adminAppointmentsScript();
    } else if (user.user_type === 'user') {
        userAppointmentsScript();
    }

    console.log('appointments.js has been imported');
}

function adminAppointmentsScript() {
    // Setup appointment summary
    updateSummaryCards(appointmentsData);

    // Load appointments (temporary front-end testing)
    const tbody = document.querySelector('#appointments-tbody');

    if (tbody) {
        tbody.innerHTML = '';
    }

    for (const appointmentData of appointmentsData) {
        addAppointmentRow(appointmentData, appointmentsData);
    }

    // Setup initial appointment details panel
    showAppointmentDetails(appointmentsData);
}

function userAppointmentsScript() {
    // TODO: Implement user appointments.
}
