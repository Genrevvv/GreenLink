import { apiFetchJSON } from '../utils/api.js';

export async function fetchAdminDashboard() {
    const data = await apiFetchJSON('/api/dashboard/admin', 'GET');
    return data;
}

export async function fetchUserDashboard() {
    const data = await apiFetchJSON('/api/dashboard/user', 'GET');
    return data;
}
