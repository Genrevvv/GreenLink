// APPOINTMENT SCHEDULE RULES
// Defaults match AppointmentController and are replaced by the server settings when loaded.
export const scheduleSettings = {
    maxVisitors: 20,
    durations: {
        'Farm Tour': 120,
        'Educational Visit': 120,
        'Training Inquiry': 60,
        'Other': 60
    },
    timeSlots: ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'],
    sessions: [
        { start: '08:00 AM', end: '12:00 PM' },
        { start: '01:00 PM', end: '05:00 PM' }
    ]
};

// Booked (Pending / Approved) time ranges: [{ date, time, endTime, duration }]
export const scheduledAppointments = [];

export function setSchedule(scheduleData) {
    if (scheduleData.settings) {
        Object.assign(scheduleSettings, scheduleData.settings);
    }

    scheduledAppointments.length = 0;
    scheduledAppointments.push(...(scheduleData.schedule ?? []));
}

export function addScheduledAppointment(appointment) {
    scheduledAppointments.push({
        date: appointment.date,
        time: appointment.time,
        endTime: appointment.endTime,
        duration: appointment.duration
    });
}

export function removeScheduledAppointment(appointment) {
    const index = scheduledAppointments.findIndex(scheduled =>
        scheduled.date === appointment.date &&
        scheduled.time === appointment.time
    );

    if (index !== -1) {
        scheduledAppointments.splice(index, 1);
    }
}

export function getScheduledForDate(date) {
    return scheduledAppointments
        .filter(scheduled => scheduled.date === date)
        .sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
}

export function getPurposeDuration(purpose) {
    return scheduleSettings.durations[purpose] ?? 60;
}

// Checks one start time. Returns { available, reason } where reason is
// 'passed', 'booked' or 'too-long' when the slot cannot be used.
export function getSlotAvailability(date, time, duration, today, nowMinutes) {
    const start = toMinutes(time);
    const end = start + duration;

    if (date === today && start <= nowMinutes) {
        return { available: false, reason: 'passed' };
    }

    const fitsSession = scheduleSettings.sessions.some(session =>
        start >= toMinutes(session.start) && end <= toMinutes(session.end)
    );

    if (!fitsSession) {
        return { available: false, reason: 'too-long' };
    }

    const overlaps = getScheduledForDate(date).some(scheduled => {
        const scheduledStart = toMinutes(scheduled.time);
        const scheduledEnd = scheduledStart + Number(scheduled.duration || 60);

        return start < scheduledEnd && scheduledStart < end;
    });

    if (overlaps) {
        return { available: false, reason: 'booked' };
    }

    return { available: true, reason: '' };
}

// Number of start times still open on a date for the shortest visit.
export function countAvailableSlots(date, today, nowMinutes) {
    const shortestDuration = Math.min(...Object.values(scheduleSettings.durations));

    return scheduleSettings.timeSlots.filter(time =>
        getSlotAvailability(date, time, shortestDuration, today, nowMinutes).available
    ).length;
}

// Converts a time like "01:00 PM" to minutes so times can be compared.
export function toMinutes(time) {
    const [clock, period] = String(time ?? '').split(' ');
    const [hours, minutes] = clock.split(':').map(Number);

    return ((hours % 12) + (period === 'PM' ? 12 : 0)) * 60 + (minutes || 0);
}

export function getNowMinutes() {
    const now = new Date();

    return now.getHours() * 60 + now.getMinutes();
}

export function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) return `${remainingMinutes} minutes`;
    if (remainingMinutes === 0) return hours === 1 ? '1 hour' : `${hours} hours`;

    return `${hours} hr ${remainingMinutes} min`;
}

export function formatTimeRange(appointment) {
    return appointment.endTime
        ? `${appointment.time} - ${appointment.endTime}`
        : appointment.time;
}
