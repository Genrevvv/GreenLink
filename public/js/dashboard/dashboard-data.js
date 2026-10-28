// Dashboard data (temporary front-end data, replace with API data later)
import { productsData } from '../products/data.js';

// Products that are not archived
const activeProducts = productsData.filter(product => !product.isArchived);

/* ===================== ADMIN DASHBOARD ===================== */

const inStockProducts = activeProducts.filter(product => product.inStock);
const outOfStockProducts = activeProducts.filter(product => !product.inStock);

// Icon shown beside a product in Stock Alerts (by product name, then by category)
const productIcons = {
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
        icon: 'fa-solid fa-cubes'
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
    { key: 'in-stock', label: 'In Stock', value: inStockProducts.length, color: 'var(--base-green)' },
    { key: 'out-of-stock', label: 'Out of Stock', value: outOfStockProducts.length, color: '#e5e7eb' }
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
        purpose: 'Farm Tour',
        date: '2026-10-28',
        time: '10:00 AM',
        status: 'Confirmed'
    },
    {
        id: 2,
        customer: 'John Smith',
        purpose: 'Educational Visit',
        date: '2026-10-30',
        time: '2:00 PM',
        status: 'Pending'
    },
    {
        id: 3,
        customer: 'Sarah Johnson',
        purpose: 'Product Inquiry',
        date: '2026-11-03',
        time: '9:00 AM',
        status: 'Confirmed'
    },
    {
        id: 4,
        customer: 'Miguel Reyes',
        purpose: 'Training Enrollment',
        date: '2026-11-05',
        time: '11:00 AM',
        status: 'Pending'
    }
]; // Dummy data for front-end testing.


/* ===================== USER DASHBOARD ===================== */

export const userStatsData = [
    {
        key: 'orders',
        label: 'My Orders',
        value: 7,
        icon: 'fa-solid fa-cart-shopping',
        subLabel: 'Pending',
        subValue: 2
    },
    {
        key: 'appointments',
        label: 'My Appointments',
        value: 3,
        icon: 'fa-regular fa-calendar',
        subLabel: 'Upcoming',
        subValue: 2
    },
    {
        key: 'inquiries',
        label: 'My Inquiries',
        value: 4,
        icon: 'fa-regular fa-message',
        subLabel: 'Replied',
        subValue: 2
    }
];

export const userQuickActionsData = [
    {
        page: 'products',
        label: 'Browse Products',
        description: 'Shop fresh, locally-grown produce',
        icon: 'fa-solid fa-bag-shopping'
    },
    {
        page: 'appointments',
        label: 'Book a Farm Visit',
        description: 'Schedule a tour or workshop',
        icon: 'fa-regular fa-calendar-plus'
    },
    {
        page: 'inquiries',
        label: 'Send an Inquiry',
        description: 'Ask us anything about the farm',
        icon: 'fa-regular fa-paper-plane'
    }
];

export const userRecentOrdersData = [
    {
        id: 'ORD-1031',
        items: 'Lettuce (2 kg)',
        total: 90,
        date: '2026-10-27',
        status: 'Pending'
    },
    {
        id: 'ORD-1022',
        items: 'Organic Eggs (1 dozen)',
        total: 120,
        date: '2026-10-20',
        status: 'Processing'
    },
    {
        id: 'ORD-1015',
        items: 'Kangkong (3 bundles)',
        total: 105,
        date: '2026-10-12',
        status: 'Completed'
    }
];

export const userUpcomingAppointmentsData = [
    {
        id: 7,
        purpose: 'Farm Tour',
        date: '2026-11-03',
        time: '09:00 AM',
        visitors: 4,
        status: 'Approved'
    },
    {
        id: 9,
        purpose: 'Hydroponics Workshop',
        date: '2026-11-15',
        time: '01:00 PM',
        visitors: 2,
        status: 'Pending'
    }
]; // Dummy data for front-end testing.
