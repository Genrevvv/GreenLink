import { apiFetchJSON } from '../utils/api.js';

export async function fetchAppointments() {
    const data = await apiFetchJSON('/api/appointments', 'GET');
    return data.appointments ?? [];
}

export async function fetchUserAppointments() {
    const data = await apiFetchJSON('/api/appointments/user', 'GET');
    return data.appointments ?? [];
}

export async function fetchSchedule() {
    const data = await apiFetchJSON('/api/appointments/schedule', 'GET');
    return data;
}

export async function addAppointment(appointmentData) {
    const data = await apiFetchJSON('/api/appointments/addAppointment', 'POST', appointmentData);
    return data;
}

export async function updateAppointmentStatus(id, status) {
    const body = {
        'id': id,
        'status': status
    };

    const data = await apiFetchJSON('/api/appointments/updateStatus', 'POST', body);
    console.log('appointment status updated: ' + data.success);
    return data;
}

// { id, date, startTime, endTime } with 24-hour HH:MM times
export async function rescheduleAppointment(rescheduleData) {
    const data = await apiFetchJSON('/api/appointments/rescheduleAppointment', 'POST', rescheduleData);
    return data;
}

// UNAVAILABLE PERIODS (admin)
export async function fetchUnavailablePeriods() {
    const data = await apiFetchJSON('/api/appointments/unavailable', 'GET');
    return data;
}

// { date, wholeDay, startTime, endTime, reason }
export async function addUnavailablePeriod(periodData) {
    const data = await apiFetchJSON('/api/appointments/unavailable/add', 'POST', periodData);
    return data;
}

export async function deleteUnavailablePeriod(id) {
    const data = await apiFetchJSON('/api/appointments/unavailable/delete', 'POST', { 'id': id });
    return data;
}

export async function cancelAppointment(id) {
    const body = { 'id': id };

    const data = await apiFetchJSON('/api/appointments/cancelAppointment', 'POST', body);
    console.log('appointment cancelled: ' + data.success);
    return data;
}
