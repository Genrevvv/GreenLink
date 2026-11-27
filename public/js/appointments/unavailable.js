import { emptyUnavailablePeriodsModal, unavailablePeriodCardModal } from './modal.js';
import { getLocalToday } from './calendar.js';
import { createNotificationElement } from '../utils/notification/notification.js';
import * as api from './api.js';

// ADMIN: UNAVAILABLE DATES AND TIMES
// Whole dates or time periods when the farm takes no visits. The booking form
// and the backend both treat these as unavailable.
export async function initUnavailablePeriods() {
    const form = document.querySelector('#unavailable-form');
    const dateInput = document.querySelector('#unavailable-date');
    const wholeDayInput = document.querySelector('#unavailable-whole-day');
    const timesContainer = document.querySelector('#unavailable-times');
    const startInput = document.querySelector('#unavailable-start-time');
    const endInput = document.querySelector('#unavailable-end-time');
    const reasonInput = document.querySelector('#unavailable-reason');
    const submitButton = document.querySelector('#unavailable-submit-btn');
    const message = document.querySelector('#unavailable-form-message');
    const list = document.querySelector('#unavailable-list');

    if (!form || !dateInput || !wholeDayInput || !startInput || !endInput || !list) {
        return;
    }

    let periods = [];

    dateInput.min = getLocalToday();

    const toggleTimes = () => {
        timesContainer?.classList.toggle('hidden', wholeDayInput.checked);
        startInput.required = !wholeDayInput.checked;
        endInput.required = !wholeDayInput.checked;
    };

    wholeDayInput.onchange = toggleTimes;
    toggleTimes();

    const render = () => {
        periods.sort((a, b) =>
            a.date.localeCompare(b.date) ||
            String(a.startTime ?? '').localeCompare(String(b.startTime ?? ''))
        );

        list.innerHTML = periods.length > 0
            ? periods.map(unavailablePeriodCardModal).join('')
            : emptyUnavailablePeriodsModal();
    };

    form.onsubmit = async event => {
        event.preventDefault();

        const periodData = {
            date: dateInput.value,
            wholeDay: wholeDayInput.checked,
            startTime: wholeDayInput.checked ? null : startInput.value,
            endTime: wholeDayInput.checked ? null : endInput.value,
            reason: reasonInput ? reasonInput.value.trim() : ''
        };

        const validationError = validatePeriod(periodData);

        if (validationError) {
            showMessage(message, validationError, false);
            return;
        }

        if (submitButton) submitButton.disabled = true;

        let data;

        try {
            data = await api.addUnavailablePeriod(periodData);
        } catch (error) {
            console.error('Failed to save unavailable period:', error);
            data = { success: false };
        } finally {
            if (submitButton) submitButton.disabled = false;
        }

        if (!data.success) {
            showMessage(message, data.message ?? 'Failed to save the unavailable period.', false);
            return;
        }

        periods.push(data.period);
        render();

        form.reset();
        toggleTimes();
        showMessage(message, data.message, true);
    };

    list.onclick = async event => {
        const deleteButton = event.target.closest('[data-delete-period-id]');

        if (!deleteButton || !confirm('Remove this unavailable period? The time will be open for booking again.')) return;

        const id = Number(deleteButton.dataset.deletePeriodId);
        deleteButton.disabled = true;

        let data;

        try {
            data = await api.deleteUnavailablePeriod(id);
        } catch (error) {
            console.error('Failed to remove unavailable period:', error);
            data = { success: false };
        }

        if (!data.success) {
            deleteButton.disabled = false;

            createNotificationElement({
                status: 'failed',
                message: data.message ?? 'Failed to remove the unavailable period'
            });
            return;
        }

        periods = periods.filter(period => period.id !== id);
        render();

        createNotificationElement({
            status: 'success',
            message: 'Unavailable period removed'
        });
    };

    try {
        const periodsData = await api.fetchUnavailablePeriods();

        periods = periodsData.success ? periodsData.periods : [];
    } catch (error) {
        console.error('Failed to load unavailable periods:', error);
    }

    render();
}

function validatePeriod(periodData) {
    if (!periodData.date || periodData.date < getLocalToday()) {
        return 'Please select today or a future date.';
    }

    if (!periodData.wholeDay && (!periodData.startTime || !periodData.endTime)) {
        return 'Please enter a start and end time, or mark the whole day.';
    }

    if (!periodData.wholeDay && periodData.endTime <= periodData.startTime) {
        return 'The end time must be later than the start time.';
    }

    return '';
}

// Tells the admin which scheduling values are still unset in the database.
function showMessage(message, text, isSuccess) {
    if (message) {
        message.textContent = text;
        message.classList.remove('hidden', 'is-success', 'is-error');
        message.classList.add(isSuccess ? 'is-success' : 'is-error');
    }

    createNotificationElement({
        status: isSuccess ? 'success' : 'failed',
        message: text
    });
}
