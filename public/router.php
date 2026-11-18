<?php
    $requestPath = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');
    $filePath = realpath(__DIR__ . DIRECTORY_SEPARATOR . ltrim(
        str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $requestPath),
        DIRECTORY_SEPARATOR
    ));
    $publicRoot = realpath(__DIR__);

    if (
        $filePath !== false &&
        $publicRoot !== false &&
        strpos($filePath, $publicRoot . DIRECTORY_SEPARATOR) === 0 &&
        is_file($filePath)
    ) {
        return false;
    }

    require __DIR__ . '/index.php';
?>
