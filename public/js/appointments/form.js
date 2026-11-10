import {
    emptyUserAppointmentsModal,
    userAppointmentCardModal
} from './modal.js';
import { initAppointmentCalendar, getLocalToday } from './calendar.js';
import * as api from './api.js';

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

    const calendar = initAppointmentCalendar(dateInput);

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

            const appointmentData = {
                date,
                time,
                purpose,
                visitors,
                notes
            };

            let data;

            try {
                data = await api.addAppointment(appointmentData);
            } catch (error) {
                console.error('Failed to submit appointment:', error);
                data = { success: false };
            }

            if (!data.success) {
                showUserAppointmentMessage(
                    message,
                    'is-error',
                    data.message ?? 'Failed to submit appointment request.'
                );
                return;
            }

            userAppointmentsData.push({
                id: data.id,
                ...appointmentData,
                status: 'Pending'
            });

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

    const localToday = getLocalToday();

    const upcomingAppointments = userAppointmentsData
        .filter(appointment =>
            appointment.date >= localToday &&
            appointment.status !== 'Rejected'
        )
        .sort((a, b) =>
            a.date.localeCompare(b.date) ||
            toMinutes(a.time) - toMinutes(b.time)
        );

    if (upcomingAppointments.length === 0) {
        appointmentsList.innerHTML = emptyUserAppointmentsModal();
        return;
    }

    appointmentsList.innerHTML = upcomingAppointments
        .map(appointment => userAppointmentCardModal(appointment))
        .join('');
}

// Converts a time like "01:00 PM" to minutes so same-day appointments sort correctly.
function toMinutes(time) {
    const [clock, period] = String(time ?? '').split(' ');
    const [hours, minutes] = clock.split(':').map(Number);

    return ((hours % 12) + (period === 'PM' ? 12 : 0)) * 60 + (minutes || 0);
}

function showUserAppointmentMessage(message, messageType, text) {
    if (!message) {
        return;
    }

    message.textContent = text;
    message.classList.remove('hidden', 'is-success', 'is-error');
    message.classList.add(messageType);
}
