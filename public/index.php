<?php
    session_start();

    define('ROOT', dirname(__DIR__));
    
    require_once ROOT . '/app/autoload.php';

    $db_config = require ROOT . '/config/config.php';
    $db = new Database($db_config);

    $user = new User($db);
    $product = new Product($db);

    $authController = new AuthController($user);
    $homeController = new HomeController();
    $productController = new ProductController($product);

    $router = new Router;

    $router->get('/', [$homeController, 'index']);

    $router->get('/login', [$authController, 'renderLogin']);
    $router->post('/login', [$authController, 'login']);

    $router->get('/register', [$authController, 'renderRegister']);
    $router->post('/register', [$authController, 'register']);

    $router->post('/logout', [$authController, 'logout']);

    $router->get('/products', [$productController, 'getAll']);
    $router->post('/products/updateStockStatus', [$productController, 'updateStockStatus']);
    $router->post('/products/updateArchiveStatus', [$productController, 'updateArchiveStatus']);

    $router->dispatch(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
?>