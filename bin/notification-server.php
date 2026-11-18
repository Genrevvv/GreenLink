<?php
    define('ROOT', dirname(__DIR__));

    require ROOT . '/vendor/autoload.php';
    require ROOT . '/app/autoload.php';

    $dbConfig = require ROOT . '/config/config.php';
    $db = new Database($dbConfig);
    $notification = new Notification($db);

    $server = Ratchet\Server\IoServer::factory(
        new Ratchet\Http\HttpServer(
            new Ratchet\WebSocket\WsServer(
                new NotificationWebSocket(
                    $notification,
                    React\EventLoop\Loop::get(),
                    $dbConfig['app_origin']
                )
            )
        ),
        8080,
        '127.0.0.1'
    );

    echo "GreenLink notification WebSocket listening on port 8080.\n";
    $server->run();
?>
