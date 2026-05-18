<?php

namespace App\Controllers;

use App\Database;
use App\Response;
use App\Serializer;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

class ObjectsController extends BaseController
{
    public function show(array $vars): void
    {
        if (!$userId = $this->requireAuth()) return;

        $obj = Database::get()->objects->findOne([
            '_id'    => new ObjectId($vars['id']),
            'userId' => new ObjectId($userId),
        ]);

        if (!$obj) {
            Response::error('Not found', 404);
            return;
        }

        Response::json(Serializer::doc($obj));
    }

    public function update(array $vars): void
    {
        if (!$userId = $this->requireAuth()) return;

        $fields = $this->validateObjectFields($this->body());
        if ($fields === null) return;

        $obj = Database::get()->objects->findOneAndUpdate(
            ['_id' => new ObjectId($vars['id']), 'userId' => new ObjectId($userId)],
            ['$set' => array_merge($fields, ['updatedAt' => new UTCDateTime()])],
            ['returnDocument' => \MongoDB\Operation\FindOneAndUpdate::RETURN_DOCUMENT_AFTER]
        );

        if (!$obj) {
            Response::error('Not found', 404);
            return;
        }

        Response::json(Serializer::doc($obj));
    }

    public function delete(array $vars): void
    {
        if (!$userId = $this->requireAuth()) return;

        $result = Database::get()->objects->deleteOne([
            '_id'    => new ObjectId($vars['id']),
            'userId' => new ObjectId($userId),
        ]);

        if ($result->getDeletedCount() === 0) {
            Response::error('Not found', 404);
            return;
        }

        Response::json(['ok' => true]);
    }
}
