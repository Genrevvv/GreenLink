
import { ordersData } from './orders-data.js';

const totalOrders = document.querySelector('#total-orders');
const pendingOrders = document.querySelector('#pending-orders');
const approvedOrders = document.querySelector('#approved-orders');
const completedOrders = document.querySelector('#completed-orders');

/* TODO:
    - Make order summary update whenever there are changes on the table
*/

export function setTotalOrders(n) {
    if (totalOrders) totalOrders.innerHTML = n;
}

export function setPendingOrders(n) {
    if (pendingOrders) pendingOrders.innerHTML = n;
}

export function setApprovedOrders(n) {
    if (approvedOrders) approvedOrders.innerHTML = n;
}

export function setCompletedOrders(n) {
    if (completedOrders) completedOrders.innerHTML = n;
}

export function getTotalOrders(ordersData) {
    return ordersData.length;
}

export function getPendingOrders(ordersData) {
    return ordersData.filter(order => order.status === 'pending').length;
}

export function getApprovedOrders(ordersData) {
    return ordersData.filter(order => order.status === 'approved').length;
}

export function getCompletedOrders(ordersData) {
    return ordersData.filter(order => order.status === 'completed').length;
}

export function updateOrderSummary() {
    setTotalOrders(getTotalOrders(ordersData));
    setPendingOrders(getPendingOrders(ordersData));
    setApprovedOrders(getApprovedOrders(ordersData));
    setCompletedOrders(getCompletedOrders(ordersData));
}
