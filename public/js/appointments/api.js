import { apiFetchJSON } from '../utils/api.js';

export async function fetchAppointments() {
    const data = await apiFetchJSON('/appointments', 'GET');
    return data.appointments ?? [];
}

export async function fetchUserAppointments() {
    const data = await apiFetchJSON('/appointments/user', 'GET');
    return data.appointments ?? [];
}

export async function addAppointment(appointmentData) {
    const data = await apiFetchJSON('/appointments/addAppointment', 'POST', appointmentData);
    return data;
}

export async function updateAppointmentStatus(id, status) {
    const body = {
        'id': id,
        'status': status
    };

    const data = await apiFetchJSON('/appointments/updateStatus', 'POST', body);
    console.log('appointment status updated: ' + data.success);
    return data.success;
}
