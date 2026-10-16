import { apiFetch } from '../utils/api.js';
import { getCurrentUser } from '../utils/user.js';

const mainContent = document.querySelector('#main-content');
const headerText = document.querySelector('#header-text');
const user = getCurrentUser();

let cleanupPage = null;

export async function loadPage(page) {
    // Clean up the previous page's script
    if (cleanupPage) {
        cleanupPage();
        cleanupPage = null;
    }

    const pagePath = `/views/pages/${user.user_type}/${page}.html`;
    console.log(pagePath)

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
    // Initialize the selected page
    if (page === 'products') {
        module = await import('../products/products.js');
        cleanupPage = module.initProducts();
    }
    else if (page === 'appointments') {
        module = await import('../appointments/appointments.js');
        cleanupPage = module.initAppointments();
    }
    else if (page === 'dashboard') {
        module = await import('../dashboard/dashboard.js');
        cleanupPage = module.initDashboard();
    }
    else if (page === 'inquiries') {
        module = await import('../inquiries/inquiries.js');
        cleanupPage = module.initInquiries();
    }
    else if (page === 'orders') {
        module = await import('../orders/orders.js');
        cleanupPage = module.initOrders();
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
