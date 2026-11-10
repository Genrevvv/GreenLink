<?php
    class AppointmentController {
        private Appointment $appointment;

        private const PURPOSES = ['Farm Tour', 'Educational Visit', 'Training Inquiry', 'Other'];
        private const STATUSES = ['Pending', 'Approved', 'Rejected'];

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
                !in_array($purpose, self::PURPOSES, true) ||
                $visitors < 1
            ) {
                json_response([
                    'success' => false,
                    'message' => 'Please provide a valid date, time, purpose and number of visitors.'
                ]);
                return;
            }

            try {
                $appointmentId = $this->appointment->addAppointment(
                    $userId,
                    $date,
                    $appointmentTime->format('H:i:s'),
                    $purpose,
                    $visitors,
                    $notes
                );

                json_response([
                    'success' => true,
                    'message' => 'Appointment request submitted successfully.',
                    'id' => $appointmentId
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

            if ($id <= 0 || !in_array($status, self::STATUSES, true)) {
                json_response([
                    'success' => false,
                    'message' => 'Please provide a valid appointment and status.'
                ]);
                return;
            }

            try {
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

        // Converts a database TIME (e.g. 13:00:00) to the display format used by the front end (e.g. 01:00 PM).
        private function formatTime(string $time): string {
            $formattedTime = DateTime::createFromFormat('H:i:s', $time);

            return $formattedTime ? $formattedTime->format('h:i A') : $time;
        }
    }
?>
