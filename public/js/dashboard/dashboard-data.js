// Dashboard data (temporary front-end data, replace with API data later)

export const statsData = [
    {
        key: 'orders',
        label: 'Total Orders',
        value: 128,
        icon: 'fa-solid fa-cart-shopping',
        subLabel: 'Pending Orders',
        subValue: 12
    },
    {
        key: 'appointments',
        label: 'Total Appointments',
        value: 46,
        icon: 'fa-regular fa-calendar',
        subLabel: 'Pending Requests',
        subValue: 5
    },
    {
        key: 'inquiries',
        label: 'Total Inquiries',
        value: 34,
        icon: 'fa-regular fa-message',
        subLabel: 'Unread',
        subValue: 3
    },
    {
        key: 'products',
        label: 'Total Products',
        value: 18,
        icon: 'fa-solid fa-bag-shopping',
        subLabel: 'Low Stock',
        subValue: 2
    }
];

export const monthlyActivityData = [
    { month: 'Jan', orders: 14, appointments: 4 },
    { month: 'Feb', orders: 18, appointments: 6 },
    { month: 'Mar', orders: 22, appointments: 5 },
    { month: 'Apr', orders: 17, appointments: 8 },
    { month: 'May', orders: 26, appointments: 9 },
    { month: 'Jun', orders: 31, appointments: 7 }
];

export const recentOrdersData = [
    {
        id: 'ORD-1028',
        customer: 'Juan Dela Cruz',
        items: 'Lettuce (2 kg)',
        total: 90,
        date: '2026-10-16',
        status: 'Pending'
    },
    {
        id: 'ORD-1027',
        customer: 'Maria Santos',
        items: 'Organic Eggs (1 dozen)',
        total: 120,
        date: '2026-10-15',
        status: 'Completed'
    },
    {
        id: 'ORD-1026',
        customer: 'Pedro Reyes',
        items: 'Kangkong (3 bundles)',
        total: 105,
        date: '2026-10-15',
        status: 'Processing'
    },
    {
        id: 'ORD-1025',
        customer: 'Ana Villanueva',
        items: 'Lettuce (1 kg)',
        total: 45,
        date: '2026-10-14',
        status: 'Completed'
    },
    {
        id: 'ORD-1024',
        customer: 'Carlo Mendoza',
        items: 'Kangkong (2 bundles)',
        total: 70,
        date: '2026-10-13',
        status: 'Cancelled'
    }
];

export const pendingAppointmentsData = [
    {
        id: 1,
        customer: 'Juan Dela Cruz',
        purpose: 'Farm Tour',
        date: '2026-10-20',
        time: '09:00 AM',
        visitors: 4
    },
    {
        id: 3,
        customer: 'Pedro Reyes',
        purpose: 'Farm Tour',
        date: '2026-10-22',
        time: '01:00 PM',
        visitors: 3
    },
    {
        id: 4,
        customer: 'Liza Garcia',
        purpose: 'Hydroponics Workshop',
        date: '2026-10-24',
        time: '10:00 AM',
        visitors: 8
    },
    {
        id: 5,
        customer: 'Mark Bautista',
        purpose: 'Educational Visit',
        date: '2026-10-27',
        time: '02:30 PM',
        visitors: 15
    }
]; // Dummy data for front-end testing.
