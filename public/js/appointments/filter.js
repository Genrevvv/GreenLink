// APPOINTMENT STATUS FILTER
// 'active' shows Pending and Approved appointments (the default view).
export function matchesStatusFilter(appointment, selectedStatus) {
    if (!selectedStatus || selectedStatus === 'all') return true;

    if (selectedStatus === 'active') {
        return ['Pending', 'Approved'].includes(appointment.status);
    }

    return appointment.status.toLowerCase() === selectedStatus;
}

export function getSelectedStatus(selector) {
    return document.querySelector(selector)?.value || 'active';
}

export function initStatusFilter(selector, onChange) {
    const statusFilter = document.querySelector(selector);

    if (!statusFilter) return;

    statusFilter.onchange = onChange;
}
