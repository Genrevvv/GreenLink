<?php
    function get_json_input(): array {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }

    function json_response(array $data): void {
        header('Content-Type: application/json');
        echo json_encode($data);
    }
?>