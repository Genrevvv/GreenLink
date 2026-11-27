import {
    calendarDayTooltipModal,
    emptyUserAppointmentsModal,
    userAppointmentCardModal
} from './modal.js';
import { initAppointmentCalendar, getLocalToday } from './calendar.js';
import { getSelectedStatus, initStatusFilter, matchesStatusFilter } from './filter.js';
import {
    checkRange,
    describeTypeRule,
    durationLabels,
    formatTime,
    formatTimeRange,
    getConfiguredTypes,
    getEndCandidates,
    getScheduledForDate,
    getStartCandidates,
    getTypeRule,
    hasAvailableRange,
    minutesToTime,
    scheduling,
    setSchedule,
    toMinutes
} from './schedule.js';
import { createNotificationElement } from '../utils/notification/notification.js';
import * as api from './api.js';

const STATUS_FILTER = '#filter-user-appointment-status';

const unavailableLabels = {
    passed: 'Time has passed',
    notice: 'Too soon',
    day: 'Not offered this day',
    unavailable: 'Unavailable',
    full: 'Fully booked',
    visitors: 'Too many visitors',
    'too-short': 'Too short',
    'too-long': 'Too long'
};

// USER APPOINTMENTS
export function initUserAppointments(userAppointmentsData, targetId = null) {
    const form = document.querySelector('#appointment-booking-form');
    const dateInput = document.querySelector('#appointment-date');
    const startInput = document.querySelector('#appointment-start-time');
    const endInput = document.querySelector('#appointment-end-time');
    const purposeInput = document.querySelector('#appointment-purpose');
    const visitorsInput = document.querySelector('#appointment-visitors');
    const notesInput = document.querySelector('#appointment-notes');
    const appointmentsList = document.querySelector('#user-appointments-list');
    const submitButton = document.querySelector('#submit-appointment-btn');
    const message = document.querySelector('#appointment-form-message');

    if (
        !form ||
        !dateInput ||
        !startInput ||
        !endInput ||
        !purposeInput ||
        !visitorsInput ||
        !appointmentsList
    ) {
        return;
    }

    const inputs = { form, dateInput, startInput, endInput, purposeInput, visitorsInput, notesInput, submitButton, message };

    // The appointment being moved to a new date and time (null while booking a new one).
    let rescheduling = null;
    inputs.getExcludeId = () => rescheduling?.id ?? null;

    const calendar = initAppointmentCalendar(dateInput, {
        getDateInfo: date => getDateInfo(date, purposeInput.value, inputs.getExcludeId()),
        getDayTooltip: date => getDayTooltip(date, userAppointmentsData),
        isOwnAppointmentDate: date => userAppointmentsData.some(appointment =>
            appointment.date === date && appointment.status !== 'Cancelled'
        ),
        onSelect: () => {
            hideUserAppointmentMessage(message);
            updateStartOptions(inputs);
        }
    });
    inputs.calendar = calendar;

    purposeInput.onchange = () => {
        hideUserAppointmentMessage(message);
        updateRuleInfo(inputs);
        calendar.refresh();
        updateStartOptions(inputs);
    };

    // End Time always comes after Start Time, so its options follow the start.
    startInput.onchange = () => {
        hideUserAppointmentMessage(message);
        updateEndOptions(inputs);
    };

    endInput.onchange = () => {
        hideUserAppointmentMessage(message);
    };

    // Visitor count affects capacity, so the time options are rechecked.
    visitorsInput.oninput = () => {
        hideUserAppointmentMessage(message);
        updateStartOptions(inputs);
    };

    applySchedulingState(inputs);

    // Register the submit handler only once per form.
    if (form.dataset.appointmentHandlerAttached !== 'true') {
        form.dataset.appointmentHandlerAttached = 'true';

        form.addEventListener('submit', async (event) => {
            // Stop the browser's default form submission and page reload.
            event.preventDefault();

            const date = dateInput.value;
            const purpose = purposeInput.value;
            const visitors = Number(visitorsInput.value);
            const notes = notesInput ? notesInput.value.trim() : '';
            const start = startInput.value === '' ? null : Number(startInput.value);
            const end = endInput.value === '' ? null : Number(endInput.value);

            const validationError = validateAppointment(date, start, end, purpose, visitors, inputs.getExcludeId());

            if (validationError) {
                showUserAppointmentError(message, validationError);
                return;
            }

            const appointmentData = {
                date,
                startTime: minutesToTime(start),
                endTime: minutesToTime(end),
                purpose,
                visitors,
                notes
            };

            setSubmitting(submitButton, true, Boolean(rescheduling));

            let data;

            try {
                data = rescheduling
                    ? await api.rescheduleAppointment({
                        id: rescheduling.id,
                        date,
                        startTime: appointmentData.startTime,
                        endTime: appointmentData.endTime
                    })
                    : await api.addAppointment(appointmentData);
            } catch (error) {
                console.error('Failed to save appointment:', error);
                data = { success: false };
            } finally {
                setSubmitting(submitButton, false, Boolean(rescheduling));
            }

            if (!data.success) {
                showUserAppointmentError(
                    message,
                    data.message ?? 'Failed to save the appointment.'
                );

                // Someone else may have booked the time; reload the schedule.
                await reloadSchedule(inputs);
                return;
            }

            if (rescheduling) {
                Object.assign(rescheduling, {
                    date: data.date,
                    time: data.time,
                    endTime: data.endTime,
                    duration: data.duration,
                    status: data.status
                });
            } else {
                userAppointmentsData.push({
                    id: data.id,
                    date,
                    time: data.time,
                    endTime: data.endTime,
                    duration: data.duration,
                    purpose,
                    visitors,
                    notes,
                    status: 'Pending'
                });
            }

            const successMessage = rescheduling ? 'Appointment rescheduled' : 'Appointment request submitted';

            stopRescheduling();
            await reloadSchedule(inputs);
            renderUserAppointments(userAppointmentsData);

            createNotificationElement({
                status: 'success',
                message: successMessage
            });
        });
    }

    function startRescheduling(appointment) {
        rescheduling = appointment;

        form.reset();
        purposeInput.value = appointment.purpose;
        visitorsInput.value = appointment.visitors;
        if (notesInput) notesInput.value = appointment.notes ?? '';

        // Only the date and time can change when rescheduling.
        purposeInput.disabled = true;
        visitorsInput.disabled = true;
        if (notesInput) notesInput.disabled = true;

        setRescheduleBanner(appointment);
        setSubmitting(submitButton, false, true);
        hideUserAppointmentMessage(message);
        calendar.reset();
        updateRuleInfo(inputs);
        updateStartOptions(inputs);
        form.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }

    function stopRescheduling() {
        rescheduling = null;

        purposeInput.disabled = false;
        visitorsInput.disabled = false;
        if (notesInput) notesInput.disabled = false;

        form.reset();
        setRescheduleBanner(null);
        setSubmitting(submitButton, false, false);
        hideUserAppointmentMessage(message);
        calendar.reset();
        updateRuleInfo(inputs);
        updateStartOptions(inputs);
    }

    const cancelRescheduleButton = document.querySelector('#cancel-reschedule-btn');
    if (cancelRescheduleButton) cancelRescheduleButton.onclick = stopRescheduling;

    // Cancel and reschedule buttons on the appointment cards
    appointmentsList.onclick = event => {
        const cancelButton = event.target.closest('[data-cancel-id]');
        const rescheduleButton = event.target.closest('[data-reschedule-id]');

        if (rescheduleButton) {
            const appointment = userAppointmentsData.find(
                item => item.id === Number(rescheduleButton.dataset.rescheduleId)
            );

            if (appointment) startRescheduling(appointment);
            return;
        }

        if (!cancelButton) return;

        cancelUserAppointment(
            Number(cancelButton.dataset.cancelId),
            cancelButton,
            userAppointmentsData,
            inputs,
            () => {
                if (rescheduling?.id === Number(cancelButton.dataset.cancelId)) stopRescheduling();
            }
        );
    };

    initStatusFilter(STATUS_FILTER, () => {
        renderUserAppointments(userAppointmentsData);
    });

    const statusFilter = document.querySelector(STATUS_FILTER);
    if (targetId && statusFilter) {
        statusFilter.value = 'all';
    }

    renderUserAppointments(userAppointmentsData, targetId);
}

function renderUserAppointments(userAppointmentsData, targetId = null) {
    const appointmentsList = document.querySelector('#user-appointments-list');

    if (!appointmentsList) {
        return;
    }

    const localToday = getLocalToday();
    const selectedStatus = getSelectedStatus(STATUS_FILTER);

    const upcomingAppointments = userAppointmentsData
        .filter(appointment => appointment.date >= localToday || appointment.id === Number(targetId))
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
        .map(appointment => userAppointmentCardModal(appointment, scheduling.configured))
        .join('');

    if (targetId) {
        const target = appointmentsList.querySelector(
            `[data-appointment-id="${Number(targetId)}"]`
        );
        target?.classList.add('notification-target');
        target?.scrollIntoView({ block: 'center' });
    }
}

// CANCEL APPOINTMENT (kept as a Cancelled record)
async function cancelUserAppointment(id, button, userAppointmentsData, inputs, onCancelled) {
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
    onCancelled();

    await reloadSchedule(inputs);
    renderUserAppointments(userAppointmentsData);

    createNotificationElement({
        status: 'success',
        message: 'Appointment cancelled'
    });
}

// The server is the source of truth for bookings, so the schedule is reloaded after every change.
async function reloadSchedule(inputs) {
    try {
        const scheduleData = await api.fetchSchedule();

        if (scheduleData.success) {
            setSchedule(scheduleData);
        }
    } catch (error) {
        console.error('Failed to reload appointment schedule:', error);
    }

    applySchedulingState(inputs);
}

// SCHEDULING STATE: purposes, rule hints and the "not configured" notice
function applySchedulingState(inputs) {
    const notice = document.querySelector('#appointment-schedule-notice');
    const types = getConfiguredTypes();
    const isReady = types.length > 0;

    if (notice) {
        notice.textContent = isReady
            ? ''
            : (scheduling.message || 'Appointment scheduling has not been configured yet. Please contact the farm.');
        notice.classList.toggle('hidden', isReady);
    }

    inputs.form.classList.toggle('hidden', !isReady);

    // Purposes come from the appointment type rules. Keep the current choice when it still exists.
    const currentPurpose = inputs.purposeInput.value;

    inputs.purposeInput.innerHTML = '<option value="">Select a purpose</option>';

    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type.purpose;
        option.textContent = type.purpose;
        inputs.purposeInput.appendChild(option);
    });

    if (types.some(type => type.purpose === currentPurpose)) {
        inputs.purposeInput.value = currentPurpose;
    }

    updateRuleInfo(inputs);
    inputs.calendar.refresh();
    updateStartOptions(inputs);
}

function updateRuleInfo(inputs) {
    const durationInfo = document.querySelector('#appointment-duration-info');
    const visitorsInfo = document.querySelector('#appointment-visitors-info');
    const rule = getTypeRule(inputs.purposeInput.value);
    const capacity = scheduling.settings?.visitorCapacity;

    if (durationInfo) {
        durationInfo.textContent = rule
            ? describeTypeRule(rule)
            : 'Select a purpose to see its booking rules.';
    }

    if (rule) {
        const maxVisitors = Math.min(rule.maxVisitors, capacity ?? rule.maxVisitors);
        inputs.visitorsInput.max = maxVisitors;

        if (visitorsInfo) visitorsInfo.textContent = `Maximum of ${maxVisitors} visitors for ${rule.purpose}.`;
    } else {
        inputs.visitorsInput.removeAttribute('max');

        if (visitorsInfo) visitorsInfo.textContent = 'Select a purpose to see the visitor limit.';
    }
}

// START TIME options for the selected date and purpose.
// A start is open when at least one end time after it can be booked.
function updateStartOptions(inputs) {
    const { dateInput, startInput, purposeInput } = inputs;
    const timeInfo = document.querySelector('#appointment-time-info');
    const date = dateInput.value;
    const purpose = purposeInput.value;
    const visitors = getVisitorCount(inputs);
    const previousStart = startInput.value;

    startInput.innerHTML = '<option value="">Select a start time</option>';

    let availableCount = 0;

    if (date && purpose) {
        getStartCandidates(purpose).forEach(start => {
            const problems = getEndCandidates(purpose, start).map(({ end }) =>
                checkRange(date, start, end, purpose, visitors, inputs.getExcludeId())
            );
            const isAvailable = problems.some(problem => !problem);

            startInput.appendChild(createTimeOption(start, isAvailable, problems.find(Boolean)?.code));

            if (isAvailable) availableCount++;
        });
    }

    if (previousStart && startInput.querySelector(`option[value="${previousStart}"]:not(:disabled)`)) {
        startInput.value = previousStart;
    }

    updateEndOptions(inputs);

    if (!timeInfo) return;

    if (!date || !purpose) {
        timeInfo.textContent = 'Select a date and purpose to see available times.';
    } else if (availableCount === 0) {
        timeInfo.textContent = `No available times for a ${purpose} on this date. Please choose another date.`;
    } else {
        timeInfo.textContent = `${availableCount} start time${availableCount === 1 ? '' : 's'} available. Pick a start time to see the end times.`;
    }
}

// END TIME options: only times after the selected start that match an allowed duration.
function updateEndOptions(inputs) {
    const { dateInput, startInput, endInput, purposeInput } = inputs;
    const date = dateInput.value;
    const purpose = purposeInput.value;
    const visitors = getVisitorCount(inputs);
    const previousEnd = endInput.value;

    endInput.innerHTML = '<option value="">Select an end time</option>';

    if (!startInput.value) {
        endInput.disabled = true;
        return;
    }

    endInput.disabled = false;

    const start = Number(startInput.value);

    getEndCandidates(purpose, start).forEach(({ end, durationType }) => {
        const problem = checkRange(date, start, end, purpose, visitors, inputs.getExcludeId());
        const suffix = durationType === 'hourly' ? '' : ` (${durationLabels[durationType]})`;

        endInput.appendChild(createTimeOption(end, !problem, problem?.code, suffix));
    });

    if (previousEnd && endInput.querySelector(`option[value="${previousEnd}"]:not(:disabled)`)) {
        endInput.value = previousEnd;
    }
}

function createTimeOption(minutes, isAvailable, reasonCode, suffix = '') {
    const option = document.createElement('option');

    option.value = String(minutes);
    option.disabled = !isAvailable;
    option.textContent = isAvailable
        ? `${formatTime(minutes)}${suffix}`
        : `${formatTime(minutes)}${suffix} (${unavailableLabels[reasonCode] ?? 'Unavailable'})`;

    return option;
}

function getVisitorCount(inputs) {
    const visitors = Number(inputs.visitorsInput.value);

    return Number.isInteger(visitors) && visitors > 0 ? visitors : 1;
}

// BOOKING RULES (the backend checks the same rules again)
function validateAppointment(date, start, end, purpose, visitors, excludeId) {
    if (!date || date < getLocalToday()) {
        return 'Please select today or a future date.';
    }

    if (!purpose) {
        return 'Please select a visit purpose.';
    }

    if (start === null) {
        return 'Please select a start time.';
    }

    if (end === null) {
        return 'Please select an end time.';
    }

    if (!Number.isInteger(visitors) || visitors < 1) {
        return 'Please enter a valid number of visitors.';
    }

    return checkRange(date, start, end, purpose, visitors, excludeId)?.message ?? '';
}

// Calendar indicator data for one date.
function getDateInfo(date, purpose, excludeId) {
    if (!scheduling.configured) return null;

    const scheduled = getScheduledForDate(date).filter(item => item.id !== excludeId);
    const unavailablePeriods = scheduling.unavailable.filter(period => period.date === date);
    const isFull = !hasAvailableRange(date, purpose, 1, excludeId);

    if (scheduled.length === 0 && !isFull && unavailablePeriods.length === 0) {
        return null;
    }

    const bookedTimes = scheduled
        .map(item => `${formatTime(toMinutes(item.startTime))} - ${formatTime(toMinutes(item.endTime))}`)
        .join(', ');

    let title = scheduled.length === 1
        ? `1 scheduled appointment: ${bookedTimes}`
        : scheduled.length > 1
            ? `${scheduled.length} scheduled appointments: ${bookedTimes}`
            : '';

    if (isFull) {
        title = purpose
            ? `Not available for a ${purpose}`
            : 'No available times on this date';
    }

    if (unavailablePeriods.length > 0) {
        const unavailableSummary = unavailablePeriods.map(period => {
            const timeRange = period.startTime && period.endTime
                ? `${formatTime(toMinutes(period.startTime))} - ${formatTime(toMinutes(period.endTime))}`
                : 'all day';
            const reason = String(period.reason ?? '').trim();

            return `${timeRange}${reason ? `: ${reason}` : ''}`;
        }).join('; ');

        title = [title, `Unavailable: ${unavailableSummary}`].filter(Boolean).join('. ');
    }

    return {
        count: scheduled.length,
        isFull,
        title,
        classes: unavailablePeriods.length > 0 ? ['has-unavailable'] : []
    };
}

// Includes the signed-in user's appointments and any admin-blocked times.
function getDayTooltip(date, userAppointmentsData) {
    const ownAppointments = userAppointmentsData
        .filter(appointment =>
            appointment.date === date &&
            appointment.status !== 'Cancelled'
        )
        .sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
    const unavailablePeriods = scheduling.unavailable.filter(period => period.date === date);

    return calendarDayTooltipModal(date, ownAppointments, { unavailablePeriods });
}

function setRescheduleBanner(appointment) {
    const banner = document.querySelector('#appointment-reschedule-banner');
    const text = document.querySelector('#appointment-reschedule-text');

    if (!banner) return;

    banner.classList.toggle('hidden', !appointment);

    if (text) {
        text.textContent = appointment
            ? `Rescheduling your ${appointment.purpose} on ${appointment.date} (${formatTimeRange(appointment)}). Pick a new date and time.`
            : '';
    }
}

function setSubmitting(submitButton, isSubmitting, isRescheduling) {
    if (!submitButton) return;

    submitButton.disabled = isSubmitting;

    if (isRescheduling) {
        submitButton.textContent = isSubmitting ? 'Saving...' : 'Save New Schedule';
    } else {
        submitButton.textContent = isSubmitting ? 'Submitting...' : 'Submit Appointment Request';
    }
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
