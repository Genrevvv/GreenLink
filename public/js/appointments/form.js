import {
    calendarDayTooltipModal,
    emptyUserAppointmentsModal,
    userAppointmentCardModal
} from './modal.js';
import { initAppointmentCalendar, getLocalToday } from './calendar.js';
import { getSelectedStatus, initStatusFilter, matchesStatusFilter } from './filter.js';
import {
    addScheduledAppointment,
    countAvailableSlots,
    formatDuration,
    formatTimeRange,
    getNowMinutes,
    getPurposeDuration,
    getScheduledForDate,
    getSlotAvailability,
    removeScheduledAppointment,
    scheduleSettings,
    setSchedule,
    toMinutes
} from './schedule.js';
import { createNotificationElement } from '../utils/notification/notification.js';
import * as api from './api.js';

const STATUS_FILTER = '#filter-user-appointment-status';

const unavailableLabels = {
    passed: 'Time has passed',
    booked: 'Already booked',
    'too-long': 'Too late for this visit'
};

// USER APPOINTMENTS
export function initUserAppointments(userAppointmentsData) {
    const form = document.querySelector('#appointment-booking-form');
    const dateInput = document.querySelector('#appointment-date');
    const timeInput = document.querySelector('#appointment-time');
    const purposeInput = document.querySelector('#appointment-purpose');
    const visitorsInput = document.querySelector('#appointment-visitors');
    const notesInput = document.querySelector('#appointment-notes');
    const appointmentsList = document.querySelector('#user-appointments-list');
    const submitButton = document.querySelector('#submit-appointment-btn');
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

    setupVisitorLimit(visitorsInput);

    const calendar = initAppointmentCalendar(dateInput, {
        getDateInfo,
        getDayTooltip: date => getOwnDayTooltip(date, userAppointmentsData),
        onSelect: () => {
            hideUserAppointmentMessage(message);
            updateTimeSlots(dateInput, timeInput, purposeInput);
        }
    });

    purposeInput.onchange = () => {
        hideUserAppointmentMessage(message);
        updateDurationInfo(purposeInput);
        updateTimeSlots(dateInput, timeInput, purposeInput);
    };

    timeInput.onchange = () => {
        hideUserAppointmentMessage(message);
    };

    updateDurationInfo(purposeInput);
    updateTimeSlots(dateInput, timeInput, purposeInput);

    // Register the submit handler only once per form.
    if (form.dataset.appointmentHandlerAttached !== 'true') {
        form.dataset.appointmentHandlerAttached = 'true';

        form.addEventListener('submit', async (event) => {
            // Stop the browser's default form submission and page reload.
            event.preventDefault();

            const date = dateInput.value;
            const time = timeInput.value;
            const purpose = purposeInput.value;
            const visitors = Number(visitorsInput.value);
            const notes = notesInput ? notesInput.value.trim() : '';

            const validationError = validateAppointment(date, time, purpose, visitors);

            if (validationError) {
                showUserAppointmentError(message, validationError);
                return;
            }

            const appointmentData = {
                date,
                time,
                purpose,
                visitors,
                notes
            };

            setSubmitting(submitButton, true);

            let data;

            try {
                data = await api.addAppointment(appointmentData);
            } catch (error) {
                console.error('Failed to submit appointment:', error);
                data = { success: false };
            } finally {
                setSubmitting(submitButton, false);
            }

            if (!data.success) {
                showUserAppointmentError(
                    message,
                    data.message ?? 'Failed to submit appointment request.'
                );

                // Someone else may have booked the slot; reload the schedule.
                await reloadSchedule(calendar);
                updateTimeSlots(dateInput, timeInput, purposeInput);
                return;
            }

            const newAppointment = {
                id: data.id,
                ...appointmentData,
                duration: data.duration ?? getPurposeDuration(purpose),
                endTime: data.endTime ?? '',
                status: 'Pending'
            };

            userAppointmentsData.push(newAppointment);
            addScheduledAppointment(newAppointment);

            form.reset();
            calendar.reset();
            updateDurationInfo(purposeInput);
            updateTimeSlots(dateInput, timeInput, purposeInput);
            hideUserAppointmentMessage(message);

            renderUserAppointments(userAppointmentsData);

            createNotificationElement({
                status: 'success',
                message: 'Appointment request submitted'
            });
        });
    }

    // Cancel buttons on the appointment cards
    appointmentsList.onclick = event => {
        const cancelButton = event.target.closest('[data-cancel-id]');

        if (!cancelButton) return;

        cancelUserAppointment(
            Number(cancelButton.dataset.cancelId),
            cancelButton,
            userAppointmentsData,
            calendar,
            { dateInput, timeInput, purposeInput }
        );
    };

    initStatusFilter(STATUS_FILTER, () => {
        renderUserAppointments(userAppointmentsData);
    });

    renderUserAppointments(userAppointmentsData);
}

function renderUserAppointments(userAppointmentsData) {
    const appointmentsList = document.querySelector('#user-appointments-list');

    if (!appointmentsList) {
        return;
    }

    const localToday = getLocalToday();
    const selectedStatus = getSelectedStatus(STATUS_FILTER);

    const upcomingAppointments = userAppointmentsData
        .filter(appointment => appointment.date >= localToday)
        .sort((a, b) =>
            a.date.localeCompare(b.date) ||
            toMinutes(a.time) - toMinutes(b.time)
        );

    const visibleAppointments = upcomingAppointments.filter(appointment =>
        matchesStatusFilter(appointment, selectedStatus)
    );

    if (visibleAppointments.length === 0) {
        appointmentsList.innerHTML = emptyUserAppointmentsModal(upcomingAppointments.length > 0);
        return;
    }

    appointmentsList.innerHTML = visibleAppointments
        .map(appointment => userAppointmentCardModal(appointment))
        .join('');
}

// CANCEL APPOINTMENT (kept as a Cancelled record)
async function cancelUserAppointment(id, button, userAppointmentsData, calendar, inputs) {
    const appointment = userAppointmentsData.find(item => item.id === id);

    if (!appointment) return;

    const confirmed = confirm(
        `Cancel your ${appointment.purpose} on ${appointment.date} at ${appointment.time}?`
    );

    if (!confirmed) return;

    button.disabled = true;

    let data;

    try {
        data = await api.cancelAppointment(id);
    } catch (error) {
        console.error('Failed to cancel appointment:', error);
        data = { success: false };
    }

    if (!data.success) {
        button.disabled = false;

        createNotificationElement({
            status: 'failed',
            message: data.message ?? 'Failed to cancel appointment'
        });
        return;
    }

    appointment.status = 'Cancelled';
    removeScheduledAppointment(appointment);

    renderUserAppointments(userAppointmentsData);
    calendar.refresh();
    updateTimeSlots(inputs.dateInput, inputs.timeInput, inputs.purposeInput);

    createNotificationElement({
        status: 'success',
        message: 'Appointment cancelled'
    });
}

async function reloadSchedule(calendar) {
    try {
        const scheduleData = await api.fetchSchedule();

        if (scheduleData.success) {
            setSchedule(scheduleData);
            calendar.refresh();
        }
    } catch (error) {
        console.error('Failed to reload appointment schedule:', error);
    }
}

// BOOKING RULES
function validateAppointment(date, time, purpose, visitors) {
    if (!date || date < getLocalToday()) {
        return 'Please select today or a future date.';
    }

    if (!purpose) {
        return 'Please select a visit purpose.';
    }

    if (!time) {
        return 'Please select a time slot.';
    }

    if (!Number.isInteger(visitors) || visitors < 1) {
        return 'Please enter a valid number of visitors.';
    }

    if (visitors > scheduleSettings.maxVisitors) {
        return `A maximum of ${scheduleSettings.maxVisitors} visitors is allowed per appointment.`;
    }

    const availability = getSlotAvailability(
        date,
        time,
        getPurposeDuration(purpose),
        getLocalToday(),
        getNowMinutes()
    );

    if (availability.reason === 'passed') {
        return 'The selected time has already passed. Please choose a later time slot.';
    }

    if (availability.reason === 'too-long') {
        return `${purpose} takes about ${formatDuration(getPurposeDuration(purpose))}, so it cannot start at ${time}. Visits must end by 12:00 PM (lunch break) or 5:00 PM.`;
    }

    if (availability.reason === 'booked') {
        return 'The selected time overlaps with an already scheduled appointment. Please choose another time slot.';
    }

    return '';
}

// Calendar indicator data for one date.
function getDateInfo(date) {
    const scheduled = getScheduledForDate(date);
    const isFull = countAvailableSlots(date, getLocalToday(), getNowMinutes()) === 0;

    if (scheduled.length === 0 && !isFull) {
        return null;
    }

    const bookedTimes = scheduled.map(formatTimeRange).join(', ');

    let title = scheduled.length === 1
        ? `1 scheduled appointment: ${bookedTimes}`
        : `${scheduled.length} scheduled appointments: ${bookedTimes}`;

    if (isFull) {
        title = scheduled.length > 0
            ? `Fully booked (${bookedTimes})`
            : 'No available time slots left';
    }

    return {
        count: scheduled.length,
        isFull,
        title
    };
}

// Hover card for a date: only the signed-in user's own appointments
// (the list comes from /appointments/user). Cancelled ones are left out.
function getOwnDayTooltip(date, userAppointmentsData) {
    const ownAppointments = userAppointmentsData
        .filter(appointment =>
            appointment.date === date &&
            appointment.status !== 'Cancelled'
        )
        .sort((a, b) => toMinutes(a.time) - toMinutes(b.time));

    return ownAppointments.length > 0
        ? calendarDayTooltipModal(date, ownAppointments)
        : '';
}

// Marks time options that cannot be booked for the selected date and purpose.
function updateTimeSlots(dateInput, timeInput, purposeInput) {
    const timeInfo = document.querySelector('#appointment-time-info');
    const date = dateInput.value;
    const purpose = purposeInput.value;
    const duration = getPurposeDuration(purpose);
    const today = getLocalToday();
    const nowMinutes = getNowMinutes();

    let availableCount = 0;

    [...timeInput.options].forEach(option => {
        if (!option.value) return;

        option.dataset.label ??= option.textContent;

        if (!date) {
            option.disabled = false;
            option.textContent = option.dataset.label;
            return;
        }

        const availability = getSlotAvailability(date, option.value, duration, today, nowMinutes);

        option.disabled = !availability.available;
        option.textContent = availability.available
            ? option.dataset.label
            : `${option.dataset.label} (${unavailableLabels[availability.reason]})`;

        if (availability.available) availableCount++;
    });

    if (timeInput.selectedOptions[0]?.disabled) {
        timeInput.value = '';
    }

    if (!timeInfo) return;

    if (!date) {
        timeInfo.textContent = 'Select a date to see available time slots.';
    } else if (availableCount === 0) {
        timeInfo.textContent = purpose
            ? `No available time slots for a ${purpose} on this date. Please choose another date.`
            : 'No available time slots on this date. Please choose another date.';
    } else {
        timeInfo.textContent = `${availableCount} time slot${availableCount === 1 ? '' : 's'} available on this date.`;
    }
}

function updateDurationInfo(purposeInput) {
    const durationInfo = document.querySelector('#appointment-duration-info');

    if (!durationInfo) return;

    durationInfo.textContent = purposeInput.value
        ? `Estimated duration: about ${formatDuration(getPurposeDuration(purposeInput.value))}.`
        : 'Each visit purpose has an estimated duration.';
}

function setupVisitorLimit(visitorsInput) {
    const visitorsInfo = document.querySelector('#appointment-visitors-info');

    visitorsInput.max = scheduleSettings.maxVisitors;

    if (visitorsInfo) {
        visitorsInfo.textContent = `Maximum of ${scheduleSettings.maxVisitors} visitors per appointment.`;
    }
}

function setSubmitting(submitButton, isSubmitting) {
    if (!submitButton) return;

    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting
        ? 'Submitting...'
        : 'Submit Appointment Request';
}

// Inline error under the form plus a notification.
function showUserAppointmentError(message, text) {
    if (message) {
        message.textContent = text;
        message.classList.remove('hidden', 'is-success');
        message.classList.add('is-error');
    }

    createNotificationElement({
        status: 'failed',
        message: text
    });
}

function hideUserAppointmentMessage(message) {
    if (!message) return;

    message.textContent = '';
    message.classList.add('hidden');
}
