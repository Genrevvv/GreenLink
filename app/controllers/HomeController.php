<?php
    class HomeController {
        public function index() {
            if (isset($_SESSION['username']) && isset($_SESSION['user_id'])) {
                require ROOT . '/public/index.html';
                exit;
            }

            header('Location: /login');
        }
    }
?>