import { getCurrentUser } from '../utils/user.js';
import { createNotificationElement } from '../utils/notification/notification.js';
import { fetchAppointments, fetchSchedule, fetchUserAppointments } from './api.js';
import { loadAppointments } from './table.js';
import { initUserAppointments } from './form.js';
import { setSchedule } from './schedule.js';
import { initAdminCalendar, initAppointmentsViewSwitch } from './admin-calendar.js';
import { initUnavailablePeriods } from './unavailable.js';
import { initSchedulingSettings } from './settings.js';

export async function initAppointments(targetId = null) {
    const user = getCurrentUser();

    try {
        if (user.user_type === 'admin') {
            const [appointments, scheduleData] = await Promise.all([
                fetchAppointments(),
                fetchSchedule()
            ]);
            adminAppointmentsScript(appointments, scheduleData, targetId);
        } else if (user.user_type === 'user') {
            const [userAppointments, scheduleData] = await Promise.all([
                fetchUserAppointments(),
                fetchSchedule()
            ]);

            userAppointmentsScript(userAppointments, scheduleData, targetId);
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

function adminAppointmentsScript(appointments, scheduleData, targetId) {
    // All records are kept. The status filter defaults to Pending and Approved.
    // The table and the calendar share the records, so a status change shows in both.
    initAppointmentsViewSwitch();

    if (scheduleData.success !== true) {
        createNotificationElement({
            status: 'failed',
            message: scheduleData.message ?? 'Failed to load visit types for the purpose filter.'
        });
    }

    const adminCalendar = initAdminCalendar(appointments);

    loadAppointments(appointments, {
        initialSelectedId: targetId,
        afterRender: () => adminCalendar.refresh(),
        appointmentTypes: scheduleData.success === true ? scheduleData.types ?? [] : []
    });

    initUnavailablePeriods();
    initSchedulingSettings();
}

function userAppointmentsScript(userAppointments, scheduleData, targetId) {
    // A failed request leaves scheduling unconfigured, so the form shows the server message instead of booking.
    setSchedule(scheduleData ?? {});

    initUserAppointments(userAppointments, targetId);
}
