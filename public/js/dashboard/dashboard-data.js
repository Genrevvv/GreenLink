// Dashboard data (temporary front-end data, replace with API data later)
import { productsData } from '../products/data.js';

// Products that are not archived
const activeProducts = productsData.filter(product => !product.isArchived);

/* ===================== ADMIN DASHBOARD ===================== */

const inStockProducts = activeProducts.filter(product => product.inStock);
const outOfStockProducts = activeProducts.filter(product => !product.inStock);

// Icon shown beside a product in Stock Alerts (by product name, then by category)
const productIcons = {
    'Lettuce': '🥬',
    'Kangkong': '🌿',
    'Free-Range Chicken': '🐔',
    'Organic Eggs': '🥚',
    'Tomatoes': '🍅',
    'Eggplant': '🍆',
    'Mushroom': '🍄',
    'Honey': '🍯'
};

const categoryIcons = {
    Vegetables: '🥬',
    Fruits: '🍎',
    Poultry: '🥚',
    Fungi: '🍄',
    Apiary: '🍯'
};

// Summary cards
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

// Inventory Availability donut chart
export const inventoryData = [
    { key: 'in-stock', label: 'In Stock', value: inStockProducts.length, color: '#40916C' },
    { key: 'out-of-stock', label: 'Out of Stock', value: outOfStockProducts.length, color: '#E9ECEF' }
];

// Stock Alerts (products needing attention)
export const stockAlertsData = outOfStockProducts.map(product => ({
    name: product.name,
    category: product.category,
    icon: productIcons[product.name] ?? categoryIcons[product.category] ?? '📦',
    units: 0,
    status: 'Out of Stock'
}));

// Upcoming Appointments
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
]; // Dummy data for front-end testing.


/* ===================== USER DASHBOARD ===================== */

// Appointments of the logged-in user
export const userAppointmentsData = [
    {
        id: 1,
        date: '2026-06-05',
        time: '10:00 AM',
        visitors: 4,
        status: 'Approved'
    },
    {
        id: 2,
        date: '2026-06-12',
        time: '2:00 PM',
        visitors: 2,
        status: 'Pending'
    },
    {
        id: 3,
        date: '2026-05-20',
        time: '9:00 AM',
        visitors: 3,
        status: 'Approved'
    }
];

// Inquiries of the logged-in user (shared with the Inquiries page)
export { userInquiriesData } from '../inquiries/inquiries-data.js';

// Summary cards (values are counted from the data above)
export function getUserStatsData(appointments, inquiries) {
    return [
        {
            key: 'approved',
            label: 'Approved Appointments',
            value: appointments.filter(appointment => appointment.status === 'Approved').length,
            icon: 'fa-regular fa-circle-check'
        },
        {
            key: 'inquiries',
            label: 'Submitted Inquiries',
            value: inquiries.length,
            icon: 'fa-regular fa-message'
        }
    ];
}

// Number of items shown in each dashboard panel
export const userDashboardLimits = {
    appointments: 2,
    inquiries: 3
};
