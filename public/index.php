<?php
    session_start();

    define('ROOT', dirname(__DIR__));
    
    require_once ROOT . '/app/autoload.php';

    $db_config = require ROOT . '/config/config.php';
    $db = new Database($db_config);

    $user = new User($db);
    $product = new Product($db);
    $dashboard = new Dashboard($db);
    $notification = new Notification($db);
    $appointment = new Appointment($db, $notification);
    $schedule = new Schedule($db);
    $inquiry = new Inquiry($db, $notification);

    $authController = new AuthController($user);
    $profileController = new ProfileController($user);
    $homeController = new HomeController();
    $productController = new ProductController($product);
    $dashboardController = new DashboardController($dashboard);
    $appointmentController = new AppointmentController($appointment, $schedule);
    $inquiryController = new InquiryController($inquiry);
    $notificationController = new NotificationController($notification);

    $router = new Router;

    $router->get('/', [$homeController, 'index']);

    // Single-page application routes
    $router->get('/dashboard', [$homeController, 'app']);
    $router->get('/products', [$homeController, 'app']);
    $router->get('/appointments', [$homeController, 'app']);
    $router->get('/inquiries', [$homeController, 'app']);
    $router->get('/profile', [$homeController, 'app']);

    // Auth
    $router->get('/login', [$authController, 'renderLogin']);
    $router->post('/api/login', [$authController, 'login']);

    $router->get('/register', [$authController, 'renderRegister']);
    $router->post('/api/register', [$authController, 'register']);

    // Forgot Password
    $router->get('/forgot-password', [$authController, 'renderForgotPassword']);
    $router->post('/api/forgot-password', [$authController, 'sendPasswordReset']);

    // Reset Password
    $router->get('/reset-password', [$authController, 'renderResetPassword']);
    $router->post('/api/reset-password', [$authController, 'resetPassword']);

    $router->post('/api/logout', [$authController, 'logout']);

    // Account profile API
    $router->get('/api/profile', [$profileController, 'getProfile']);
    $router->post('/api/profile/username', [$profileController, 'changeUsername']);
    $router->post('/api/profile/email', [$profileController, 'changeEmail']);
    $router->post('/api/profile/password', [$profileController, 'changePassword']);
    $router->post('/api/profile/delete', [$profileController, 'deleteAccount']);

    // Products API
    $router->get('/api/products', [$productController, 'getAll']);

    $router->post('/api/products/addProduct', [$productController, 'addProduct']);
    $router->post('/api/products/updateProduct', [$productController, 'updateProduct']);

    $router->post('/api/products/updateStockStatus', [$productController, 'updateStockStatus']);
    $router->post('/api/products/updateArchiveStatus', [$productController, 'updateArchiveStatus']);

    // Dashboard API
    $router->get('/api/dashboard/admin', [$dashboardController, 'getAdminDashboard']);
    $router->get('/api/dashboard/user', [$dashboardController, 'getUserDashboard']);

    // Appointments API
    $router->get('/api/appointments', [$appointmentController, 'getAll']);
    $router->get('/api/appointments/user', [$appointmentController, 'getByUser']);
    $router->get('/api/appointments/schedule', [$appointmentController, 'getSchedule']);
    $router->post('/api/appointments/schedule/types', [$appointmentController, 'addVisitType']);
    $router->post('/api/appointments/schedule/settings', [$appointmentController, 'updateSchedulingSettings']);

    $router->post('/api/appointments/addAppointment', [$appointmentController, 'addAppointment']);
    $router->post('/api/appointments/updateStatus', [$appointmentController, 'updateStatus']);
    $router->post('/api/appointments/cancelAppointment', [$appointmentController, 'cancelAppointment']);
    $router->post('/api/appointments/rescheduleAppointment', [$appointmentController, 'rescheduleAppointment']);

    // Unavailable dates and time periods (admin)
    $router->get('/api/appointments/unavailable', [$appointmentController, 'getUnavailablePeriods']);
    $router->post('/api/appointments/unavailable/add', [$appointmentController, 'addUnavailablePeriod']);
    $router->post('/api/appointments/unavailable/delete', [$appointmentController, 'deleteUnavailablePeriod']);

    // Inquiries API
    $router->get('/api/inquiries', [$inquiryController, 'getAll']);
    $router->get('/api/inquiries/user', [$inquiryController, 'getByUser']);

    $router->post('/api/inquiries/addInquiry', [$inquiryController, 'addInquiry']);
    $router->post('/api/inquiries/replyInquiry', [$inquiryController, 'replyInquiry']);

    // Notifications API
    $router->get('/api/notifications', [$notificationController, 'getForCurrentUser']);
    $router->post('/api/notifications/read', [$notificationController, 'markRead']);
    $router->post('/api/notifications/read-all', [$notificationController, 'markAllRead']);

    $requestPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
    $router->dispatch(rtrim($requestPath, '/') ?: '/');
?>
