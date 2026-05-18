<?php

namespace App;

class Response
{
    public static function json(mixed $data, int $status = 200): void
    {
        header('Content-Type: application/json');
        http_response_code($status);
        echo json_encode($data);
    }

    public static function error(string $message, int $status = 400): void
    {
        self::json(['error' => $message], $status);
    }
}
