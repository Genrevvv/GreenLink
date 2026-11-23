// Returns today's date as YYYY-MM-DD in local time.
export function getLocalToday() {
    const today = new Date();

    return [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0')
    ].join('-');
}

// options.getDateInfo(date) returns { count, isFull, title } for scheduled appointment indicators.
// options.getDayTooltip(date) returns the HTML shown when hovering a date ('' for none).
// options.onSelect(date) runs after a date is picked.
export function initAppointmentCalendar(dateInput, options = {}) {
    const {
        getDateInfo = () => null,
        getDayTooltip = () => '',
        onSelect = () => {}
    } = options;

    const monthLabel = document.querySelector('#calendar-month-year');
    const daysContainer = document.querySelector('#calendar-days');
    const previousButton = document.querySelector('#calendar-prev');
    const nextButton = document.querySelector('#calendar-next');
    const selectedLabel = document.querySelector('#calendar-selected-date');
    const calendar = document.querySelector('#custom-calendar');
    const tooltip = document.querySelector('#calendar-day-tooltip');

    if (
        !dateInput ||
        !monthLabel ||
        !daysContainer ||
        !previousButton ||
        !nextButton ||
        !selectedLabel
    ) {
        return {
            reset() {},
            refresh() {}
        };
    }

    const todayString = getLocalToday();
    const today = new Date();
    const earliestDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );

    let displayedMonth = new Date(earliestDate);
    let selectedDate = '';

    // Hover content for the dates in the displayed month.
    const dayTooltips = new Map();

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
        dayTooltips.clear();
        hideDayTooltip();

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

            // Scheduled appointment indicators (hover shows the booked times).
            const dateInfo = dateString >= todayString ? getDateInfo(dateString) : null;

            if (dateInfo?.count > 0) {
                dayButton.classList.add('has-appointments');
            }

            if (dateInfo?.isFull) {
                dayButton.disabled = true;
                dayButton.classList.add('is-full');
            }

            // The user's own appointments on this date (shown on hover).
            const tooltipHtml = getDayTooltip(dateString);

            if (tooltipHtml) {
                dayTooltips.set(dateString, tooltipHtml);
                dayButton.dataset.date = dateString;
                dayButton.classList.add('has-own-appointments');
            }

            if (dateInfo?.title) {
                // On the user's own dates the hover card replaces the browser tooltip.
                if (!tooltipHtml) dayButton.title = dateInfo.title;

                dayButton.setAttribute(
                    'aria-label',
                    dayButton.getAttribute('aria-label') + '. ' + dateInfo.title
                );
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
                onSelect(dateString);
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


    // HOVER CARD: the user's own appointments on a date
    function showDayTooltip(dayButton) {
        const html = dayTooltips.get(dayButton.dataset.date);

        if (!tooltip || !calendar || !html) {
            hideDayTooltip();
            return;
        }

        tooltip.innerHTML = html;
        tooltip.classList.remove('hidden');

        // Above the date and kept inside the calendar; below it when there is no room above.
        const calendarBox = calendar.getBoundingClientRect();
        const dayBox = dayButton.getBoundingClientRect();
        const gap = 6;

        const centeredLeft = dayBox.left - calendarBox.left + dayBox.width / 2 - tooltip.offsetWidth / 2;
        const maxLeft = Math.max(0, calendar.clientWidth - tooltip.offsetWidth);
        const left = Math.min(Math.max(centeredLeft, 0), maxLeft);

        const fitsAbove = dayBox.top - tooltip.offsetHeight - gap >= 0;
        const top = fitsAbove
            ? dayBox.top - calendarBox.top - tooltip.offsetHeight - gap
            : dayBox.bottom - calendarBox.top + gap;

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }

    function hideDayTooltip() {
        tooltip?.classList.add('hidden');
    }

    const toggleDayTooltip = event => {
        const dayButton = event.target.closest?.('.custom-calendar-day');

        if (dayButton && dayTooltips.has(dayButton.dataset.date)) {
            showDayTooltip(dayButton);
        } else {
            hideDayTooltip();
        }
    };

    daysContainer.addEventListener('mouseover', toggleDayTooltip);
    daysContainer.addEventListener('focusin', toggleDayTooltip);
    daysContainer.addEventListener('mouseleave', hideDayTooltip);
    daysContainer.addEventListener('focusout', hideDayTooltip);

    // Re-draws the indicators after the schedule changes.
    // A selected date that became fully booked is cleared.
    const refresh = () => {
        if (selectedDate && getDateInfo(selectedDate)?.isFull) {
            reset();
            onSelect('');
            return;
        }

        renderCalendar();
    };

    renderCalendar();

    return { reset, refresh };
}
