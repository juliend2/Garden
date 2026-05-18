<?php

namespace App\Controllers;

use App\Response;

abstract class BaseController
{
    protected function requireAuth(): ?string
    {
        if (empty($_SESSION['user_id'])) {
            Response::error('Unauthenticated', 401);
            return null;
        }
        return $_SESSION['user_id'];
    }

    protected function body(): array
    {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }

    protected function validateObjectFields(array $body): ?array
    {
        $limits = ['text' => 1048576, 'color' => 100, 'url' => 1024];
        $out = [];
        foreach ($limits as $key => $max) {
            if (!array_key_exists($key, $body)) continue;
            $value = $body[$key];
            if (!is_string($value)) {
                Response::error("$key must be a string");
                return null;
            }
            if (mb_strlen($value) > $max) {
                Response::error("$key exceeds max length of $max characters");
                return null;
            }
            $out[$key] = $value;
        }
        return $out;
    }
}
