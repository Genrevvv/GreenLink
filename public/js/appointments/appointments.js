import { getCurrentUser } from '../utils/user.js';
import { fetchAppointments, fetchUserAppointments } from './api.js';
import { loadAppointments } from './table.js';
import { initUserAppointments } from './form.js';

export async function initAppointments() {
    const user = getCurrentUser();

    try {
        if (user.user_type === 'admin') {
            const appointments = await fetchAppointments();
            adminAppointmentsScript(appointments);
        } else if (user.user_type === 'user') {
            const userAppointments = await fetchUserAppointments();
            userAppointmentsScript(userAppointments);
        }

    } catch (error) {
        console.error('Failed to initialize appointments:', error);
    }

    console.log('appointments.js has been imported');
}

function adminAppointmentsScript(appointments) {
    // Rejected requests are removed from the admin schedule.
    const activeAppointments = appointments.filter(
        appointment => appointment.status !== 'Rejected'
    );

    loadAppointments(activeAppointments);
}

function userAppointmentsScript(userAppointments) {
    initUserAppointments(userAppointments);
}
