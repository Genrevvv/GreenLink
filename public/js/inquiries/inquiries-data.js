// Inquiries data (temporary front-end data, replace with API data later)

// All customer inquiries (admin side)
export const inquiriesData = [
    {
        id: 1,
        customer: 'Juan Dela Cruz',
        email: 'juan@email.com',
        subject: 'Bulk order discount',
        message: 'Do you offer discounts for bulk orders of lettuce? We need around 100kg per month.',
        date: '2026-05-28',
        status: 'Responded',
        response: 'Yes, we offer 10% discount for orders above 50kg. Please contact us for more details.'
    },
    {
        id: 2,
        customer: 'Maria Santos',
        email: 'maria@email.com',
        subject: 'Farm tour availability',
        message: 'Are farm tours available on weekends? We would like to visit with a group of 15 people.',
        date: '2026-05-27',
        status: 'Pending',
        response: ''
    },
    {
        id: 3,
        customer: 'Pedro Reyes',
        email: 'pedro@email.com',
        subject: 'Organic certification',
        message: 'Are your products certified organic? We need documentation for our restaurant.',
        date: '2026-05-26',
        status: 'Responded',
        response: 'Yes, all our products are certified organic by the Philippine Organic Authority.'
    },
    {
        id: 4,
        customer: 'Ana Garcia',
        email: 'ana@email.com',
        subject: 'Delivery options',
        message: 'Do you deliver to Metro Manila? What are the delivery charges?',
        date: '2026-05-24',
        status: 'Pending',
        response: ''
    },
    {
        id: 5,
        customer: 'Carlos Lopez',
        email: 'carlos@email.com',
        subject: 'Product availability',
        message: 'When will honey be back in stock? I need 10 bottles for a special event.',
        date: '2026-05-22',
        status: 'Responded',
        response: 'Honey will be back in stock by June 1st. We can reserve 10 bottles for you.'
    }
];

// Inquiries sent by the logged-in user (user side, newest first)
export const userInquiriesData = [
    {
        id: 1,
        subject: 'Bulk order discount',
        message: 'Do you offer discounts for bulk orders of lettuce?',
        date: '2026-05-28',
        status: 'Responded',
        response: 'Yes, we offer 10% discount for orders above 50kg. Please contact us for more details.'
    },
    {
        id: 2,
        subject: 'Farm tour availability',
        message: 'Are farm tours available on weekends?',
        date: '2026-05-27',
        status: 'Pending',
        response: ''
    },
    {
        id: 3,
        subject: 'Organic certification',
        message: 'Are your products certified organic?',
        date: '2026-05-26',
        status: 'Responded',
        response: 'Yes, all our products are certified organic by the Philippine Organic Authority.'
    },
    {
        id: 4,
        subject: 'Delivery options',
        message: 'Do you deliver to Metro Manila?',
        date: '2026-05-24',
        status: 'Responded',
        response: 'Yes, we deliver to Metro Manila with a minimum order of ₱500. Delivery fee applies.'
    },
    {
        id: 5,
        subject: 'Product availability',
        message: 'When will honey be back in stock?',
        date: '2026-05-22',
        status: 'Pending',
        response: ''
    }
];
