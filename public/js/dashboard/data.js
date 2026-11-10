/* ===================== SHARED ICONS ===================== */

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
    vegetables: '🥬',
    fruits: '🍎',
    poultry: '🥚',
    fungi: '🍄',
    apiary: '🍯'
};

function getProductIcon(product) {
    return productIcons[product.name]
        ?? categoryIcons[String(product.category ?? '').toLowerCase()]
        ?? '📦';
}

/* ===================== ADMIN DASHBOARD ===================== */

export function getAdminStatsData(summary) {
    return [
        {
            key: 'total',
            label: 'Total Products',
            value: summary.totalProducts,
            icon: 'fa-solid fa-boxes-stacked'
        },
        {
            key: 'in-stock',
            label: 'In Stock',
            value: summary.inStock,
            icon: 'fa-regular fa-circle-check'
        },
        {
            key: 'out-of-stock',
            label: 'Out of Stock',
            value: summary.outOfStock,
            icon: 'fa-regular fa-circle-xmark'
        }
    ];
}

export function getInventoryData(summary) {
    return [
        {
            key: 'in-stock',
            label: 'In Stock',
            value: summary.inStock,
            color: '#40916C'
        },
        {
            key: 'out-of-stock',
            label: 'Out of Stock',
            value: summary.outOfStock,
            color: '#E9ECEF'
        }
    ];
}

export function getStockAlertsData(outOfStockProducts) {
    return outOfStockProducts.map(product => ({
        name: product.name,
        category: product.category,
        icon: getProductIcon(product),
        units: 0,
        status: 'Out of Stock'
    }));
}

/* ===================== USER DASHBOARD ===================== */

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

function isUpcomingAppointment(appointment, startOfToday) {
    const date = getAppointmentDate(appointment);

    return date && date >= startOfToday &&
        String(appointment.status ?? '').toLowerCase() !== 'rejected';
}

// Counts upcoming appointments, pending approvals, and inquiry statuses.
export function getUserStatsData(
    appointments,
    inquiries,
    today = new Date()
) {
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    const upcomingAppointments = appointments.filter(appointment =>
        isUpcomingAppointment(appointment, startOfToday)
    );

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

// Returns upcoming appointments, earliest first. The API already sorts by date and time.
export function getUpcomingUserAppointments(
    appointments,
    limit = 2,
    today = new Date()
) {
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    return appointments
        .filter(appointment => isUpcomingAppointment(appointment, startOfToday))
        .slice(0, limit);
}

// Products for the user dashboard's availability preview.
export function getProductAvailabilityData(products, limit = 4) {
    return products.slice(0, limit).map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        icon: getProductIcon(product),
        status: product.inStock ? 'In Stock' : 'Out of Stock'
    }));
}

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
