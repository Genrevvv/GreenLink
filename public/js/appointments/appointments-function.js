import {
    appointmentRowModal,
    appointmentDetailsModal,
    emptyAppointmentDetailsModal,
    emptyAppointmentsRowModal,
    emptyUserAppointmentsModal,
    userAppointmentCardModal
} from './appointments-modal.js';

let selectedId = null;

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

// APPOINTMENT MANAGEMENT: Table Row
export function addAppointmentRow(appointmentData, appointmentsData) {
    const tbody = document.querySelector('#appointments-tbody');

    if (!tbody) return;

    const row = document.createElement('tr');
    row.classList.add('appointment-row');
    row.innerHTML = appointmentRowModal(appointmentData);

    tbody.appendChild(row);

    setupAppointmentRowActions(row, appointmentData, appointmentsData);
}

function setupAppointmentRowActions(row, appointmentData, appointmentsData) {
    // Select appointment
    row.onclick = () => {
        selectedId = appointmentData.id;

        document.querySelectorAll('.appointment-row').forEach(row => {
            row.classList.remove('appointment-row-selected');
        });

        row.classList.add('appointment-row-selected');

        showAppointmentDetails(appointmentsData);
    };

    // Approve appointment
    const approveBtn = row.querySelector('.approve-btn');

    if (approveBtn) {
        approveBtn.onclick = event => {
            event.stopPropagation();
            approveAppointment(appointmentData, row, appointmentsData);
        };
    }

    // Reject appointment
    const rejectBtn = row.querySelector('.reject-btn');

    if (rejectBtn) {
        rejectBtn.onclick = event => {
            event.stopPropagation();
            rejectAppointment(appointmentData, row, appointmentsData);
        };
    }
}

// APPOINTMENT ACTIONS
function approveAppointment(appointmentData, row, appointmentsData) {
    appointmentData.status = 'Approved';

    // Update the existing row
    row.innerHTML = appointmentRowModal(appointmentData);

    setupAppointmentRowActions(row, appointmentData, appointmentsData);

    // Update affected UI
    updateSummaryCards(appointmentsData);
    showAppointmentDetails(appointmentsData);
}

function rejectAppointment(appointmentData, row, appointmentsData) {
    const confirmed = confirm(
        'Are you sure you want to reject this request?'
    );

    if (!confirmed) return;

    const index = appointmentsData.findIndex(
        appointment => appointment.id === appointmentData.id
    );

    if (index === -1) return;

    appointmentsData.splice(index, 1);
    row.remove();

    if (selectedId === appointmentData.id) {
        selectedId = null;
    }

    // Show empty state if no appointments remain
    const tbody = document.querySelector('#appointments-tbody');

    if (tbody && appointmentsData.length === 0) {
        tbody.innerHTML = emptyAppointmentsRowModal();
    }

    // Update affected UI
    updateSummaryCards(appointmentsData);
    showAppointmentDetails(appointmentsData);
}

// APPOINTMENT DISPLAY: Details Panel
export function showAppointmentDetails(appointmentsData) {
    const container = document.querySelector('#details-content');

    if (!container) return;

    const appointment = appointmentsData.find(
        item => item.id === selectedId
    );

    if (!appointment) {
        container.innerHTML = emptyAppointmentDetailsModal();
        return;
    }

    container.innerHTML = appointmentDetailsModal(appointment);
}
// USER APPOINTMENTS
export function initUserAppointments(userAppointmentsData) {
    const form = document.querySelector('#appointment-booking-form');
    const dateInput = document.querySelector('#appointment-date');
    const timeInput = document.querySelector('#appointment-time');
    const purposeInput = document.querySelector('#appointment-purpose');
    const visitorsInput = document.querySelector('#appointment-visitors');
    const notesInput = document.querySelector('#appointment-notes');
    const appointmentsList = document.querySelector('#user-appointments-list');
    const message = document.querySelector('#appointment-form-message');

    if (
        !form ||
        !dateInput ||
        !timeInput ||
        !purposeInput ||
        !visitorsInput ||
        !appointmentsList
    ) {
        return;
    }

    // Prevent selecting dates in the past.
    const getLocalToday = () => {
        const today = new Date();

        return [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, '0'),
            String(today.getDate()).padStart(2, '0')
        ].join('-');
    };

    const calendar = initAppointmentCalendar(dateInput);

    // Register the submit handler only once per form.
    if (form.dataset.appointmentHandlerAttached !== 'true') {
        form.dataset.appointmentHandlerAttached = 'true';

        form.addEventListener('submit', (event) => {
            // Stop the browser's default form submission and page reload.
            event.preventDefault();

            const date = dateInput.value;
            const time = timeInput.value;
            const purpose = purposeInput.value;
            const visitors = Number(visitorsInput.value);
            const notes = notesInput ? notesInput.value.trim() : '';

            if (!date || date < getLocalToday()) {
                showUserAppointmentMessage(
                    message,
                    'is-error',
                    'Please select today or a future date.'
                );
                return;
            }

            if (!time || !purpose) {
                showUserAppointmentMessage(
                    message,
                    'is-error',
                    'Please select a time slot and visit purpose.'
                );
                return;
            }

            if (!Number.isInteger(visitors) || visitors < 1) {
                showUserAppointmentMessage(
                    message,
                    'is-error',
                    'Please enter a valid number of visitors.'
                );
                return;
            }

            // Temporary front-end appointment record.
            const appointment = {
                id: Date.now(),
                date,
                time,
                purpose,
                visitors,
                notes,
                status: 'Pending'
            };

            userAppointmentsData.push(appointment);

            renderUserAppointments(userAppointmentsData);

            form.reset();
            calendar.reset();

            showUserAppointmentMessage(
                message,
                'is-success',
                'Your appointment request has been added!'
            );
        });
    }

    renderUserAppointments(userAppointmentsData);
}

function renderUserAppointments(userAppointmentsData) {
    const appointmentsList = document.querySelector('#user-appointments-list');

    if (!appointmentsList) {
        return;
    }

    const today = new Date();

    const localToday = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0')
    ].join('-');

    const upcomingAppointments = userAppointmentsData
        .filter(appointment =>
            appointment.date >= localToday &&
            appointment.status !== 'Rejected'
        )
        .sort((a, b) =>
            a.date.localeCompare(b.date) ||
            a.time.localeCompare(b.time)
        );

    if (upcomingAppointments.length === 0) {
        appointmentsList.innerHTML = emptyUserAppointmentsModal();
        return;
    }

    appointmentsList.innerHTML = upcomingAppointments
        .map(appointment => userAppointmentCardModal(appointment))
        .join('');
}

function showUserAppointmentMessage(message, messageType, text) {
    if (!message) {
        return;
    }

    message.textContent = text;
    message.classList.remove('hidden', 'is-success', 'is-error');
    message.classList.add(messageType);
}

function initAppointmentCalendar(dateInput) {
    const monthLabel = document.querySelector('#calendar-month-year');
    const daysContainer = document.querySelector('#calendar-days');
    const previousButton = document.querySelector('#calendar-prev');
    const nextButton = document.querySelector('#calendar-next');
    const selectedLabel = document.querySelector('#calendar-selected-date');

    if (
        !dateInput ||
        !monthLabel ||
        !daysContainer ||
        !previousButton ||
        !nextButton ||
        !selectedLabel
    ) {
        return {
            reset() {}
        };
    }

    const getLocalToday = () => {
        const today = new Date();

        return [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, '0'),
            String(today.getDate()).padStart(2, '0')
        ].join('-');
    };

    const todayString = getLocalToday();
    const today = new Date();
    const earliestDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );

    let displayedMonth = new Date(earliestDate);
    let selectedDate = '';

    const formatDate = (year, month, day) => {
        return [
            year,
            String(month + 1).padStart(2, '0'),
            String(day).padStart(2, '0')
        ].join('-');
    };

    const renderCalendar = () => {
        const year = displayedMonth.getFullYear();
        const month = displayedMonth.getMonth();

        monthLabel.textContent = displayedMonth.toLocaleDateString(
            'en-US',
            {
                month: 'long',
                year: 'numeric'
            }
        );

        daysContainer.innerHTML = '';

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('span');
            emptyDay.className = 'custom-calendar-empty';
            emptyDay.setAttribute('aria-hidden', 'true');
            daysContainer.appendChild(emptyDay);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateString = formatDate(year, month, day);
            const dayButton = document.createElement('button');

            dayButton.type = 'button';
            dayButton.className = 'custom-calendar-day';
            dayButton.textContent = day;
            dayButton.setAttribute(
                'aria-label',
                new Date(year, month, day).toLocaleDateString(
                    'en-US',
                    {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    }
                )
            );

            if (dateString < todayString) {
                dayButton.disabled = true;
                dayButton.classList.add('is-past');
            }

            if (dateString === todayString) {
                dayButton.classList.add('is-today');
            }

            if (dateString === selectedDate) {
                dayButton.classList.add('is-selected');
                dayButton.setAttribute('aria-pressed', 'true');
            } else {
                dayButton.setAttribute('aria-pressed', 'false');
            }

            dayButton.addEventListener('click', () => {
                selectedDate = dateString;
                dateInput.value = dateString;

                selectedLabel.textContent =
                    'Selected: ' +
                    new Date(year, month, day).toLocaleDateString(
                        'en-US',
                        {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        }
                    );

                renderCalendar();
            });

            daysContainer.appendChild(dayButton);
        }

        previousButton.disabled =
            displayedMonth.getFullYear() === earliestDate.getFullYear() &&
            displayedMonth.getMonth() === earliestDate.getMonth();

        previousButton.classList.toggle(
            'is-disabled',
            previousButton.disabled
        );
    };

    previousButton.addEventListener('click', () => {
        if (previousButton.disabled) return;

        displayedMonth = new Date(
            displayedMonth.getFullYear(),
            displayedMonth.getMonth() - 1,
            1
        );

        renderCalendar();
    });

    nextButton.addEventListener('click', () => {
        displayedMonth = new Date(
            displayedMonth.getFullYear(),
            displayedMonth.getMonth() + 1,
            1
        );

        renderCalendar();
    });

    const reset = () => {
        selectedDate = '';
        dateInput.value = '';
        displayedMonth = new Date(earliestDate);
        selectedLabel.textContent = 'Please select a date.';
        renderCalendar();
    };

    renderCalendar();

    return { reset };
}
