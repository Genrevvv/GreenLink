
import { getCurrentUser } from '../utils/user.js';

import {
    statsData,
    inventoryData,
    stockAlertsData,
    upcomingAppointmentsData,
    userAppointmentsData,
    userInquiriesData,
    getUserStatsData,
    getUpcomingUserAppointments,
    productAvailabilityData,
    getRecentUserInquiries,
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
    renderUserInquiryUpdates,
    renderUserProductAvailability,
    renderUserWelcome
} from './dashboard-functions.js';

export function initDashboard() {
    const user = getCurrentUser();

    if (!user) {
        console.error('Unable to load dashboard: no current user found.');
        return;
    }

    if (user.user_type === 'admin') {
        adminDashboardScript();
    } else if (user.user_type === 'user') {
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
    const today = new Date();

    const upcomingAppointments = getUpcomingUserAppointments(
        userAppointmentsData,
        userDashboardLimits.appointments,
        today
    );

    const recentInquiries = getRecentUserInquiries(
        userInquiriesData,
        userDashboardLimits.inquiries
    );

    renderUserWelcome(user);

    renderUserStatCards(
        getUserStatsData(userAppointmentsData, userInquiriesData, today)
    );

    renderUserAppointmentStatus(upcomingAppointments);
    renderUserProductAvailability(productAvailabilityData);
    renderUserInquiryUpdates(recentInquiries);
}
