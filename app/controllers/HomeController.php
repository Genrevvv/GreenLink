<?php
    class HomeController {
        public function index() {
            if (isset($_SESSION['username']) && isset($_SESSION['user_id'])) {
                $this->app();
                return;
            }

            require ROOT . '/public/index.html';
        }

        public function app(): void {
            if (!isset($_SESSION['username'], $_SESSION['user_id'])) {
                header('Location: /login');
                exit;
            }

            require ROOT . '/public/home.html';
        }
    }
?>