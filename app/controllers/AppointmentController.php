<?php
    class AppointmentController {
        private Appointment $appointment;
        private Schedule $schedule;

        private const STATUSES = ['Pending', 'Approved', 'Rejected', 'Cancelled'];

        // Which current statuses each new status can be set from.
        private const STATUS_TRANSITIONS = [
            'Approved' => ['Pending'],
            'Rejected' => ['Pending'],
            'Cancelled' => ['Pending', 'Approved']
        ];

        // Statuses that can still be moved to another date or time.
        private const RESCHEDULABLE_STATUSES = ['Pending', 'Approved'];

        private const DURATION_TYPES = ['hourly', 'half_day', 'whole_day'];

        private const NOT_CONFIGURED_MESSAGE = 'Appointment scheduling has not been configured yet. Please contact the farm.';

        public function __construct(Appointment $appointment, Schedule $schedule) {
            $this->appointment = $appointment;
            $this->schedule = $schedule;
        }

        public function getAll(): void {
            try {
                $appointments = $this->appointment->getAll();

                $formattedAppointments = array_map(function ($appointment) {
                    return [
                        'id' => (int) $appointment['id'],
                        'customer' => $appointment['customer'],
                        'email' => $appointment['email'] ?? '',
                        'date' => $appointment['appointment_date'],
                        'time' => $this->formatTime($appointment['appointment_time']),
                        'endTime' => $this->formatEndTime($appointment['appointment_time'], (int) $appointment['duration_minutes']),
                        'duration' => (int) $appointment['duration_minutes'],
                        'purpose' => $appointment['purpose'],
                        'visitors' => (int) $appointment['visitors'],
                        'notes' => $appointment['notes'] ?? '',
                        'status' => $appointment['status']
                    ];
                }, $appointments);

                json_response([
                    'success' => true,
                    'appointments' => $formattedAppointments
                ]);

            } catch (Throwable $e) {
                json_response([
                    'success' => false,
                    'message' => 'Failed to retrieve appointments.'
                ]);
            }
        }

        public function getByUser(): void {
            $userId = (int) ($_SESSION['user_id'] ?? 0);

            if ($userId <= 0) {
                json_response([
                    'success' => false,
                    'message' => 'Please sign in to view your appointments.'
                ]);
                return;
            }

            try {
                $appointments = $this->appointment->getByUser($userId);

                $formattedAppointments = array_map(function ($appointment) {
                    return [
                        'id' => (int) $appointment['id'],
                        'date' => $appointment['appointment_date'],
                        'time' => $this->formatTime($appointment['appointment_time']),
                        'endTime' => $this->formatEndTime($appointment['appointment_time'], (int) $appointment['duration_minutes']),
                        'duration' => (int) $appointment['duration_minutes'],
                        'purpose' => $appointment['purpose'],
                        'visitors' => (int) $appointment['visitors'],
                        'notes' => $appointment['notes'] ?? '',
                        'status' => $appointment['status']
                    ];
                }, $appointments);

                json_response([
                    'success' => true,
                    'appointments' => $formattedAppointments
                ]);

            } catch (Throwable $e) {
                json_response([
                    'success' => false,
                    'message' => 'Failed to retrieve appointments.'
                ]);
            }
        }

        // Scheduling rules, booked ranges (no customer details) and blocked periods for the booking form.
        // Every rule comes from the database; the front end does not keep its own copy.
        public function getSchedule(): void {
            try {
                $today = date('Y-m-d');
                $scheduling = $this->loadScheduling();

                $schedule = array_map(function ($appointment) {
                    $start = $this->toMinutes($appointment['appointment_time']);

                    return [
                        'id' => (int) $appointment['id'],
                        'date' => $appointment['appointment_date'],
                        'startTime' => $this->minutesToTime($start),
                        'endTime' => $this->minutesToTime($start + (int) $appointment['duration_minutes']),
                        'visitors' => (int) $appointment['visitors']
                    ];
                }, $this->appointment->getScheduled($today));

                json_response([
                    'success' => true,
                    'configured' => $scheduling['configured'],
                    'message' => $scheduling['configured'] ? '' : self::NOT_CONFIGURED_MESSAGE,
                    'missing' => $scheduling['missing'],
                    'settings' => $this->formatSettings($scheduling['settings']),
                    'types' => array_values($scheduling['types']),
                    'schedule' => $schedule,
                    'unavailable' => array_map(
                        fn ($period) => $this->formatUnavailablePeriod($period),
                        $this->schedule->getUnavailablePeriods($today)
                    )
                ]);

            } catch (Throwable $e) {
                error_log('Failed to retrieve appointment schedule: ' . $e->getMessage());
                json_response([
                    'success' => false,
                    'message' => 'Failed to retrieve the appointment schedule.'
                ]);
            }
        }

        public function addVisitType(): void {
            if (!$this->isAdmin()) {
                json_response([
                    'success' => false,
                    'message' => 'Only admins can add visit types.'
                ]);
                return;
            }

            $data = get_json_input();
            $purpose = $data['purpose'] ?? null;

            if (!is_string($purpose)) {
                json_response([
                    'success' => false,
                    'message' => 'Enter a valid visit type name.'
                ]);
                return;
            }

            $purpose = trim($purpose);

            if ($purpose === '' || mb_strlen($purpose) > 100) {
                json_response([
                    'success' => false,
                    'message' => 'Enter a visit type name between 1 and 100 characters.'
                ]);
                return;
            }

            try {
                if (!$this->schedule->addTypeRule($purpose)) {
                    json_response([
                        'success' => false,
                        'message' => 'A visit type with that name already exists.'
                    ]);
                    return;
                }

                json_response([
                    'success' => true,
                    'purpose' => $purpose,
                    'message' => 'Visit type added. Set its options, then save booking setup.'
                ]);
            } catch (Throwable $e) {
                json_response([
                    'success' => false,
                    'message' => 'Failed to add the visit type.'
                ]);
            }
        }

        public function updateSchedulingSettings(): void {
            if (!$this->isAdmin()) {
                json_response([
                    'success' => false,
                    'message' => 'Only admins can change appointment booking settings.'
                ]);
                return;
            }

            $data = get_json_input();
            $openTime = $this->parseTime($data['openTime'] ?? '');
            $closeTime = $this->parseTime($data['closeTime'] ?? '');
            $halfDaySplitTime = $this->parseTime($data['halfDaySplitTime'] ?? '');
            $slotInterval = filter_var($data['slotInterval'] ?? null, FILTER_VALIDATE_INT);
            $visitorCapacity = filter_var($data['visitorCapacity'] ?? null, FILTER_VALIDATE_INT);

            if (
                $openTime === null ||
                $closeTime === null ||
                $this->toMinutes($openTime) >= $this->toMinutes($closeTime) ||
                $slotInterval === false || $slotInterval < 1 || $slotInterval > 1440 ||
                $visitorCapacity === false || $visitorCapacity < 1
            ) {
                json_response([
                    'success' => false,
                    'message' => 'Enter valid opening and closing times, a start-time interval, and a visitor capacity.'
                ]);
                return;
            }

            if ($halfDaySplitTime !== null && (
                $this->toMinutes($halfDaySplitTime) <= $this->toMinutes($openTime) ||
                $this->toMinutes($halfDaySplitTime) >= $this->toMinutes($closeTime)
            )) {
                json_response([
                    'success' => false,
                    'message' => 'The half-day changeover must be between opening and closing time.'
                ]);
                return;
            }

            $submittedTypes = $data['types'] ?? null;

            if (!is_array($submittedTypes)) {
                json_response([
                    'success' => false,
                    'message' => 'Please review the appointment types and try again.'
                ]);
                return;
            }

            try {
                $existingTypes = $this->schedule->getTypeRules();
                $knownPurposes = array_column($existingTypes, 'purpose');
                $knownPurposesByLowercase = [];
                foreach ($knownPurposes as $knownPurpose) {
                    $knownPurposesByLowercase[mb_strtolower($knownPurpose)] = $knownPurpose;
                }

                $submittedByOriginalPurpose = [];
                $submittedPurposes = [];
                $typeRules = [];
                $usesHalfDay = false;

                foreach ($submittedTypes as $type) {
                    if (
                        !is_array($type) ||
                        !is_string($type['originalPurpose'] ?? null) ||
                        !is_string($type['purpose'] ?? null)
                    ) {
                        json_response([
                            'success' => false,
                            'message' => 'One of the appointment types is invalid.'
                        ]);
                        return;
                    }

                    $originalPurpose = trim($type['originalPurpose']);
                    $purpose = trim($type['purpose']);

                    if (
                        $originalPurpose === '' ||
                        $purpose === '' ||
                        mb_strlen($purpose) > 100 ||
                        isset($submittedByOriginalPurpose[$originalPurpose])
                    ) {
                        json_response([
                            'success' => false,
                            'message' => 'Visit type names must be unique and no longer than 100 characters.'
                        ]);
                        return;
                    }

                    $normalizedPurpose = mb_strtolower($purpose);

                    if (isset($submittedPurposes[$normalizedPurpose])) {
                        json_response([
                            'success' => false,
                            'message' => 'Visit type names must be unique.'
                        ]);
                        return;
                    }

                    if (
                        isset($knownPurposesByLowercase[$normalizedPurpose]) &&
                        $knownPurposesByLowercase[$normalizedPurpose] !== $originalPurpose
                    ) {
                        json_response([
                            'success' => false,
                            'message' => 'That visit type name is already in use.'
                        ]);
                        return;
                    }

                    $submittedByOriginalPurpose[$originalPurpose] = true;
                    $submittedPurposes[$normalizedPurpose] = true;
                    $enabled = $type['enabled'] ?? null;

                    if (!is_bool($enabled)) {
                        json_response([
                            'success' => false,
                            'message' => 'Please choose whether each appointment type is available.'
                        ]);
                        return;
                    }

                    if (
                        !isset($knownPurposesByLowercase[mb_strtolower($originalPurpose)]) ||
                        $knownPurposesByLowercase[mb_strtolower($originalPurpose)] !== $originalPurpose
                    ) {
                        json_response([
                            'success' => false,
                            'message' => 'Visit types have changed. Reload the page and try again.'
                        ]);
                        return;
                    }

                    if (!$enabled) {
                        $typeRules[] = [
                            'purpose' => $purpose,
                            'originalPurpose' => $originalPurpose,
                            'enabled' => false
                        ];
                        continue;
                    }

                    $durations = $type['allowedDurations'] ?? null;
                    $days = $type['allowedDays'] ?? null;
                    $minAdvanceHours = filter_var($type['minAdvanceHours'] ?? null, FILTER_VALIDATE_INT);
                    $maxVisitors = filter_var($type['maxVisitors'] ?? null, FILTER_VALIDATE_INT);
                    $validDurations = ['hourly', 'half_day', 'whole_day'];

                    if (
                        !is_array($durations) ||
                        !is_array($days) ||
                        array_filter($durations, fn ($duration) => !is_string($duration)) ||
                        array_filter($days, fn ($day) => !is_int($day) && !(is_string($day) && ctype_digit($day)))
                    ) {
                        json_response([
                            'success' => false,
                            'message' => 'Choose at least one visit duration and one available day for each enabled type.'
                        ]);
                        return;
                    }

                    $durations = array_values(array_unique($durations));
                    $days = array_values(array_unique(array_map('intval', $days)));

                    if (
                        empty($durations) ||
                        array_diff($durations, $validDurations) ||
                        empty($days) ||
                        array_diff($days, [1, 2, 3, 4, 5, 6, 7]) ||
                        $minAdvanceHours === false || $minAdvanceHours < 0 || $minAdvanceHours > 8760 ||
                        $maxVisitors === false || $maxVisitors < 1 || $maxVisitors > $visitorCapacity
                    ) {
                        json_response([
                            'success' => false,
                            'message' => 'Check the durations, days, booking notice, and group size for each enabled type.'
                        ]);
                        return;
                    }

                    $usesHalfDay = $usesHalfDay || in_array('half_day', $durations, true);
                    $typeRules[] = [
                        'purpose' => $purpose,
                        'originalPurpose' => $originalPurpose,
                        'enabled' => true,
                        'allowedDurations' => $durations,
                        'allowedDays' => $days,
                        'minAdvanceHours' => $minAdvanceHours,
                        'maxVisitors' => $maxVisitors
                    ];
                }

                if (
                    count($submittedByOriginalPurpose) !== count($knownPurposes) ||
                    array_diff($knownPurposes, array_keys($submittedByOriginalPurpose))
                ) {
                    json_response([
                        'success' => false,
                        'message' => 'Appointment types have changed. Reload the page and try again.'
                    ]);
                    return;
                }

                if (empty(array_filter($typeRules, fn ($rule) => $rule['enabled']))) {
                    json_response([
                        'success' => false,
                        'message' => 'Enable and configure at least one appointment type.'
                    ]);
                    return;
                }

                if ($usesHalfDay && (
                    $halfDaySplitTime === null ||
                    $this->toMinutes($halfDaySplitTime) <= $this->toMinutes($openTime) ||
                    $this->toMinutes($halfDaySplitTime) >= $this->toMinutes($closeTime)
                )) {
                    json_response([
                        'success' => false,
                        'message' => 'Set a half-day changeover time between opening and closing.'
                    ]);
                    return;
                }

                $this->schedule->saveBookingSettings([
                    'openTime' => $openTime,
                    'closeTime' => $closeTime,
                    'slotInterval' => $slotInterval,
                    'halfDaySplitTime' => $usesHalfDay ? $halfDaySplitTime : null,
                    'visitorCapacity' => $visitorCapacity
                ], $typeRules);

                json_response([
                    'success' => true,
                    'message' => 'Appointment booking settings saved.'
                ]);
            } catch (DomainException $e) {
                json_response([
                    'success' => false,
                    'message' => $e->getMessage()
                ]);
            } catch (Throwable $e) {
                json_response([
                    'success' => false,
                    'message' => 'Failed to save appointment booking settings.'
                ]);
            }
        }

        public function addAppointment(): void {
            $data = get_json_input();

            $userId = (int) ($_SESSION['user_id'] ?? 0);
            $date = trim($data['date'] ?? '');
            $startTime = $this->parseTime($data['startTime'] ?? '');
            $endTime = $this->parseTime($data['endTime'] ?? '');
            $purpose = trim($data['purpose'] ?? '');
            $visitors = (int) ($data['visitors'] ?? 0);
            $notes = trim($data['notes'] ?? '');

            if ($userId <= 0) {
                json_response([
                    'success' => false,
                    'message' => 'Please sign in to book an appointment.'
                ]);
                return;
            }

            if (!$this->isValidDate($date) || $startTime === null || $endTime === null || $purpose === '' || $visitors < 1) {
                json_response([
                    'success' => false,
                    'message' => 'Please provide a valid date, start time, end time, purpose and number of visitors.'
                ]);
                return;
            }

            try {
                $scheduling = $this->loadScheduling();
                $scheduleError = $this->validateSchedule($scheduling, $date, $startTime, $endTime, $purpose, $visitors);

                if ($scheduleError !== null) {
                    json_response([
                        'success' => false,
                        'message' => $scheduleError
                    ]);
                    return;
                }

                $duration = $this->toMinutes($endTime) - $this->toMinutes($startTime);

                $appointmentId = $this->appointment->addAppointment(
                    $userId,
                    $date,
                    $startTime . ':00',
                    $duration,
                    $purpose,
                    $visitors,
                    $notes
                );

                json_response([
                    'success' => true,
                    'message' => 'Appointment request submitted successfully.',
                    'id' => $appointmentId,
                    'duration' => $duration,
                    'time' => $this->formatTime($startTime . ':00'),
                    'endTime' => $this->formatTime($endTime . ':00')
                ]);

            } catch (Throwable $e) {
                json_response([
                    'success' => false,
                    'message' => 'Failed to submit appointment request.'
                ]);
            }
        }

        // Moves a Pending or Approved appointment to a new date and time.
        // The owner or an admin can reschedule. When the owner does it, the request goes back to Pending.
        public function rescheduleAppointment(): void {
            $data = get_json_input();

            $userId = (int) ($_SESSION['user_id'] ?? 0);
            $isAdmin = $this->isAdmin();
            $id = (int) ($data['id'] ?? 0);
            $date = trim($data['date'] ?? '');
            $startTime = $this->parseTime($data['startTime'] ?? '');
            $endTime = $this->parseTime($data['endTime'] ?? '');

            if ($userId <= 0) {
                json_response([
                    'success' => false,
                    'message' => 'Please sign in to reschedule an appointment.'
                ]);
                return;
            }

            if ($id <= 0 || !$this->isValidDate($date) || $startTime === null || $endTime === null) {
                json_response([
                    'success' => false,
                    'message' => 'Please provide a valid date, start time and end time.'
                ]);
                return;
            }

            try {
                $appointment = $this->appointment->getById($id);

                if (!$appointment || (!$isAdmin && (int) $appointment['user_id'] !== $userId)) {
                    json_response([
                        'success' => false,
                        'message' => 'Appointment not found.'
                    ]);
                    return;
                }

                if (!in_array($appointment['status'], self::RESCHEDULABLE_STATUSES, true)) {
                    json_response([
                        'success' => false,
                        'message' => 'Only pending or approved appointments can be rescheduled.'
                    ]);
                    return;
                }

                if ($appointment['appointment_date'] < date('Y-m-d')) {
                    json_response([
                        'success' => false,
                        'message' => 'Past appointments can no longer be rescheduled.'
                    ]);
                    return;
                }

                // The appointment being moved does not count against its own new time.
                $scheduling = $this->loadScheduling();
                $scheduleError = $this->validateSchedule(
                    $scheduling,
                    $date,
                    $startTime,
                    $endTime,
                    $appointment['purpose'],
                    (int) $appointment['visitors'],
                    $id
                );

                if ($scheduleError !== null) {
                    json_response([
                        'success' => false,
                        'message' => $scheduleError
                    ]);
                    return;
                }

                $duration = $this->toMinutes($endTime) - $this->toMinutes($startTime);
                $status = $isAdmin ? $appointment['status'] : 'Pending';

                $this->appointment->reschedule($id, $date, $startTime . ':00', $duration, $status, $isAdmin);

                json_response([
                    'success' => true,
                    'message' => 'Appointment rescheduled successfully.',
                    'date' => $date,
                    'duration' => $duration,
                    'time' => $this->formatTime($startTime . ':00'),
                    'endTime' => $this->formatTime($endTime . ':00'),
                    'status' => $status
                ]);

            } catch (Throwable $e) {
                json_response([
                    'success' => false,
                    'message' => 'Failed to reschedule appointment.'
                ]);
            }
        }

        public function updateStatus(): void {
            $data = get_json_input();

            $id = (int) ($data['id'] ?? 0);
            $status = $data['status'] ?? '';

            if ($id <= 0 || !in_array($status, self::STATUSES, true) || !isset(self::STATUS_TRANSITIONS[$status])) {
                json_response([
                    'success' => false,
                    'message' => 'Please provide a valid appointment and status.'
                ]);
                return;
            }

            try {
                $appointment = $this->appointment->getById($id);

                if (!$appointment) {
                    json_response([
                        'success' => false,
                        'message' => 'Appointment not found.'
                    ]);
                    return;
                }

                if (!in_array($appointment['status'], self::STATUS_TRANSITIONS[$status], true)) {
                    json_response([
                        'success' => false,
                        'message' => 'This appointment is already ' . strtolower($appointment['status']) . ' and cannot be ' . strtolower($status) . '.'
                    ]);
                    return;
                }

                $this->appointment->updateStatus($id, $status);

                json_response([
                    'success' => true,
                    'message' => 'Appointment status updated successfully.'
                ]);

            } catch (Throwable $e) {
                json_response([
                    'success' => false,
                    'message' => 'Failed to update appointment status.'
                ]);
            }
        }

        // Users cancel their own appointment. The record is kept with a Cancelled status.
        public function cancelAppointment(): void {
            $data = get_json_input();

            $userId = (int) ($_SESSION['user_id'] ?? 0);
            $id = (int) ($data['id'] ?? 0);

            if ($userId <= 0) {
                json_response([
                    'success' => false,
                    'message' => 'Please sign in to cancel an appointment.'
                ]);
                return;
            }

            try {
                $appointment = $id > 0 ? $this->appointment->getById($id) : null;

                if (!$appointment || (int) $appointment['user_id'] !== $userId) {
                    json_response([
                        'success' => false,
                        'message' => 'Appointment not found.'
                    ]);
                    return;
                }

                if (!in_array($appointment['status'], self::STATUS_TRANSITIONS['Cancelled'], true)) {
                    json_response([
                        'success' => false,
                        'message' => 'Only pending or approved appointments can be cancelled.'
                    ]);
                    return;
                }

                if ($appointment['appointment_date'] < date('Y-m-d')) {
                    json_response([
                        'success' => false,
                        'message' => 'Past appointments can no longer be cancelled.'
                    ]);
                    return;
                }

                $this->appointment->updateStatus($id, 'Cancelled');

                json_response([
                    'success' => true,
                    'message' => 'Appointment cancelled successfully.'
                ]);

            } catch (Throwable $e) {
                json_response([
                    'success' => false,
                    'message' => 'Failed to cancel appointment.'
                ]);
            }
        }

        // ADMIN: dates and time periods when the farm cannot take visits.
        public function getUnavailablePeriods(): void {
            if (!$this->isAdmin()) {
                json_response([
                    'success' => false,
                    'message' => 'Only admins can view unavailable periods.'
                ]);
                return;
            }

            try {
                json_response([
                    'success' => true,
                    'periods' => array_map(
                        fn ($period) => $this->formatUnavailablePeriod($period),
                        $this->schedule->getUnavailablePeriods(date('Y-m-d'))
                    )
                ]);

            } catch (Throwable $e) {
                json_response([
                    'success' => false,
                    'message' => 'Failed to retrieve unavailable periods.'
                ]);
            }
        }

        // A period without start and end times blocks the whole date.
        public function addUnavailablePeriod(): void {
            if (!$this->isAdmin()) {
                json_response([
                    'success' => false,
                    'message' => 'Only admins can mark dates as unavailable.'
                ]);
                return;
            }

            $data = get_json_input();

            $date = trim($data['date'] ?? '');
            $wholeDay = !empty($data['wholeDay']);
            $startTime = $wholeDay ? null : $this->parseTime($data['startTime'] ?? '');
            $endTime = $wholeDay ? null : $this->parseTime($data['endTime'] ?? '');
            $reason = mb_substr(trim($data['reason'] ?? ''), 0, 255);

            if (!$this->isValidDate($date) || $date < date('Y-m-d')) {
                json_response([
                    'success' => false,
                    'message' => 'Please select today or a future date.'
                ]);
                return;
            }

            if (!$wholeDay && ($startTime === null || $endTime === null || $startTime >= $endTime)) {
                json_response([
                    'success' => false,
                    'message' => 'Please provide a start time and a later end time, or mark the whole day.'
                ]);
                return;
            }

            try {
                $id = $this->schedule->addUnavailablePeriod(
                    $date,
                    $wholeDay ? null : $startTime . ':00',
                    $wholeDay ? null : $endTime . ':00',
                    $reason
                );

                // Existing bookings are not changed, but the admin is told about them.
                $start = $wholeDay ? 0 : $this->toMinutes($startTime);
                $end = $wholeDay ? 24 * 60 : $this->toMinutes($endTime);
                $affected = count(array_filter(
                    $this->appointment->getScheduledByDate($date),
                    fn ($scheduled) => $this->overlaps($start, $end, $this->toMinutes($scheduled['appointment_time']), $this->toMinutes($scheduled['appointment_time']) + (int) $scheduled['duration_minutes'])
                ));

                json_response([
                    'success' => true,
                    'message' => $affected > 0
                        ? 'Period marked as unavailable. ' . $affected . ' pending or approved appointment(s) already fall in this period and were not changed.'
                        : 'Period marked as unavailable.',
                    'period' => [
                        'id' => $id,
                        'date' => $date,
                        'startTime' => $startTime,
                        'endTime' => $endTime,
                        'reason' => $reason
                    ]
                ]);

            } catch (Throwable $e) {
                json_response([
                    'success' => false,
                    'message' => 'Failed to save the unavailable period.'
                ]);
            }
        }

        public function deleteUnavailablePeriod(): void {
            if (!$this->isAdmin()) {
                json_response([
                    'success' => false,
                    'message' => 'Only admins can remove unavailable periods.'
                ]);
                return;
            }

            $data = get_json_input();
            $id = (int) ($data['id'] ?? 0);

            try {
                if ($id <= 0 || !$this->schedule->deleteUnavailablePeriod($id)) {
                    json_response([
                        'success' => false,
                        'message' => 'Unavailable period not found.'
                    ]);
                    return;
                }

                json_response([
                    'success' => true,
                    'message' => 'Unavailable period removed.'
                ]);

            } catch (Throwable $e) {
                json_response([
                    'success' => false,
                    'message' => 'Failed to remove the unavailable period.'
                ]);
            }
        }

        // SCHEDULING RULES
        // Reads the settings and type rules from the database. Nothing is assumed:
        // a NULL value is reported in 'missing' and blocks booking.
        private function loadScheduling(): array {
            $row = $this->schedule->getSettings() ?? [];

            $settings = [
                'open' => $this->nullableMinutes($row['open_time'] ?? null),
                'close' => $this->nullableMinutes($row['close_time'] ?? null),
                'interval' => $this->nullableInt($row['slot_interval_minutes'] ?? null),
                'split' => $this->nullableMinutes($row['half_day_split_time'] ?? null),
                'capacity' => $this->nullableInt($row['visitor_capacity'] ?? null)
            ];

            $missing = [];

            if ($settings['open'] === null) $missing[] = 'scheduling_settings.open_time';
            if ($settings['close'] === null) $missing[] = 'scheduling_settings.close_time';
            if ($settings['interval'] === null || $settings['interval'] <= 0) $missing[] = 'scheduling_settings.slot_interval_minutes';
            if ($settings['capacity'] === null || $settings['capacity'] <= 0) $missing[] = 'scheduling_settings.visitor_capacity';

            if ($settings['open'] !== null && $settings['close'] !== null && $settings['open'] >= $settings['close']) {
                $missing[] = 'scheduling_settings.close_time (must be later than open_time)';
            }

            $settingsReady = empty($missing);
            $splitReady = $settingsReady
                && $settings['split'] !== null
                && $settings['split'] > $settings['open']
                && $settings['split'] < $settings['close'];

            $types = [];

            foreach ($this->schedule->getTypeRules() as $rule) {
                $purpose = $rule['purpose'];
                $isActive = (bool) $rule['is_active'];
                $durations = array_values(array_intersect(self::DURATION_TYPES, $this->splitList($rule['allowed_durations'])));
                $days = array_values(array_filter(
                    array_map('intval', $this->splitList($rule['allowed_days'])),
                    fn ($day) => $day >= 1 && $day <= 7
                ));

                $type = [
                    'purpose' => $purpose,
                    'isActive' => $isActive,
                    'allowedDurations' => $durations,
                    'minDuration' => $this->nullableInt($rule['min_duration_minutes']),
                    'maxDuration' => $this->nullableInt($rule['max_duration_minutes']),
                    'allowedDays' => $days,
                    'minAdvanceHours' => $this->nullableInt($rule['min_advance_hours']),
                    'maxVisitors' => $this->nullableInt($rule['max_visitors'])
                ];

                $typeMissing = [];

                if (empty($durations)) $typeMissing[] = 'allowed_durations';
                if (empty($days)) $typeMissing[] = 'allowed_days';
                if ($type['minAdvanceHours'] === null || $type['minAdvanceHours'] < 0) $typeMissing[] = 'min_advance_hours';
                if ($type['maxVisitors'] === null || $type['maxVisitors'] <= 0) $typeMissing[] = 'max_visitors';

                if ($isActive) {
                    foreach ($typeMissing as $column) {
                        $missing[] = 'appointment_type_rules.' . $column . ' (' . $purpose . ')';
                    }
                }

                if ($isActive && in_array('half_day', $durations, true) && !$splitReady) {
                    $typeMissing[] = 'half_day_split_time';
                    $missing[] = 'scheduling_settings.half_day_split_time (between open_time and close_time, needed for half_day on ' . $purpose . ')';
                }

                $type['configured'] = $isActive && $settingsReady && empty($typeMissing);
                $types[$purpose] = $type;
            }

            if (empty($types)) {
                $missing[] = 'appointment_type_rules (no appointment types)';
            } elseif (empty(array_filter($types, fn ($type) => $type['isActive']))) {
                $missing[] = 'appointment_type_rules (no active visit types)';
            }

            $configured = $settingsReady && count(array_filter($types, fn ($type) => $type['configured'])) > 0;

            return [
                'configured' => $configured,
                'settingsReady' => $settingsReady,
                'missing' => array_values(array_unique($missing)),
                'settings' => $settings,
                'types' => $types
            ];
        }

        // Returns an error message when the requested range breaks a rule or is not available, otherwise null.
        // $excludeId leaves out the appointment that is being rescheduled.
        private function validateSchedule(array $scheduling, string $date, string $startTime, string $endTime, string $purpose, int $visitors, ?int $excludeId = null): ?string {
            $settings = $scheduling['settings'];
            $rule = $scheduling['types'][$purpose] ?? null;

            if (!$scheduling['settingsReady']) {
                return self::NOT_CONFIGURED_MESSAGE;
            }

            if (!$rule) {
                return 'Please select a valid visit purpose.';
            }

            if (!$rule['configured']) {
                return 'Booking for ' . $purpose . ' has not been configured yet. Please contact the farm.';
            }

            $start = $this->toMinutes($startTime);
            $end = $this->toMinutes($endTime);

            if ($start >= $end) {
                return 'The end time must be later than the start time.';
            }

            if ($start < $settings['open'] || $end > $settings['close']) {
                return 'Visits must be within operating hours (' . $this->displayMinutes($settings['open']) . ' - ' . $this->displayMinutes($settings['close']) . ').';
            }

            $matchesDuration = false;

            foreach ($rule['allowedDurations'] as $durationType) {
                if ($this->matchesDurationType($durationType, $start, $end, $settings)) {
                    $matchesDuration = true;
                    break;
                }
            }

            if (!$matchesDuration) {
                return 'The selected time range is not an allowed duration for ' . $purpose . ' ('
                    . implode(', ', array_map(fn ($type) => str_replace('_', '-', $type), $rule['allowedDurations'])) . ').';
            }

            $duration = $end - $start;

            if ($rule['minDuration'] !== null && $duration < $rule['minDuration']) {
                return $purpose . ' must be at least ' . $this->formatDuration($rule['minDuration']) . ' long.';
            }

            if ($rule['maxDuration'] !== null && $duration > $rule['maxDuration']) {
                return $purpose . ' can be at most ' . $this->formatDuration($rule['maxDuration']) . ' long.';
            }

            $appointmentDate = DateTime::createFromFormat('!Y-m-d', $date);

            if (!in_array((int) $appointmentDate->format('N'), $rule['allowedDays'], true)) {
                return $purpose . ' visits are not available on ' . $appointmentDate->format('l') . 's.';
            }

            $startsAt = DateTime::createFromFormat('Y-m-d H:i', $date . ' ' . $startTime);
            $earliest = new DateTime();

            if ($rule['minAdvanceHours'] > 0) {
                $earliest->modify('+' . $rule['minAdvanceHours'] . ' hours');
            }

            if ($startsAt <= $earliest) {
                return $rule['minAdvanceHours'] > 0
                    ? $purpose . ' must be booked at least ' . $rule['minAdvanceHours'] . ' hour(s) in advance.'
                    : 'The selected time has already passed. Please choose a later time.';
            }

            if ($visitors > $rule['maxVisitors']) {
                return 'A maximum of ' . $rule['maxVisitors'] . ' visitors is allowed for ' . $purpose . '.';
            }

            if ($visitors > $settings['capacity']) {
                return 'A maximum of ' . $settings['capacity'] . ' visitors can be on the farm at the same time.';
            }

            foreach ($this->schedule->getUnavailableByDate($date) as $period) {
                $reason = $period['reason'] !== '' ? ' (' . $period['reason'] . ')' : '';

                if ($period['start_time'] === null) {
                    return 'The farm is not accepting visits on this date' . $reason . '. Please choose another date.';
                }

                $periodStart = $this->toMinutes($period['start_time']);
                $periodEnd = $this->toMinutes($period['end_time']);

                if ($this->overlaps($start, $end, $periodStart, $periodEnd)) {
                    return 'The farm is unavailable from ' . $this->displayMinutes($periodStart) . ' to '
                        . $this->displayMinutes($periodEnd) . $reason . '. Please choose another time.';
                }
            }

            // Overlapping bookings are allowed while the visitors on the farm at any moment stay within capacity.
            $overlapping = [];

            foreach ($this->appointment->getScheduledByDate($date) as $scheduled) {
                if ($excludeId !== null && (int) $scheduled['id'] === $excludeId) continue;

                $scheduledStart = $this->toMinutes($scheduled['appointment_time']);
                $scheduledEnd = $scheduledStart + (int) $scheduled['duration_minutes'];

                if ($this->overlaps($start, $end, $scheduledStart, $scheduledEnd)) {
                    $overlapping[] = ['start' => $scheduledStart, 'end' => $scheduledEnd, 'visitors' => (int) $scheduled['visitors']];
                }
            }

            // The busiest moment is at the new start or where an overlapping visit begins.
            $points = [$start];

            foreach ($overlapping as $scheduled) {
                if ($scheduled['start'] > $start) $points[] = $scheduled['start'];
            }

            $peakVisitors = 0;

            foreach ($points as $point) {
                $visitorsAtPoint = 0;

                foreach ($overlapping as $scheduled) {
                    if ($scheduled['start'] <= $point && $point < $scheduled['end']) {
                        $visitorsAtPoint += $scheduled['visitors'];
                    }
                }

                $peakVisitors = max($peakVisitors, $visitorsAtPoint);
            }

            if ($peakVisitors + $visitors > $settings['capacity']) {
                $spotsLeft = max(0, $settings['capacity'] - $peakVisitors);

                return $spotsLeft > 0
                    ? 'Only ' . $spotsLeft . ' visitor spot(s) are left during the selected time. Please choose another time or fewer visitors.'
                    : 'The selected time is fully booked. Please choose another time.';
            }

            return null;
        }

        // hourly: whole hours starting on a slot; half_day: open-split or split-close; whole_day: open-close.
        private function matchesDurationType(string $durationType, int $start, int $end, array $settings): bool {
            switch ($durationType) {
                case 'hourly':
                    return ($start - $settings['open']) % $settings['interval'] === 0
                        && ($end - $start) % 60 === 0;
                case 'half_day':
                    return $settings['split'] !== null && (
                        ($start === $settings['open'] && $end === $settings['split']) ||
                        ($start === $settings['split'] && $end === $settings['close'])
                    );
                case 'whole_day':
                    return $start === $settings['open'] && $end === $settings['close'];
            }

            return false;
        }

        private function overlaps(int $start, int $end, int $otherStart, int $otherEnd): bool {
            return $start < $otherEnd && $end > $otherStart;
        }

        private function formatSettings(array $settings): array {
            return [
                'openTime' => $settings['open'] === null ? null : $this->minutesToTime($settings['open']),
                'closeTime' => $settings['close'] === null ? null : $this->minutesToTime($settings['close']),
                'slotInterval' => $settings['interval'],
                'halfDaySplitTime' => $settings['split'] === null ? null : $this->minutesToTime($settings['split']),
                'visitorCapacity' => $settings['capacity']
            ];
        }

        private function formatUnavailablePeriod(array $period): array {
            return [
                'id' => (int) $period['id'],
                'date' => $period['unavailable_date'],
                'startTime' => $period['start_time'] === null ? null : substr($period['start_time'], 0, 5),
                'endTime' => $period['end_time'] === null ? null : substr($period['end_time'], 0, 5),
                'reason' => $period['reason']
            ];
        }

        private function isAdmin(): bool {
            return ($_SESSION['user_type'] ?? '') === 'admin';
        }

        private function isValidDate(string $date): bool {
            $parsedDate = DateTime::createFromFormat('!Y-m-d', $date);

            return $parsedDate && $parsedDate->format('Y-m-d') === $date;
        }

        // Accepts a 24-hour time (HH:MM) and returns it as HH:MM, or null when invalid.
        private function parseTime($time): ?string {
            $parsedTime = DateTime::createFromFormat('!H:i', trim((string) $time));

            return $parsedTime && $parsedTime->format('H:i') === trim((string) $time) ? $parsedTime->format('H:i') : null;
        }

        private function splitList(?string $list): array {
            return array_values(array_filter(array_map('trim', explode(',', (string) $list)), fn ($item) => $item !== ''));
        }

        private function nullableInt($value): ?int {
            return $value === null || $value === '' ? null : (int) $value;
        }

        private function nullableMinutes(?string $time): ?int {
            return $time === null || $time === '' ? null : $this->toMinutes($time);
        }

        // Accepts HH:MM or HH:MM:SS.
        private function toMinutes(string $time): int {
            [$hours, $minutes] = array_map('intval', explode(':', $time));

            return $hours * 60 + $minutes;
        }

        private function minutesToTime(int $minutes): string {
            return sprintf('%02d:%02d', intdiv($minutes, 60), $minutes % 60);
        }

        private function displayMinutes(int $minutes): string {
            return $this->formatTime($this->minutesToTime($minutes) . ':00');
        }

        private function formatDuration(int $minutes): string {
            $hours = intdiv($minutes, 60);
            $remainingMinutes = $minutes % 60;

            if ($hours === 0) return $remainingMinutes . ' minutes';
            if ($remainingMinutes === 0) return $hours === 1 ? '1 hour' : $hours . ' hours';

            return $hours . ' hr ' . $remainingMinutes . ' min';
        }

        // Converts a database TIME (e.g. 13:00:00) to the display format used by the front end (e.g. 01:00 PM).
        private function formatTime(string $time): string {
            $formattedTime = DateTime::createFromFormat('H:i:s', $time);

            return $formattedTime ? $formattedTime->format('h:i A') : $time;
        }

        private function formatEndTime(string $time, int $duration): string {
            $endTime = DateTime::createFromFormat('H:i:s', $time);

            if (!$endTime) {
                return $time;
            }

            $endTime->modify('+' . $duration . ' minutes');

            return $endTime->format('h:i A');
        }
    }
?>
