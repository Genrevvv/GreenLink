<?php
class Router {
    private $routes = [];

    public function get($path, $handler) {
        $this->routes['GET'][$path] = $handler;
    }

    public function post($path, $handler) {
        $this->routes['POST'][$path] = $handler;
    }

    public function dispatch($path) {
        $method = $_SERVER['REQUEST_METHOD'];

        if (!isset($this->routes[$method][$path])) {
            http_response_code(404);
            echo 'Page not found';
            return;
        }

        $handler = $this->routes[$method][$path];

        if (is_callable($handler)) {
            $handler();
        }
    }
}
?>