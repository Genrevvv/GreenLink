<?php
    class InquiryController {
        private Inquiry $inquiry;

        public function __construct(Inquiry $inquiry) {
            $this->inquiry = $inquiry;
        }

        public function getAll(): void {
            try {
                $inquiries = $this->inquiry->getAll();

                $formattedInquiries = array_map(function ($inquiry) {
                    return [
                        'id' => (int) $inquiry['id'],
                        'customer' => $inquiry['customer'],
                        'email' => $inquiry['email'] ?? '',
                        'subject' => $inquiry['subject'],
                        'message' => $inquiry['message'],
                        'response' => $inquiry['response'] ?? '',
                        'date' => substr($inquiry['created_at'], 0, 10),
                        'status' => $inquiry['status']
                    ];
                }, $inquiries);

                json_response([
                    'success' => true,
                    'inquiries' => $formattedInquiries
                ]);

            } catch (Throwable $e) {
                json_response([
                    'success' => false,
                    'message' => 'Failed to retrieve inquiries.'
                ]);
            }
        }

        public function getByUser(): void {
            $userId = (int) ($_SESSION['user_id'] ?? 0);

            if ($userId <= 0) {
                json_response([
                    'success' => false,
                    'message' => 'Please sign in to view your inquiries.'
                ]);
                return;
            }

            try {
                $inquiries = $this->inquiry->getByUser($userId);

                $formattedInquiries = array_map(function ($inquiry) {
                    return [
                        'id' => (int) $inquiry['id'],
                        'subject' => $inquiry['subject'],
                        'message' => $inquiry['message'],
                        'response' => $inquiry['response'] ?? '',
                        'date' => substr($inquiry['created_at'], 0, 10),
                        'status' => $inquiry['status']
                    ];
                }, $inquiries);

                json_response([
                    'success' => true,
                    'inquiries' => $formattedInquiries
                ]);

            } catch (Throwable $e) {
                json_response([
                    'success' => false,
                    'message' => 'Failed to retrieve inquiries.'
                ]);
            }
        }

        public function addInquiry(): void {
            $data = get_json_input();

            $userId = (int) ($_SESSION['user_id'] ?? 0);
            $subject = trim($data['subject'] ?? '');
            $message = trim($data['message'] ?? '');

            if ($userId <= 0) {
                json_response([
                    'success' => false,
                    'message' => 'Please sign in to submit an inquiry.'
                ]);
                return;
            }

            if ($subject === '' || $message === '') {
                json_response([
                    'success' => false,
                    'message' => 'Subject and message are required.'
                ]);
                return;
            }

            try {
                $inquiryId = $this->inquiry->addInquiry($userId, $subject, $message);

                json_response([
                    'success' => true,
                    'message' => 'Inquiry submitted successfully.',
                    'id' => $inquiryId,
                    'date' => date('Y-m-d')
                ]);

            } catch (Throwable $e) {
                json_response([
                    'success' => false,
                    'message' => 'Failed to submit inquiry.'
                ]);
            }
        }

        public function replyInquiry(): void {
            $data = get_json_input();

            $id = (int) ($data['id'] ?? 0);
            $response = trim($data['response'] ?? '');

            if ($id <= 0 || $response === '') {
                json_response([
                    'success' => false,
                    'message' => 'Please provide a reply message.'
                ]);
                return;
            }

            try {
                $this->inquiry->replyInquiry($id, $response);

                json_response([
                    'success' => true,
                    'message' => 'Reply sent successfully.'
                ]);

            } catch (Throwable $e) {
                json_response([
                    'success' => false,
                    'message' => 'Failed to send reply.'
                ]);
            }
        }
    }
?>
