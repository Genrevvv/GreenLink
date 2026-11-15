import { getCurrentUser } from '../utils/user.js';
import { createNotificationElement } from '../utils/notification/notification.js';
import { fetchAppointments, fetchSchedule, fetchUserAppointments } from './api.js';
import { loadAppointments } from './table.js';
import { initUserAppointments } from './form.js';
import { setSchedule } from './schedule.js';

export async function initAppointments() {
    const user = getCurrentUser();

    try {
        if (user.user_type === 'admin') {
            const appointments = await fetchAppointments();
            adminAppointmentsScript(appointments);
        } else if (user.user_type === 'user') {
            const [userAppointments, scheduleData] = await Promise.all([
                fetchUserAppointments(),
                fetchSchedule()
            ]);

            userAppointmentsScript(userAppointments, scheduleData);
        }

    } catch (error) {
        console.error('Failed to initialize appointments:', error);

        createNotificationElement({
            status: 'failed',
            message: 'Failed to load appointments'
        });
    }

    console.log('appointments.js has been imported');
}

function adminAppointmentsScript(appointments) {
    // All records are kept. The status filter defaults to Pending and Approved.
    loadAppointments(appointments);
}

function userAppointmentsScript(userAppointments, scheduleData) {
    if (scheduleData?.success) {
        setSchedule(scheduleData);
    }

    initUserAppointments(userAppointments);
}
