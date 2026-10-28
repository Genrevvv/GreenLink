import { getCurrentUser } from '../utils/user.js';

import {
    statsData,
    inventoryData,
    stockAlertsData,
    upcomingAppointmentsData,
    userStatsData,
    userQuickActionsData,
    userRecentOrdersData,
    userUpcomingAppointmentsData
} from './dashboard-data.js';

import { 
    renderAdminStatCards,
    renderInventoryChart,
    renderStockAlerts,
    renderUpcomingAppointments,
    setupDashboardLinks,
    renderStatCards,
    renderWelcome,
    renderQuickActions,
    renderUserRecentOrders,
    renderUserAppointments
} from './dashboard-functions.js'

export function initDashboard() {
    const user = getCurrentUser();

    if (user.user_type === 'admin') {
        adminDashboardScript();
    }
    else if (user.user_type === 'user') {
        userDashboardScript(user);
    }

    console.log('dashboard.js has been imported');
}

function adminDashboardScript() {
    renderAdminStatCards(statsData);
    renderInventoryChart(inventoryData);
    renderStockAlerts(stockAlertsData);
    renderUpcomingAppointments(upcomingAppointmentsData);
    setupDashboardLinks();
}

function userDashboardScript(user) {
    renderWelcome(user);
    renderStatCards(userStatsData);
    renderQuickActions(userQuickActionsData);
    renderUserRecentOrders(userRecentOrdersData);
    renderUserAppointments(userUpcomingAppointmentsData);
}
