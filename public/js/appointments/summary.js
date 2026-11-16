// APPOINTMENT SUMMARY
export function updateSummaryCards(appointmentsData) {
    const totalEl = document.querySelector('#total-count');
    const pendingEl = document.querySelector('#pending-count');
    const approvedEl = document.querySelector('#approved-count');
    const cancelledEl = document.querySelector('#cancelled-count');

    const countByStatus = status => appointmentsData.filter(
        appointment => appointment.status === status
    ).length;

    if (totalEl) {
        totalEl.textContent = appointmentsData.length;
    }

    if (pendingEl) {
        pendingEl.textContent = countByStatus('Pending');
    }

    if (approvedEl) {
        approvedEl.textContent = countByStatus('Approved');
    }

    if (cancelledEl) {
        cancelledEl.textContent = countByStatus('Rejected') + countByStatus('Cancelled');
    }
}
