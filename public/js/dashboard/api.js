import { apiFetchJSON } from '../utils/api.js';

export async function fetchAdminDashboard() {
    const data = await apiFetchJSON('/dashboard/admin', 'GET');
    return data;
}

export async function fetchUserDashboard() {
    const data = await apiFetchJSON('/dashboard/user', 'GET');
    return data;
}
