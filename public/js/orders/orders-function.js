
import { createNotificationElement } from '../utils/notification/notification.js';
import { orderRowModal } from './orders-modal.js';

// ORDER MANAGEMENT: Order Row
export function addOrder(orderData) {
    /* TODO:
        - Implement backend
    */
    const row = document.createElement('tr');
    row.innerHTML = orderRowModal(orderData);

    document.querySelector('.order-management-table').appendChild(row);

    setupOrderRowActions(row, orderData);
    filterOrders();
}

// ORDER MANAGEMENT: Search and Filter
export function filterOrders() {
    const searchInput = document.querySelector('#search-order');
    const statusFilter = document.querySelector('#filter-order-status');
    const orderTable = document.querySelector('.order-management-table');

    if (!orderTable) return;

    const searchValue = searchInput?.value.trim().toLowerCase() || '';
    const selectedStatus = statusFilter?.value || 'all';

    const orderRows = orderTable.querySelectorAll('tr');

    orderRows.forEach(row => {
        // Skip the table header
        if (row.querySelector('th')) return;

        const cells = row.querySelectorAll('td');
        const orderId = cells[0]?.textContent.toLowerCase() || '';
        const customer = cells[1]?.textContent.toLowerCase() || '';
        const product = cells[2]?.textContent.toLowerCase() || '';

        const status = row.querySelector('.status')
            ?.textContent.trim().toLowerCase() || '';

        const matchesSearch =
            orderId.includes(searchValue) ||
            customer.includes(searchValue) ||
            product.includes(searchValue);

        const matchesStatus =
            selectedStatus === 'all' || status === selectedStatus;

        row.style.display =
            matchesSearch && matchesStatus ? '' : 'none';
    });
}

function setupOrderRowActions(orderRow, orderData) {
    const approveOrderAct = orderRow.querySelector('.action-approve');
    const rejectOrderAct = orderRow.querySelector('.action-reject');
    const completeOrderAct = orderRow.querySelector('.action-complete');

    if (approveOrderAct) {
        approveOrderAct.onclick = () => {
            updateOrderStatus(orderRow, orderData, 'approved');
        };
    }

    if (rejectOrderAct) {
        rejectOrderAct.onclick = () => {
            rejectOrder(orderRow);
        };
    }

    if (completeOrderAct) {
        completeOrderAct.onclick = () => {
            updateOrderStatus(orderRow, orderData, 'completed');
        };
    }
}

function updateOrderStatus(orderRow, orderData, status) {
    /* TODO:
        - Implement backend
    */
    orderData.status = status;
    orderRow.innerHTML = orderRowModal(orderData);

    setupOrderRowActions(orderRow, orderData);
    filterOrders();

    // Testing message only
    createNotificationElement({
        status: 'success',
        message: `Order ${status} successfully`
    });
}

function rejectOrder(orderRow) {
    /* TODO:
        - Implement backend
    */
    const confirmed = confirm('Are you sure you want to reject this order?');
    if (!confirmed) return;

    orderRow.remove();

    createNotificationElement({
        status: 'success',
        message: 'Order rejected successfully'
    });
}
