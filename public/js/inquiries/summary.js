import { setText } from './helpers.js';

// SUMMARY CARDS
export function updateSummaryCards(inquiries) {
    const countBy = status => inquiries.filter(inquiry => inquiry.status === status).length;

    setText('#inquiries-total-count', inquiries.length);
    setText('#inquiries-pending-count', countBy('Pending'));
    setText('#inquiries-responded-count', countBy('Responded'));
}
