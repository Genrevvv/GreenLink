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

export function getSelectedDateFilter() {
    return document.querySelector('#filter-appointment-date')?.value || 'all';
}

export function getSelectedPurposeFilter() {
    return document.querySelector('#filter-appointment-purpose')?.value || 'all';
}

export function matchesDateFilter(appointment, selectedDateFilter) {
    if (!selectedDateFilter || selectedDateFilter === 'all') return true;

    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const today = `${monthPrefix}-${String(now.getDate()).padStart(2, '0')}`;

    if (selectedDateFilter === 'today') return appointment.date === today;
    if (selectedDateFilter === 'month') return String(appointment.date).startsWith(monthPrefix);

    return true;
}

export function matchesPurposeFilter(appointment, selectedPurpose) {
    return !selectedPurpose || selectedPurpose === 'all'
        || appointment.purpose === selectedPurpose;
}

export function initAppointmentFilters(onChange) {
    document.querySelector('#filter-appointment-date')?.addEventListener('change', onChange);
    document.querySelector('#filter-appointment-purpose')?.addEventListener('change', onChange);
}

export function populatePurposeFilter(appointments, appointmentTypes = []) {
    const purposeFilter = document.querySelector('#filter-appointment-purpose');
    if (!purposeFilter) return;

    const selectedPurpose = purposeFilter.value || 'all';
    const purposes = [...new Set([
        ...appointments.map(appointment => appointment.purpose),
        ...appointmentTypes.map(type => type.purpose)
    ]
        .filter(Boolean))]
        .sort((first, second) => {
            const firstIsOther = String(first).trim().toLowerCase() === 'other';
            const secondIsOther = String(second).trim().toLowerCase() === 'other';

            if (firstIsOther !== secondIsOther) return firstIsOther ? 1 : -1;

            return String(first).localeCompare(String(second));
        });

    purposeFilter.replaceChildren();

    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All Purposes';
    purposeFilter.appendChild(allOption);

    purposes.forEach(purpose => {
        const option = document.createElement('option');
        option.value = purpose;
        option.textContent = purpose;
        purposeFilter.appendChild(option);
    });

    purposeFilter.value = purposes.includes(selectedPurpose) ? selectedPurpose : 'all';
}
