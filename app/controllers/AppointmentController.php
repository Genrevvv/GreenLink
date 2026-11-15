<?php
    class AppointmentController {
        private Appointment $appointment;

        // Estimated visit duration (in minutes) for each purpose.
        private const PURPOSE_DURATIONS = [
            'Farm Tour' => 120,
            'Educational Visit' => 120,
            'Training Inquiry' => 60,
            'Other' => 60
        ];

        private const STATUSES = ['Pending', 'Approved', 'Rejected', 'Cancelled'];

        // Which current statuses each new status can be set from.
        private const STATUS_TRANSITIONS = [
            'Approved' => ['Pending'],
            'Rejected' => ['Pending'],
            'Cancelled' => ['Pending', 'Approved']
        ];

        // Hourly start times. 12:00 PM is the lunch break.
        private const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

        // A visit must finish within the session it starts in.
        private const SESSIONS = [
            ['start' => '08:00', 'end' => '12:00'],
            ['start' => '13:00', 'end' => '17:00']
        ];

        private const MAX_VISITORS = 20;

        public function __construct(Appointment $appointment) {
            $this->appointment = $appointment;
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

        // Booked time slots (no customer details) and booking rules for the user calendar.
        public function getSchedule(): void {
            try {
                $scheduled = $this->appointment->getScheduled(date('Y-m-d'));

                $formattedSchedule = array_map(function ($appointment) {
                    return [
                        'date' => $appointment['appointment_date'],
                        'time' => $this->formatTime($appointment['appointment_time']),
                        'endTime' => $this->formatEndTime($appointment['appointment_time'], (int) $appointment['duration_minutes']),
                        'duration' => (int) $appointment['duration_minutes']
                    ];
                }, $scheduled);

                json_response([
                    'success' => true,
                    'schedule' => $formattedSchedule,
                    'settings' => [
                        'maxVisitors' => self::MAX_VISITORS,
                        'durations' => self::PURPOSE_DURATIONS,
                        'timeSlots' => array_map(fn ($slot) => $this->formatTime($slot . ':00'), self::TIME_SLOTS),
                        'sessions' => array_map(function ($session) {
                            return [
                                'start' => $this->formatTime($session['start'] . ':00'),
                                'end' => $this->formatTime($session['end'] . ':00')
                            ];
                        }, self::SESSIONS)
                    ]
                ]);

            } catch (Throwable $e) {
                json_response([
                    'success' => false,
                    'message' => 'Failed to retrieve the appointment schedule.'
                ]);
            }
        }

        public function addAppointment(): void {
            $data = get_json_input();

            $userId = (int) ($_SESSION['user_id'] ?? 0);
            $date = trim($data['date'] ?? '');
            $time = trim($data['time'] ?? '');
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

            $appointmentDate = DateTime::createFromFormat('!Y-m-d', $date);
            $appointmentTime = DateTime::createFromFormat('!h:i A', $time);

            if (
                !$appointmentDate ||
                $appointmentDate->format('Y-m-d') !== $date ||
                $date < date('Y-m-d') ||
                !$appointmentTime ||
                !array_key_exists($purpose, self::PURPOSE_DURATIONS) ||
                $visitors < 1
            ) {
                json_response([
                    'success' => false,
                    'message' => 'Please provide a valid date, time, purpose and number of visitors.'
                ]);
                return;
            }

            if ($visitors > self::MAX_VISITORS) {
                json_response([
                    'success' => false,
                    'message' => 'A maximum of ' . self::MAX_VISITORS . ' visitors is allowed per appointment.'
                ]);
                return;
            }

            $duration = self::PURPOSE_DURATIONS[$purpose];

            try {
                $slotError = $this->validateTimeSlot($date, $appointmentTime->format('H:i'), $duration, $purpose);

                if ($slotError !== null) {
                    json_response([
                        'success' => false,
                        'message' => $slotError
                    ]);
                    return;
                }

                $appointmentId = $this->appointment->addAppointment(
                    $userId,
                    $date,
                    $appointmentTime->format('H:i:s'),
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
                    'endTime' => $this->formatEndTime($appointmentTime->format('H:i:s'), $duration)
                ]);

            } catch (Throwable $e) {
                json_response([
                    'success' => false,
                    'message' => 'Failed to submit appointment request.'
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

        // Returns an error message when the requested slot is not allowed or not available, otherwise null.
        private function validateTimeSlot(string $date, string $startTime, int $duration, string $purpose): ?string {
            if (!in_array($startTime, self::TIME_SLOTS, true)) {
                return 'Please select one of the available time slots.';
            }

            $start = $this->toMinutes($startTime);
            $end = $start + $duration;

            if ($date === date('Y-m-d') && $start <= $this->toMinutes(date('H:i'))) {
                return 'The selected time has already passed. Please choose a later time slot.';
            }

            $fitsSession = false;

            foreach (self::SESSIONS as $session) {
                if ($start >= $this->toMinutes($session['start']) && $end <= $this->toMinutes($session['end'])) {
                    $fitsSession = true;
                    break;
                }
            }

            if (!$fitsSession) {
                return $purpose . ' takes about ' . $this->formatDuration($duration) . ', so it cannot start at '
                    . $this->formatTime($startTime . ':00') . '. Visits must end by 12:00 PM (lunch break) or 5:00 PM.';
            }

            foreach ($this->appointment->getScheduledByDate($date) as $scheduled) {
                $scheduledStart = $this->toMinutes(substr($scheduled['appointment_time'], 0, 5));
                $scheduledEnd = $scheduledStart + (int) $scheduled['duration_minutes'];

                if ($start < $scheduledEnd && $scheduledStart < $end) {
                    return 'The selected time overlaps with an already scheduled appointment ('
                        . $this->formatTime($scheduled['appointment_time']) . ' - '
                        . $this->formatEndTime($scheduled['appointment_time'], (int) $scheduled['duration_minutes'])
                        . '). Please choose another time slot.';
                }
            }

            return null;
        }

        private function toMinutes(string $time): int {
            [$hours, $minutes] = array_map('intval', explode(':', $time));

            return $hours * 60 + $minutes;
        }

        private function formatDuration(int $minutes): string {
            $hours = intdiv($minutes, 60);

            return $hours === 1 ? '1 hour' : $hours . ' hours';
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
