
import { productsData } from '../products/data.js';
import { userInquiriesData } from '../inquiries/inquiries-data.js';

/* ===================== SHARED PRODUCT DATA ===================== */

const activeProducts = productsData.filter(product => !product.isArchived);

const inStockProducts = activeProducts.filter(product => product.inStock);
const outOfStockProducts = activeProducts.filter(product => !product.inStock);

const productIcons = {
    Lettuce: '🥬',
    Kangkong: '🌿',
    'Free-Range Chicken': '🐔',
    'Organic Eggs': '🥚',
    Tomatoes: '🍅',
    Eggplant: '🍆',
    Mushroom: '🍄',
    Honey: '🍯'
};

const categoryIcons = {
    Vegetables: '🥬',
    Fruits: '🍎',
    Poultry: '🥚',
    Fungi: '🍄',
    Apiary: '🍯'
};

/* ===================== ADMIN DASHBOARD ===================== */

export const statsData = [
    {
        key: 'total',
        label: 'Total Products',
        value: activeProducts.length,
        icon: 'fa-solid fa-boxes-stacked'
    },
    {
        key: 'in-stock',
        label: 'In Stock',
        value: inStockProducts.length,
        icon: 'fa-regular fa-circle-check'
    },
    {
        key: 'out-of-stock',
        label: 'Out of Stock',
        value: outOfStockProducts.length,
        icon: 'fa-regular fa-circle-xmark'
    }
];

export const inventoryData = [
    {
        key: 'in-stock',
        label: 'In Stock',
        value: inStockProducts.length,
        color: '#40916C'
    },
    {
        key: 'out-of-stock',
        label: 'Out of Stock',
        value: outOfStockProducts.length,
        color: '#E9ECEF'
    }
];

export const stockAlertsData = outOfStockProducts.map(product => ({
    name: product.name,
    category: product.category,
    icon: productIcons[product.name] ?? categoryIcons[product.category] ?? '📦',
    units: 0,
    status: 'Out of Stock'
}));

export const upcomingAppointmentsData = [
    {
        id: 1,
        customer: 'Lisa Brown',
        type: 'Farm Tour',
        date: 'Oct 28, 2026',
        time: '10:00 AM',
        status: 'Confirmed'
    },
    {
        id: 2,
        customer: 'John Smith',
        type: 'Educational Visit',
        date: 'Oct 30, 2026',
        time: '2:00 PM',
        status: 'Pending'
    },
    {
        id: 3,
        customer: 'Sarah Johnson',
        type: 'Product Inquiry',
        date: 'Nov 3, 2026',
        time: '9:00 AM',
        status: 'Confirmed'
    },
    {
        id: 4,
        customer: 'Miguel Reyes',
        type: 'Training Enrollment',
        date: 'Nov 5, 2026',
        time: '11:00 AM',
        status: 'Pending'
    }
];

/* ===================== USER DASHBOARD ===================== */

// Temporary appointment data for front-end testing.
// Replace this array with appointments fetched for the logged-in user.
export const userAppointmentsData = [
    {
        id: 1,
        date: '2026-06-05',
        time: '10:00 AM',
        visitors: 4,
        purpose: 'Farm Tour',
        status: 'Approved'
    },
    {
        id: 2,
        date: '2026-06-12',
        time: '2:00 PM',
        visitors: 2,
        purpose: 'Educational Visit',
        status: 'Pending'
    },
    {
        id: 3,
        date: '2026-05-20',
        time: '9:00 AM',
        visitors: 3,
        purpose: 'Farm Tour',
        status: 'Approved'
    }
];

// Inquiries are shared with the existing Inquiries page.
export { userInquiriesData };

/* ===================== USER DASHBOARD HELPERS ===================== */

function getAppointmentDate(appointment) {
    if (!appointment.date) return null;

    const date = new Date(`${appointment.date}T00:00:00`);

    return Number.isNaN(date.getTime()) ? null : date;
}

function getInquiryStatus(inquiry) {
    return String(inquiry.status ?? '').trim().toLowerCase();
}

function isRespondedInquiry(inquiry) {
    return ['responded', 'answered', 'resolved', 'closed'].includes(
        getInquiryStatus(inquiry)
    );
}

function isOpenInquiry(inquiry) {
    return !isRespondedInquiry(inquiry);
}

// Counts upcoming appointments, pending approvals, and inquiry statuses.
export function getUserStatsData(
    appointments,
    inquiries,
    today = new Date()
) {
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    const upcomingAppointments = appointments.filter(appointment => {
        const date = getAppointmentDate(appointment);

        return date && date >= startOfToday;
    });

    const awaitingApproval = appointments.filter(appointment =>
        String(appointment.status ?? '').toLowerCase() === 'pending'
    );

    const openInquiries = inquiries.filter(isOpenInquiry);
    const respondedInquiries = inquiries.filter(isRespondedInquiry);

    return [
        {
            key: 'upcoming',
            label: 'Upcoming Appointments',
            value: upcomingAppointments.length,
            icon: 'fa-regular fa-calendar'
        },
        {
            key: 'awaiting',
            label: 'Awaiting Approval',
            value: awaitingApproval.length,
            icon: 'fa-regular fa-clock'
        },
        {
            key: 'open-inquiries',
            label: 'Open Inquiries',
            value: openInquiries.length,
            icon: 'fa-regular fa-message'
        },
        {
            key: 'responded-inquiries',
            label: 'Responded Inquiries',
            value: respondedInquiries.length,
            icon: 'fa-regular fa-circle-check'
        }
    ];
}

// Returns upcoming appointments first, earliest date first.
export function getUpcomingUserAppointments(
    appointments,
    limit = 2,
    today = new Date()
) {
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    return appointments
        .filter(appointment => {
            const date = getAppointmentDate(appointment);

            return date && date >= startOfToday;
        })
        .sort((a, b) =>
            getAppointmentDate(a) - getAppointmentDate(b)
        )
        .slice(0, limit);
}

// Products for the user dashboard's availability preview.
export const productAvailabilityData = activeProducts.slice(0, 4).map(product => ({
    id: product.id,
    name: product.name,
    category: product.category,
    icon: productIcons[product.name] ?? categoryIcons[product.category] ?? '📦',
    status: product.inStock ? 'In Stock' : 'Out of Stock'
}));

// Latest inquiry records for the user's dashboard.
export function getRecentUserInquiries(inquiries, limit = 3) {
    return [...inquiries]
        .sort((a, b) => {
            const dateA = new Date(a.date ?? 0).getTime();
            const dateB = new Date(b.date ?? 0).getTime();

            return (Number.isNaN(dateB) ? 0 : dateB) -
                (Number.isNaN(dateA) ? 0 : dateA);
        })
        .slice(0, limit);
}

export const userDashboardLimits = {
    appointments: 2,
    inquiries: 3,
    products: 4
};
