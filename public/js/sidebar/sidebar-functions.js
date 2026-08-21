import { apiFetch } from '../api/api.js';

export async function logout() {
    try {
        await apiFetch('/logout', 'POST');
        window.location.href = "/login";
    } catch (error) {
        console.error("Logout failed:", error);
    }
}