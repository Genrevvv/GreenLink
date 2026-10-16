<?php
    class HomeController {
        public function index() {
            if (isset($_SESSION['username']) && isset($_SESSION['user_id'])) {
                require ROOT . '/public/home.html';
                exit;
            }

            require ROOT . '/public/index.html';
        }
    }
?>