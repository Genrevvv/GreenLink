<?php
    session_start();

    define('ROOT', dirname(__DIR__));
    
    require_once ROOT . '/app/autoload.php';

    $db_config = require ROOT . '/config/config.php';
    $db = new Database($db_config);

    $user = new User($db);
    $product = new Product($db);
    $dashboard = new Dashboard($db);
    $appointment = new Appointment($db);
    $inquiry = new Inquiry($db);

    $authController = new AuthController($user);
    $homeController = new HomeController();
    $productController = new ProductController($product);
    $dashboardController = new DashboardController($dashboard);
    $appointmentController = new AppointmentController($appointment);
    $inquiryController = new InquiryController($inquiry);

    $router = new Router;

    $router->get('/', [$homeController, 'index']);

    // Auth
    $router->get('/login', [$authController, 'renderLogin']);
    $router->post('/login', [$authController, 'login']);

    $router->get('/register', [$authController, 'renderRegister']);
    $router->post('/register', [$authController, 'register']);

    $router->post('/logout', [$authController, 'logout']);

    // Products
    $router->get('/products', [$productController, 'getAll']);

    $router->post('/products/addProduct', [$productController, 'addProduct']);
    $router->post('/products/updateProduct', [$productController, 'updateProduct']);

    $router->post('/products/updateStockStatus', [$productController, 'updateStockStatus']);
    $router->post('/products/updateArchiveStatus', [$productController, 'updateArchiveStatus']);

    // Dashboard
    $router->get('/dashboard/admin', [$dashboardController, 'getAdminDashboard']);
    $router->get('/dashboard/user', [$dashboardController, 'getUserDashboard']);

    // Appointments
    $router->get('/appointments', [$appointmentController, 'getAll']);
    $router->get('/appointments/user', [$appointmentController, 'getByUser']);

    $router->post('/appointments/addAppointment', [$appointmentController, 'addAppointment']);
    $router->post('/appointments/updateStatus', [$appointmentController, 'updateStatus']);

    // Inquiries
    $router->get('/inquiries', [$inquiryController, 'getAll']);
    $router->get('/inquiries/user', [$inquiryController, 'getByUser']);

    $router->post('/inquiries/addInquiry', [$inquiryController, 'addInquiry']);
    $router->post('/inquiries/replyInquiry', [$inquiryController, 'replyInquiry']);

    $router->dispatch(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
?>