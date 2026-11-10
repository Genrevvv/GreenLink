import { getCurrentUser } from '../utils/user.js';
import { fetchAdminDashboard, fetchUserDashboard } from './api.js';

import {
    getAdminStatsData,
    getInventoryData,
    getStockAlertsData,
    getUserStatsData,
    getUpcomingUserAppointments,
    getProductAvailabilityData,
    getRecentUserInquiries,
    userDashboardLimits
} from './data.js';

import {
    renderAdminStatCards,
    renderInventoryChart,
    renderStockAlerts,
    renderUpcomingAppointments,
    setupDashboardLinks
} from './admin.js';

import {
    renderUserStatCards,
    renderUserAppointmentStatus,
    renderUserInquiryUpdates,
    renderUserProductAvailability,
    renderUserWelcome
} from './user.js';

export async function initDashboard() {
    const user = getCurrentUser();

    if (!user) {
        console.error('Unable to load dashboard: no current user found.');
        return;
    }

    try {
        if (user.user_type === 'admin') {
            const dashboardData = await fetchAdminDashboard();
            adminDashboardScript(dashboardData);
        } else if (user.user_type === 'user') {
            const dashboardData = await fetchUserDashboard();
            userDashboardScript(user, dashboardData);
        }

    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
    }

    console.log('dashboard/script.js has been imported');
}

function adminDashboardScript(dashboardData) {
    const summary = dashboardData.summary ?? { totalProducts: 0, inStock: 0, outOfStock: 0 };

    renderAdminStatCards(getAdminStatsData(summary));
    renderInventoryChart(getInventoryData(summary));
    renderStockAlerts(getStockAlertsData(dashboardData.outOfStockProducts ?? []));
    renderUpcomingAppointments(dashboardData.upcomingAppointments ?? []);
    setupDashboardLinks();
}

function userDashboardScript(user, dashboardData) {
    const today = new Date();

    const appointments = dashboardData.appointments ?? [];
    const inquiries = dashboardData.inquiries ?? [];
    const products = dashboardData.products ?? [];

    const upcomingAppointments = getUpcomingUserAppointments(
        appointments,
        userDashboardLimits.appointments,
        today
    );

    const recentInquiries = getRecentUserInquiries(
        inquiries,
        userDashboardLimits.inquiries
    );

    renderUserWelcome(user);

    renderUserStatCards(
        getUserStatsData(appointments, inquiries, today)
    );

    renderUserAppointmentStatus(upcomingAppointments);
    renderUserProductAvailability(
        getProductAvailabilityData(products, userDashboardLimits.products)
    );
    renderUserInquiryUpdates(recentInquiries);
}
