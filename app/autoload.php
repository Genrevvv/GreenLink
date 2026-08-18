<?php
    spl_autoload_register(function ($class) {
        require_once ROOT . '/app/utils/http.php';

        $paths = [
            ROOT . '/app/core/' . $class . '.php',
            ROOT . '/app/models/' . $class . '.php',
            ROOT . '/app/controllers/' . $class . '.php',
        ];

        foreach ($paths as $path) {
            if (file_exists($path)) {
                require_once $path;
                return;
            }
        }
    });
?>