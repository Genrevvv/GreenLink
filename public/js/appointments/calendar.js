// Returns today's date as YYYY-MM-DD in local time.
export function getLocalToday() {
    const today = new Date();

    return [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0')
    ].join('-');
}

export function initAppointmentCalendar(dateInput) {
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
