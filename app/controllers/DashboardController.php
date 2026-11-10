<?php
    class DashboardController {
        private Dashboard $dashboard;

        private const UPCOMING_APPOINTMENTS_LIMIT = 4;
        private const PRODUCT_PREVIEW_LIMIT = 4;

        public function __construct(Dashboard $dashboard) {
            $this->dashboard = $dashboard;
        }

        public function getAdminDashboard(): void {
            try {
                $summary = $this->dashboard->getProductSummary();
                $outOfStockProducts = $this->dashboard->getOutOfStockProducts();
                $appointments = $this->dashboard->getUpcomingAppointments(self::UPCOMING_APPOINTMENTS_LIMIT);

                $formattedOutOfStockProducts = array_map(function ($product) {
                    return [
                        'id' => (int) $product['id'],
                        'name' => $product['name'],
                        'category' => $product['category']
                    ];
                }, $outOfStockProducts);

                $formattedAppointments = array_map(function ($appointment) {
                    return [
                        'id' => (int) $appointment['id'],
                        'customer' => $appointment['customer'],
                        'date' => $appointment['appointment_date'],
                        'time' => $this->formatTime($appointment['appointment_time']),
                        'purpose' => $appointment['purpose'],
                        'status' => $appointment['status']
                    ];
                }, $appointments);

                json_response([
                    'success' => true,
                    'summary' => [
                        'totalProducts' => (int) $summary['total_products'],
                        'inStock' => (int) $summary['in_stock'],
                        'outOfStock' => (int) $summary['out_of_stock']
                    ],
                    'outOfStockProducts' => $formattedOutOfStockProducts,
                    'upcomingAppointments' => $formattedAppointments
                ]);

            } catch (Throwable $e) {
                json_response([
                    'success' => false,
                    'message' => 'Failed to retrieve dashboard data.'
                ]);
            }
        }

        public function getUserDashboard(): void {
            $userId = (int) ($_SESSION['user_id'] ?? 0);

            if ($userId <= 0) {
                json_response([
                    'success' => false,
                    'message' => 'Please sign in to view your dashboard.'
                ]);
                return;
            }

            try {
                $appointments = $this->dashboard->getUserAppointments($userId);
                $inquiries = $this->dashboard->getUserInquiries($userId);
                $products = $this->dashboard->getActiveProducts(self::PRODUCT_PREVIEW_LIMIT);

                $formattedAppointments = array_map(function ($appointment) {
                    return [
                        'id' => (int) $appointment['id'],
                        'date' => $appointment['appointment_date'],
                        'time' => $this->formatTime($appointment['appointment_time']),
                        'purpose' => $appointment['purpose'],
                        'visitors' => (int) $appointment['visitors'],
                        'status' => $appointment['status']
                    ];
                }, $appointments);

                $formattedInquiries = array_map(function ($inquiry) {
                    return [
                        'id' => (int) $inquiry['id'],
                        'subject' => $inquiry['subject'],
                        'date' => substr($inquiry['created_at'], 0, 10),
                        'status' => $inquiry['status']
                    ];
                }, $inquiries);

                $formattedProducts = array_map(function ($product) {
                    return [
                        'id' => (int) $product['id'],
                        'name' => $product['name'],
                        'category' => $product['category'],
                        'inStock' => (bool) $product['in_stock']
                    ];
                }, $products);

                json_response([
                    'success' => true,
                    'appointments' => $formattedAppointments,
                    'inquiries' => $formattedInquiries,
                    'products' => $formattedProducts
                ]);

            } catch (Throwable $e) {
                json_response([
                    'success' => false,
                    'message' => 'Failed to retrieve dashboard data.'
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
