<?php

require_once __DIR__ . '/../vendor/autoload.php';

use FastRoute\RouteCollector;
use App\Controllers\AuthController;
use App\Controllers\SpacesController;
use App\Controllers\ObjectsController;

session_start();

$dispatcher = FastRoute\simpleDispatcher(function (RouteCollector $r) {
    $r->addRoute('GET',    '/api/auth/login',           [AuthController::class,   'login']);
    $r->addRoute('GET',    '/api/auth/callback',        [AuthController::class,   'callback']);
    $r->addRoute('POST',   '/api/auth/logout',          [AuthController::class,   'logout']);
    $r->addRoute('GET',    '/api/auth/me',              [AuthController::class,   'me']);

    $r->addRoute('GET',    '/api/spaces',               [SpacesController::class, 'index']);
    $r->addRoute('POST',   '/api/spaces',               [SpacesController::class, 'create']);
    $r->addRoute('GET',    '/api/spaces/{id}',          [SpacesController::class, 'show']);
    $r->addRoute('PATCH',  '/api/spaces/{id}',          [SpacesController::class, 'update']);
    $r->addRoute('DELETE', '/api/spaces/{id}',          [SpacesController::class, 'delete']);
    $r->addRoute('GET',    '/api/spaces/{id}/objects',  [SpacesController::class, 'objects']);
    $r->addRoute('POST',   '/api/spaces/{id}/objects',  [SpacesController::class, 'createObject']);
    $r->addRoute('POST',   '/api/spaces/{id}/objects/reorder', [SpacesController::class, 'reorderObjects']);

    $r->addRoute('GET',    '/api/objects/{id}',         [ObjectsController::class, 'show']);
    $r->addRoute('PATCH',  '/api/objects/{id}',         [ObjectsController::class, 'update']);
    $r->addRoute('DELETE', '/api/objects/{id}',         [ObjectsController::class, 'delete']);
});

$method = $_SERVER['REQUEST_METHOD'];
$uri    = strtok($_SERVER['REQUEST_URI'], '?');

if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $route = $dispatcher->dispatch($method, $uri);

    switch ($route[0]) {
        case FastRoute\Dispatcher::NOT_FOUND:
            header('Content-Type: application/json');
            http_response_code(404);
            echo json_encode(['error' => 'Not found']);
            break;
        case FastRoute\Dispatcher::METHOD_NOT_ALLOWED:
            header('Content-Type: application/json');
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
        case FastRoute\Dispatcher::FOUND:
            [$class, $action] = $route[1];
            (new $class())->$action($route[2]);
            break;
    }
} catch (\Throwable $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}
