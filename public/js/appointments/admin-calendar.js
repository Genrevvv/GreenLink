import {
    adminDateAppointmentCardModal,
    adminDateAppointmentsTitleModal,
    calendarDayTooltipModal,
    emptyAdminDateAppointmentsModal
} from './modal.js';
import { initAppointmentCalendar } from './calendar.js';
import { getSelectedStatus, matchesStatusFilter } from './filter.js';
import { toMinutes } from './schedule.js';
import { requestStatusChange } from './table.js';

// Shared with the table, so both views show the same statuses.
const STATUS_FILTER = '#filter-appointment-status';

// ADMIN CALENDAR VIEW
// Calendar of every customer's appointments (left) and the clicked date's
// appointments (right). Returns { refresh } so the table can keep it in sync.
export function initAdminCalendar(appointmentsData) {
    const dateInput = document.querySelector('#admin-calendar-date');
    const panelTitle = document.querySelector('#admin-date-title');
    const panelCount = document.querySelector('#admin-date-count');
    const panelList = document.querySelector('#admin-date-appointments');

    if (!dateInput || !panelList) {
        return { refresh() {} };
    }

    let selectedDate = '';

    const getAppointmentsForDate = (date, applyFilter = true) => {
        const selectedStatus = getSelectedStatus(STATUS_FILTER);

        return appointmentsData
            .filter(appointment =>
                appointment.date === date &&
                (!applyFilter || matchesStatusFilter(appointment, selectedStatus))
            )
            .sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
    };

    const calendar = initAppointmentCalendar(dateInput, {
        allowPastDates: true,

        getDateInfo: date => {
            const appointments = getAppointmentsForDate(date);

            if (appointments.length === 0) return null;

            const hasPending = appointments.some(appointment => appointment.status === 'Pending');

            return {
                count: appointments.length,
                isFull: false,
                title: `${appointments.length} appointment${appointments.length === 1 ? '' : 's'}`,
                classes: hasPending ? ['has-pending'] : []
            };
        },

        getDayTooltip: date => {
            const appointments = getAppointmentsForDate(date);

            return appointments.length > 0
                ? calendarDayTooltipModal(date, appointments, { showCustomer: true, maxItems: 3 })
                : '';
        },

        onSelect: date => {
            selectedDate = date;
            renderDatePanel();
        }
    });

    function renderDatePanel() {
        const appointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

        if (panelTitle) {
            panelTitle.innerHTML = adminDateAppointmentsTitleModal(selectedDate);
        }

        if (panelCount) {
            panelCount.textContent = selectedDate
                ? `${appointments.length} appointment${appointments.length === 1 ? '' : 's'}`
                : '';
            panelCount.classList.toggle('hidden', !selectedDate);
        }

        if (appointments.length === 0) {
            const hasHidden = selectedDate && getAppointmentsForDate(selectedDate, false).length > 0;
            panelList.innerHTML = emptyAdminDateAppointmentsModal(selectedDate, hasHidden);
            return;
        }

        panelList.innerHTML = appointments.map(adminDateAppointmentCardModal).join('');

        panelList.querySelectorAll('.admin-date-action-btn').forEach(button => {
            button.onclick = () => {
                const appointment = appointmentsData.find(
                    item => String(item.id) === button.dataset.id
                );

                if (!appointment) return;

                requestStatusChange(appointment, appointmentsData, button.dataset.status, button);
            };
        });
    }

    renderDatePanel();

    return {
        refresh() {
            calendar.refresh();
            renderDatePanel();
        }
    };
}

// VIEW SWITCH (segmented control): the table shows first, the calendar is hidden.
export function initAppointmentsViewSwitch() {
    const buttons = document.querySelectorAll('.appointments-view-switch-btn');
    const views = document.querySelectorAll('[data-appointments-view]');
    const statusFilter = document.querySelector('.appointments-toolbar-filter');

    const showView = viewName => {
        buttons.forEach(button => {
            const isActive = button.dataset.view === viewName;

            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });

        views.forEach(view => {
            view.classList.toggle('hidden', view.dataset.appointmentsView !== viewName);
        });

        statusFilter?.classList.toggle('hidden', !['table', 'calendar'].includes(viewName));
    };

    buttons.forEach(button => {
        button.onclick = () => showView(button.dataset.view);
    });

    showView('table');
}
