import { getCurrentUser } from '../utils/user.js';

import {
    statsData,
    inventoryData,
    stockAlertsData,
    upcomingAppointmentsData,
    userAppointmentsData,
    userInquiriesData,
    getUserStatsData,
    userDashboardLimits
} from './dashboard-data.js';

import { 
    renderAdminStatCards,
    renderInventoryChart,
    renderStockAlerts,
    renderUpcomingAppointments,
    setupDashboardLinks,
    renderUserStatCards,
    renderUserAppointmentStatus,
    renderUserInquiryUpdates
} from './dashboard-functions.js'

export function initDashboard() {
    const user = getCurrentUser();

    if (user.user_type === 'admin') {
        adminDashboardScript();
    }
    else if (user.user_type === 'user') {
        userDashboardScript();
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

function userDashboardScript() {
    renderUserStatCards(getUserStatsData(userAppointmentsData, userInquiriesData));
    renderUserAppointmentStatus(userAppointmentsData.slice(0, userDashboardLimits.appointments));
    renderUserInquiryUpdates(userInquiriesData.slice(0, userDashboardLimits.inquiries));
}
