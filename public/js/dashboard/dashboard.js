import {
    statsData,
    monthlyActivityData,
    recentOrdersData,
    pendingAppointmentsData, 
} from './dashboard-data.js';

import { 
    renderStatCards, 
    renderMonthlyActivity, 
    renderRecentOrders,
    renderPendingAppointments
} from './dashboard-functions.js'

export function initDashboard() {
    renderStatCards(statsData);
    renderMonthlyActivity(monthlyActivityData);
    renderRecentOrders(recentOrdersData);
    renderPendingAppointments(pendingAppointmentsData);

    console.log('dashboard.js has been imported');
}
