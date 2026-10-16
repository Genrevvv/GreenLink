
import { addOrder, filterOrders } from './orders-function.js';
import { ordersData } from './orders-data.js';
import { getCurrentUser } from '../utils/user.js';

export function initOrders() {
    const user = getCurrentUser();

    if (user.user_type === 'admin') adminOrderScript();
    else if (user.user_type === 'user') userOrderScript();

    setupOrderFilters();

    console.log('orders.js has been imported');
}

function adminOrderScript() {
    // Load orders (pseudo loader for front-end testing, temporary)
    for (const orderData of ordersData) {
        addOrder(orderData);
    }

    // TODO: Add backend integration
}

function userOrderScript() {
    // TODO: Load orders belonging to current user
}

function setupOrderFilters() {
    const searchInput = document.querySelector('#search-order');
    const statusFilter = document.querySelector('#filter-order-status');

    if (searchInput) {
        searchInput.oninput = filterOrders;
    }

    if (statusFilter) {
        statusFilter.onchange = filterOrders;
    }
}
