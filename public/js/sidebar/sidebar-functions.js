import { apiFetch } from '../utils/api.js';
import { getCurrentUser } from '../utils/user.js';

const mainContent = document.querySelector('#main-content');
const headerText = document.querySelector('#header-text');
const user = getCurrentUser();

let cleanupPage = null;

export async function loadPage(page) {
    // Clean up the previous page's script
    if (typeof cleanupPage === 'function') {
        cleanupPage();
        cleanupPage = null;
    }

    const pagePath = `/views/pages/${user.user_type}/${page}.html`;
    const response = await fetch(pagePath);

    if (!response.ok) {
        mainContent.innerHTML = `
            <div class="container p-2">
                Can't load content hehe :)
            </div>
        `;
        return;
    }

    mainContent.innerHTML = await response.text();

    let module = null;

    if (page === 'products') {
        module = await import('../products/products.js');
        cleanupPage = module.initProducts();
    }
    else if (page === 'appointments') {
        module = await import('../appointments/script.js');
        cleanupPage = module.initAppointments();
    }
    else if (page === 'dashboard') {
        module = await import('../dashboard/script.js');
        cleanupPage = module.initDashboard();
    }
    else if (page === 'inquiries') {
        module = await import('../inquiries/script.js');
        cleanupPage = module.initInquiries();
    }
}

export function selectOption(selectedOption, options) {
    options.forEach(option => {
        option.classList.remove('selected');
    });

    selectedOption.classList.add('selected');
}

export function updateHeaderText(text) {
    headerText.innerHTML = text;
}

export async function logout() {
    try {
        await apiFetch('/logout', 'POST');
        window.location.href = "/";
    } catch (error) {
        console.error("Logout failed:", error);
    }
}
