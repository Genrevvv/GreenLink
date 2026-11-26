// APPOINTMENT SCHEDULE RULES
// Everything here is filled from /api/appointments/schedule. There are no default
// hours, capacity or type rules: when the server reports scheduling as not
// configured, the booking form is disabled. The backend repeats every check.
export const scheduling = {
    configured: false,
    message: '',
    settings: null,
    types: [],
    booked: [],      // Pending / Approved: [{ id, date, startTime, endTime, visitors }]
    unavailable: []  // [{ id, date, startTime, endTime, reason }] (null times = whole day)
};

export const durationLabels = {
    hourly: 'Hourly',
    half_day: 'Half day',
    whole_day: 'Whole day'
};

const weekdayNames = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function setSchedule(scheduleData) {
    scheduling.configured = Boolean(scheduleData.configured);
    scheduling.message = scheduleData.message ?? '';
    scheduling.settings = scheduleData.settings ?? null;
    scheduling.types = scheduleData.types ?? [];
    scheduling.booked = scheduleData.schedule ?? [];
    scheduling.unavailable = scheduleData.unavailable ?? [];
}

export function getConfiguredTypes() {
    return scheduling.configured
        ? scheduling.types.filter(type => type.configured)
        : [];
}

export function getTypeRule(purpose) {
    return getConfiguredTypes().find(type => type.purpose === purpose) ?? null;
}

export function getScheduledForDate(date) {
    return scheduling.booked
        .filter(scheduled => scheduled.date === date)
        .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
}

function getSettingsMinutes() {
    const settings = scheduling.settings;

    return {
        open: toMinutes(settings.openTime),
        close: toMinutes(settings.closeTime),
        interval: Number(settings.slotInterval),
        split: settings.halfDaySplitTime ? toMinutes(settings.halfDaySplitTime) : null,
        capacity: Number(settings.visitorCapacity)
    };
}

// START / END OPTIONS (generated from the operating hours and the type's allowed durations)
// Start times offered for a purpose, in minutes.
export function getStartCandidates(purpose) {
    const rule = getTypeRule(purpose);

    if (!rule) return [];

    const { open, close, interval, split } = getSettingsMinutes();
    const starts = new Set();

    if (rule.allowedDurations.includes('hourly')) {
        for (let start = open; start + 60 <= close; start += interval) {
            starts.add(start);
        }
    }

    if (rule.allowedDurations.includes('half_day') && split !== null) {
        starts.add(open);
        starts.add(split);
    }

    if (rule.allowedDurations.includes('whole_day')) {
        starts.add(open);
    }

    return [...starts].sort((a, b) => a - b);
}

// End times offered for a start time, each with the duration type it matches.
export function getEndCandidates(purpose, start) {
    const rule = getTypeRule(purpose);

    if (!rule || start === null) return [];

    const { open, close, interval, split } = getSettingsMinutes();
    const ends = new Map();

    if (rule.allowedDurations.includes('hourly') && (start - open) % interval === 0) {
        for (let end = start + 60; end <= close; end += 60) {
            ends.set(end, 'hourly');
        }
    }

    if (rule.allowedDurations.includes('half_day') && split !== null) {
        if (start === open) ends.set(split, 'half_day');
        if (start === split) ends.set(close, 'half_day');
    }

    if (rule.allowedDurations.includes('whole_day') && start === open) {
        ends.set(close, 'whole_day');
    }

    return [...ends.entries()]
        .map(([end, durationType]) => ({ end, durationType }))
        .sort((a, b) => a.end - b.end);
}

function matchesDurationType(durationType, start, end, settings) {
    if (durationType === 'hourly') {
        return (start - settings.open) % settings.interval === 0 && (end - start) % 60 === 0;
    }

    if (durationType === 'half_day') {
        return settings.split !== null && (
            (start === settings.open && end === settings.split) ||
            (start === settings.split && end === settings.close)
        );
    }

    if (durationType === 'whole_day') {
        return start === settings.open && end === settings.close;
    }

    return false;
}

const overlaps = (start, end, otherStart, otherEnd) => start < otherEnd && end > otherStart;

// RANGE CHECK (same rules and order as AppointmentController::validateSchedule)
// Returns { code, message } when the range cannot be booked, otherwise null.
// excludeId leaves out the appointment being rescheduled.
export function checkRange(date, start, end, purpose, visitors, excludeId = null) {
    if (!scheduling.configured) {
        return { code: 'config', message: scheduling.message || 'Appointment scheduling has not been configured yet.' };
    }

    const rule = getTypeRule(purpose);

    if (!rule) {
        return { code: 'purpose', message: 'Please select a valid visit purpose.' };
    }

    const settings = getSettingsMinutes();

    if (start >= end) {
        return { code: 'order', message: 'The end time must be later than the start time.' };
    }

    if (start < settings.open || end > settings.close) {
        return {
            code: 'hours',
            message: `Visits must be within operating hours (${formatTime(settings.open)} - ${formatTime(settings.close)}).`
        };
    }

    if (!rule.allowedDurations.some(type => matchesDurationType(type, start, end, settings))) {
        return {
            code: 'duration',
            message: `The selected time range is not an allowed duration for ${purpose} (${formatDurationTypes(rule.allowedDurations)}).`
        };
    }

    const duration = end - start;

    if (rule.minDuration !== null && duration < rule.minDuration) {
        return { code: 'too-short', message: `${purpose} must be at least ${formatDuration(rule.minDuration)} long.` };
    }

    if (rule.maxDuration !== null && duration > rule.maxDuration) {
        return { code: 'too-long', message: `${purpose} can be at most ${formatDuration(rule.maxDuration)} long.` };
    }

    if (!rule.allowedDays.includes(getIsoWeekday(date))) {
        return { code: 'day', message: `${purpose} visits are not available on this day of the week.` };
    }

    const startsAt = new Date(`${date}T${minutesToTime(start)}:00`).getTime();
    const earliest = Date.now() + rule.minAdvanceHours * 60 * 60 * 1000;

    if (startsAt <= earliest) {
        return rule.minAdvanceHours > 0
            ? { code: 'notice', message: `${purpose} must be booked at least ${rule.minAdvanceHours} hour(s) in advance.` }
            : { code: 'passed', message: 'The selected time has already passed. Please choose a later time.' };
    }

    if (visitors > rule.maxVisitors) {
        return { code: 'visitors', message: `A maximum of ${rule.maxVisitors} visitors is allowed for ${purpose}.` };
    }

    if (visitors > settings.capacity) {
        return { code: 'visitors', message: `A maximum of ${settings.capacity} visitors can be on the farm at the same time.` };
    }

    for (const period of scheduling.unavailable) {
        if (period.date !== date) continue;

        const reason = period.reason ? ` (${period.reason})` : '';

        if (!period.startTime) {
            return { code: 'unavailable', message: `The farm is not accepting visits on this date${reason}. Please choose another date.` };
        }

        const periodStart = toMinutes(period.startTime);
        const periodEnd = toMinutes(period.endTime);

        if (overlaps(start, end, periodStart, periodEnd)) {
            return {
                code: 'unavailable',
                message: `The farm is unavailable from ${formatTime(periodStart)} to ${formatTime(periodEnd)}${reason}. Please choose another time.`
            };
        }
    }

    // Overlapping bookings are allowed while the visitors on the farm stay within capacity.
    const overlapping = getScheduledForDate(date)
        .filter(scheduled => scheduled.id !== excludeId)
        .map(scheduled => ({
            start: toMinutes(scheduled.startTime),
            end: toMinutes(scheduled.endTime),
            visitors: Number(scheduled.visitors) || 0
        }))
        .filter(scheduled => overlaps(start, end, scheduled.start, scheduled.end));

    const points = [start, ...overlapping.map(scheduled => scheduled.start).filter(point => point > start)];
    const peakVisitors = Math.max(0, ...points.map(point =>
        overlapping
            .filter(scheduled => scheduled.start <= point && point < scheduled.end)
            .reduce((total, scheduled) => total + scheduled.visitors, 0)
    ));

    if (peakVisitors + visitors > settings.capacity) {
        const spotsLeft = Math.max(0, settings.capacity - peakVisitors);

        return spotsLeft > 0
            ? { code: 'full', message: `Only ${spotsLeft} visitor spot(s) are left during the selected time. Please choose another time or fewer visitors.` }
            : { code: 'full', message: 'The selected time is fully booked. Please choose another time.' };
    }

    return null;
}

// True when at least one start and end time can still be booked on the date.
// Without a purpose, any configured type counts.
export function hasAvailableRange(date, purpose, visitors = 1, excludeId = null) {
    const purposes = purpose ? [purpose] : getConfiguredTypes().map(type => type.purpose);

    return purposes.some(currentPurpose =>
        getStartCandidates(currentPurpose).some(start =>
            getEndCandidates(currentPurpose, start).some(({ end }) =>
                !checkRange(date, start, end, currentPurpose, visitors, excludeId)
            )
        )
    );
}

// Short summary of a type's rules for the booking form hint.
export function describeTypeRule(rule) {
    const parts = [
        `Durations: ${formatDurationTypes(rule.allowedDurations)}`,
        `Days: ${rule.allowedDays.map(day => weekdayNames[day]).join(', ')}`,
        `Up to ${rule.maxVisitors} visitors`
    ];

    if (rule.minDuration !== null) parts.push(`at least ${formatDuration(rule.minDuration)}`);
    if (rule.maxDuration !== null) parts.push(`at most ${formatDuration(rule.maxDuration)}`);
    if (rule.minAdvanceHours > 0) parts.push(`book ${rule.minAdvanceHours} hour(s) ahead`);

    return parts.join(' · ');
}

function formatDurationTypes(durationTypes) {
    return durationTypes.map(type => durationLabels[type] ?? type).join(', ');
}

// 1 = Monday ... 7 = Sunday (same as PHP date('N')).
function getIsoWeekday(date) {
    const day = new Date(`${date}T00:00:00`).getDay();

    return day === 0 ? 7 : day;
}

// Converts "13:00", "13:00:00" or "01:00 PM" to minutes so times can be compared.
export function toMinutes(time) {
    const [clock, period] = String(time ?? '').trim().split(' ');
    const [hours, minutes] = clock.split(':').map(Number);

    if (!period) {
        return hours * 60 + (minutes || 0);
    }

    return ((hours % 12) + (period === 'PM' ? 12 : 0)) * 60 + (minutes || 0);
}

// Minutes to the 24-hour HH:MM format the API expects.
export function minutesToTime(minutes) {
    return [
        String(Math.floor(minutes / 60)).padStart(2, '0'),
        String(minutes % 60).padStart(2, '0')
    ].join(':');
}

// Minutes to the display format used across the app (e.g. 01:00 PM).
export function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const period = hours >= 12 ? 'PM' : 'AM';

    return `${String(hours % 12 || 12).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')} ${period}`;
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
