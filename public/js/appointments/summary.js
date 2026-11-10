// APPOINTMENT SUMMARY
export function updateSummaryCards(appointmentsData) {
    const totalEl = document.querySelector('#total-count');
    const pendingEl = document.querySelector('#pending-count');
    const approvedEl = document.querySelector('#approved-count');

    if (totalEl) {
        totalEl.textContent = appointmentsData.length;
    }

    if (pendingEl) {
        pendingEl.textContent = appointmentsData.filter(
            appointment => appointment.status === 'Pending'
        ).length;
    }

    if (approvedEl) {
        approvedEl.textContent = appointmentsData.filter(
            appointment => appointment.status === 'Approved'
        ).length;
    }
}
