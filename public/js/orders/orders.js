
import { addOrder, filterOrders } from './orders-function.js';
import { ordersData } from './orders-data.js';
import { updateOrderSummary } from './orders-summary.js';
import { getCurrentUser } from '../utils/user.js';

export function initOrders() {
    const user = getCurrentUser();

    if (user.user_type === 'admin') adminOrderScript();
    else if (user.user_type === 'user') userOrderScript();

    setupOrderFilters();

    console.log('orders.js has been imported');
}

function adminOrderScript() {
    for (const orderData of ordersData) {
        addOrder(orderData);
    }

    updateOrderSummary();
}

function userOrderScript() {
    // TODO: Load orders belonging to the current user
    for (const orderData of ordersData) {
        addOrder(orderData, false);
    }
}

function setupOrderFilters() {
    const searchInput = document.querySelector('#search-order');
    const statusFilter = document.querySelector('#filter-order-status');

    if (searchInput) searchInput.oninput = filterOrders;
    if (statusFilter) statusFilter.onchange = filterOrders;
}
