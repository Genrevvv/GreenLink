import { createNotificationElement } from '../utils/notification/notification.js';
import * as api from './api.js';

const durationOptions = [
    { value: 'hourly', label: 'By the hour' },
    { value: 'half_day', label: 'Half day' },
    { value: 'whole_day', label: 'Full day' }
];

const weekdayOptions = [
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
    { value: 7, label: 'Sun' }
];

const weekdayNames = {
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
    7: 'Sunday'
};

let nextTypeDetailsId = 0;

export async function initSchedulingSettings() {
    const form = document.querySelector('#booking-settings-form');
    const typeContainer = document.querySelector('#booking-type-settings');

    if (!form || !typeContainer) return;

    const openTimeInput = document.querySelector('#booking-open-time');
    const closeTimeInput = document.querySelector('#booking-close-time');
    const slotIntervalInput = document.querySelector('#booking-slot-interval');
    const capacityInput = document.querySelector('#booking-visitor-capacity');
    const halfDayField = document.querySelector('#booking-half-day-field');
    const halfDaySplitInput = document.querySelector('#booking-half-day-split');
    const submitButton = document.querySelector('#booking-settings-submit');
    const addTypeInput = document.querySelector('#booking-new-type-name');
    const addTypeButton = document.querySelector('#booking-add-type-btn');

    addTypeButton.onclick = async () => {
        const purpose = addTypeInput.value.trim();

        if (!purpose) {
            notify('Enter a name for the visit type.', false);
            addTypeInput.focus();
            return;
        }

        addTypeButton.disabled = true;

        try {
            const response = await api.addVisitType(purpose);

            if (!response.success) {
                notify(response.message ?? 'Could not add the visit type.', false);
                return;
            }

            const type = {
                purpose: response.purpose,
                isActive: false,
                allowedDurations: [],
                allowedDays: [],
                minAdvanceHours: null,
                maxVisitors: null
            };
            typeContainer.querySelector('.booking-types-empty')?.remove();
            typeContainer.insertAdjacentHTML(
                'beforeend',
                renderTypeCard(type, Number(capacityInput.value) || null)
            );
            const addedCard = typeContainer.lastElementChild;
            setTypeEnabled(addedCard, false);
            addedCard.querySelector('[data-type-status]').textContent = 'Not set up';
            setTypeExpanded(addedCard, true);
            addTypeInput.value = '';
            notify(response.message, true);
        } catch (error) {
            console.error('Failed to add visit type:', error);
            notify('Could not add the visit type. Please try again.', false);
        } finally {
            addTypeButton.disabled = false;
        }
    };

    form.onsubmit = async event => {
        event.preventDefault();
        updateHalfDayField(typeContainer, halfDayField, halfDaySplitInput);

        const emptyNameCard = [...typeContainer.querySelectorAll('[data-type-card]')]
            .find(card => !card.querySelector('[data-purpose-name]').value.trim());

        if (emptyNameCard) {
            setTypeExpanded(emptyNameCard, true);
            emptyNameCard.querySelector('[data-purpose-name]').focus();
            notify('Enter a name for each visit type.', false);
            return;
        }

        if (!form.reportValidity()) return;

        const visitorCapacity = Number(capacityInput.value);
        const types = [...typeContainer.querySelectorAll('[data-type-card]')].map(card => {
            const enabled = card.querySelector('[data-type-enabled]').checked;

            return {
                originalPurpose: card.dataset.purpose,
                purpose: card.querySelector('[data-purpose-name]').value.trim(),
                enabled,
                allowedDurations: enabled
                    ? [...card.querySelectorAll('[data-duration]:checked')].map(input => input.dataset.duration)
                    : [],
                allowedDays: enabled
                    ? [...card.querySelectorAll('[data-day]:checked')].map(input => Number(input.dataset.day))
                    : [],
                minAdvanceHours: Number(card.querySelector('[data-min-advance]').value),
                maxVisitors: Number(card.querySelector('[data-max-visitors]').value)
            };
        });

        const enabledTypes = types.filter(type => type.enabled);

        if (enabledTypes.length === 0) {
            notify('Turn on and configure at least one visit type.', false);
            return;
        }

        if (enabledTypes.some(type => type.allowedDurations.length === 0 || type.allowedDays.length === 0)) {
            notify('For each enabled visit type, choose at least one duration and one day.', false);
            return;
        }

        if (enabledTypes.some(type => type.maxVisitors > visitorCapacity)) {
            notify('A visit type’s group limit cannot exceed the farm’s visitor capacity.', false);
            return;
        }

        const usesHalfDay = enabledTypes.some(type => type.allowedDurations.includes('half_day'));
        const settings = {
            openTime: openTimeInput.value,
            closeTime: closeTimeInput.value,
            slotInterval: Number(slotIntervalInput.value),
            halfDaySplitTime: usesHalfDay ? halfDaySplitInput.value : '',
            visitorCapacity,
            types
        };

        submitButton.disabled = true;
        addTypeButton.disabled = true;
        submitButton.textContent = 'Saving...';

        try {
            const response = await api.saveSchedulingSettings(settings);

            if (!response.success) {
                notify(response.message ?? 'Could not save booking setup.', false);
                return;
            }

            syncVisitTypeNames(typeContainer, types);
            notify(response.message, true);
        } catch (error) {
            console.error('Failed to save appointment booking settings:', error);
            notify('Could not save booking setup. Please try again.', false);
        } finally {
            submitButton.disabled = false;
            addTypeButton.disabled = false;
            submitButton.textContent = 'Save Booking Setup';
        }
    };

    typeContainer.addEventListener('click', event => {
        const expandButton = event.target.closest('[data-expand-type]');

        if (!expandButton) return;

        const card = expandButton.closest('[data-type-card]');
        const expanded = expandButton.getAttribute('aria-expanded') === 'true';
        setTypeExpanded(card, !expanded);
    });

    typeContainer.addEventListener('change', event => {
        if (event.target.matches('[data-type-enabled]')) {
            const card = event.target.closest('[data-type-card]');
            setTypeEnabled(card, event.target.checked);

            if (event.target.checked) {
                setTypeExpanded(card, true);
            }
        }

        updateHalfDayField(typeContainer, halfDayField, halfDaySplitInput);
    });

    capacityInput.addEventListener('input', () => {
        const capacity = Number(capacityInput.value);
        typeContainer.querySelectorAll('[data-max-visitors]').forEach(input => {
            input.max = capacity > 0 ? String(capacity) : '';
        });
    });

    try {
        const schedule = await api.fetchSchedule();

        if (!schedule.success) {
            throw new Error(schedule.message ?? 'Failed to load appointment settings.');
        }

        openTimeInput.value = schedule.settings?.openTime ?? '';
        closeTimeInput.value = schedule.settings?.closeTime ?? '';
        slotIntervalInput.value = schedule.settings?.slotInterval ?? '';
        capacityInput.value = schedule.settings?.visitorCapacity ?? '';
        halfDaySplitInput.value = schedule.settings?.halfDaySplitTime ?? '';
        renderTypeSettings(typeContainer, schedule.types ?? [], schedule.settings?.visitorCapacity);
        updateHalfDayField(typeContainer, halfDayField, halfDaySplitInput);
    } catch (error) {
        console.error('Failed to load appointment booking settings:', error);
        notify('Could not load booking setup. Refresh the page and try again.', false);
    }
}

function renderTypeSettings(container, types, visitorCapacity) {
    if (types.length === 0) {
        container.innerHTML = '<p class="user-appointment-hint booking-types-empty">No visit types are available to configure.</p>';
        return;
    }

    const orderedTypes = [...types].sort((a, b) => Number(b.isActive) - Number(a.isActive));
    container.innerHTML = orderedTypes.map(type => renderTypeCard(type, visitorCapacity)).join('');

    container.querySelectorAll('[data-type-card]').forEach((card, index) => {
        setTypeEnabled(card, card.querySelector('[data-type-enabled]').checked);
        card.querySelector('[data-type-status]').textContent = getInitialTypeStatus(orderedTypes[index]);
    });
}

function renderTypeCard(type, visitorCapacity) {
    const purpose = escapeHtml(type.purpose);
    const detailsId = `booking-type-details-${nextTypeDetailsId++}`;
    const isActive = Boolean(type.isActive);
    const status = getInitialTypeStatus(type);

    const durations = durationOptions.map(option => `
            <label class="booking-choice">
                <input
                    type="checkbox"
                    data-duration="${option.value}"
                    ${type.allowedDurations?.includes(option.value) ? 'checked' : ''}
                >
                <span>${option.label}</span>
            </label>
        `).join('');

    const days = weekdayOptions.map(option => `
            <label class="booking-choice booking-day-choice">
                <input
                    type="checkbox"
                    data-day="${option.value}"
                    aria-label="Available on ${weekdayNames[option.value]}"
                    ${type.allowedDays?.includes(option.value) ? 'checked' : ''}
                >
                <span>${option.label}</span>
            </label>
        `).join('');

    return `
        <section class="booking-type-card" data-type-card data-purpose="${purpose}">
            <div class="booking-type-header">
                <button
                    type="button"
                    class="booking-type-expand"
                    data-expand-type
                    aria-expanded="false"
                    aria-controls="${detailsId}"
                    aria-label="Show settings for ${purpose}"
                >
                    <span>${purpose}</span>
                    <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
                </button>
                <label class="booking-type-toggle">
                    <input
                        type="checkbox"
                        data-type-enabled
                        aria-label="Offer ${purpose} to customers"
                        ${isActive ? 'checked' : ''}
                    >
                    <span>Offer</span>
                    <span class="booking-type-status" data-type-status>${status}</span>
                </label>
            </div>
            <div class="booking-type-content" id="${detailsId}" data-type-content hidden>
                <div class="booking-type-controls">
                    <label class="user-appointment-field">
                        <span class="user-appointment-label">Visit type name</span>
                        <input
                            type="text"
                            class="input"
                            data-purpose-name
                            maxlength="100"
                            value="${purpose}"
                            required
                        >
                    </label>
                    <div class="booking-type-control-group">
                        <span class="user-appointment-label">Visit length</span>
                        <div class="booking-choice-list">${durations}</div>
                    </div>
                    <div class="booking-type-control-group">
                        <span class="user-appointment-label">Available days</span>
                        <div class="booking-choice-list booking-days">${days}</div>
                    </div>
                    <div class="booking-settings-fields">
                        <label class="user-appointment-field">
                            <span class="user-appointment-label">Minimum notice (hours)</span>
                            <input
                                type="number"
                                class="input"
                                data-min-advance
                                min="0"
                                max="8760"
                                step="1"
                                value="${type.minAdvanceHours ?? 0}"
                                required
                            >
                            <span class="user-appointment-hint">Enter 0 for no minimum notice.</span>
                        </label>
                        <label class="user-appointment-field">
                            <span class="user-appointment-label">Largest group (visitors)</span>
                            <input
                                type="number"
                                class="input"
                                data-max-visitors
                                min="1"
                                max="${visitorCapacity ?? ''}"
                                step="1"
                                value="${type.maxVisitors ?? ''}"
                                required
                            >
                        </label>
                    </div>
                </div>
            </div>
        </section>
    `;
}

function getInitialTypeStatus(type) {
    if (type.isActive) return 'Offered';

    const hasSavedOptions =
        type.allowedDurations?.length > 0 ||
        type.allowedDays?.length > 0 ||
        type.maxVisitors !== null;

    return hasSavedOptions ? 'Archived' : 'Not set up';
}

function setTypeEnabled(card, enabled) {
    if (!card) return;

    card.querySelectorAll('input:not([data-type-enabled]):not([data-purpose-name])').forEach(input => {
        input.disabled = !enabled;
    });
    card.querySelector('[data-type-status]').textContent = enabled ? 'Offered' : 'Archived';
    card.classList.toggle('is-disabled', !enabled);
}

function setTypeExpanded(card, expanded) {
    const expandButton = card.querySelector('[data-expand-type]');

    expandButton.setAttribute('aria-expanded', String(expanded));
    expandButton.setAttribute(
        'aria-label',
        `${expanded ? 'Hide' : 'Show'} settings for ${card.dataset.purpose}`
    );
    card.querySelector('[data-type-content]').hidden = !expanded;
    card.classList.toggle('is-expanded', expanded);
}

function syncVisitTypeNames(container, types) {
    const cards = container.querySelectorAll('[data-type-card]');

    types.forEach((type, index) => {
        const card = cards[index];
        const expandButton = card.querySelector('[data-expand-type]');

        card.dataset.purpose = type.purpose;
        card.querySelector('[data-purpose-name]').value = type.purpose;
        expandButton.querySelector('span').textContent = type.purpose;
        expandButton.setAttribute(
            'aria-label',
            `${expandButton.getAttribute('aria-expanded') === 'true' ? 'Hide' : 'Show'} settings for ${type.purpose}`
        );
        card.querySelector('[data-type-enabled]').setAttribute('aria-label', `Offer ${type.purpose} to customers`);
    });
}

function updateHalfDayField(container, field, input) {
    const needsSplitTime = [...container.querySelectorAll('[data-type-card]')].some(card =>
        card.querySelector('[data-type-enabled]').checked &&
        card.querySelector('[data-duration="half_day"]').checked
    );

    field.classList.toggle('hidden', !needsSplitTime);
    input.required = needsSplitTime;
    input.disabled = !needsSplitTime;
}

function notify(message, isSuccess) {
    createNotificationElement({
        status: isSuccess ? 'success' : 'failed',
        message
    });
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}
