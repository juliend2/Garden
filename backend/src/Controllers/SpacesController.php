<?php

namespace App\Controllers;

use App\Database;
use App\Response;
use App\Serializer;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

class SpacesController extends BaseController
{
    public function index(array $vars): void
    {
        if (!$userId = $this->requireAuth()) return;

        $spaces = Database::get()->spaces->find(
            ['userId' => new ObjectId($userId)],
            ['sort' => ['createdAt' => -1]]
        );

        Response::json(array_map([Serializer::class, 'doc'], iterator_to_array($spaces)));
    }

    public function create(array $vars): void
    {
        if (!$userId = $this->requireAuth()) return;

        $body = $this->body();
        if (empty($body['name'])) {
            Response::error('name is required');
            return;
        }

        $now = new UTCDateTime();
        $db  = Database::get();

        $result = $db->spaces->insertOne([
            'name'      => $body['name'],
            'userId'    => new ObjectId($userId),
            'createdAt' => $now,
            'updatedAt' => $now,
        ]);

        $space = $db->spaces->findOne(['_id' => $result->getInsertedId()]);
        Response::json(Serializer::doc($space), 201);
    }

    public function show(array $vars): void
    {
        if (!$userId = $this->requireAuth()) return;

        $space = Database::get()->spaces->findOne([
            '_id'    => new ObjectId($vars['id']),
            'userId' => new ObjectId($userId),
        ]);

        if (!$space) {
            Response::error('Not found', 404);
            return;
        }

        Response::json(Serializer::doc($space));
    }

    public function update(array $vars): void
    {
        if (!$userId = $this->requireAuth()) return;

        $body = $this->body();
        if (empty($body['name'])) {
            Response::error('name is required');
            return;
        }

        $space = Database::get()->spaces->findOneAndUpdate(
            ['_id' => new ObjectId($vars['id']), 'userId' => new ObjectId($userId)],
            ['$set' => ['name' => $body['name'], 'updatedAt' => new UTCDateTime()]],
            ['returnDocument' => \MongoDB\Operation\FindOneAndUpdate::RETURN_DOCUMENT_AFTER]
        );

        if (!$space) {
            Response::error('Not found', 404);
            return;
        }

        Response::json(Serializer::doc($space));
    }

    public function delete(array $vars): void
    {
        if (!$userId = $this->requireAuth()) return;

        $db     = Database::get();
        $spaceId = new ObjectId($vars['id']);
        $result = $db->spaces->deleteOne(['_id' => $spaceId, 'userId' => new ObjectId($userId)]);

        if ($result->getDeletedCount() === 0) {
            Response::error('Not found', 404);
            return;
        }

        $db->objects->deleteMany(['spaceId' => $spaceId]);

        Response::json(['ok' => true]);
    }

    public function objects(array $vars): void
    {
        if (!$userId = $this->requireAuth()) return;

        $db      = Database::get();
        $spaceId = new ObjectId($vars['id']);

        $space = $db->spaces->findOne(['_id' => $spaceId, 'userId' => new ObjectId($userId)]);
        if (!$space) {
            Response::error('Not found', 404);
            return;
        }

        $objects = $db->objects->find(
            ['spaceId' => $spaceId],
            ['sort' => ['createdAt' => -1]]
        );

        Response::json(array_map([Serializer::class, 'doc'], iterator_to_array($objects)));
    }

    public function createObject(array $vars): void
    {
        if (!$userId = $this->requireAuth()) return;

        $db      = Database::get();
        $spaceId = new ObjectId($vars['id']);

        $space = $db->spaces->findOne(['_id' => $spaceId, 'userId' => new ObjectId($userId)]);
        if (!$space) {
            Response::error('Not found', 404);
            return;
        }

        $body = $this->body();
        unset($body['_id'], $body['spaceId'], $body['userId'], $body['createdAt'], $body['updatedAt']);

        $now    = new UTCDateTime();
        $result = $db->objects->insertOne(array_merge($body, [
            'spaceId'   => $spaceId,
            'userId'    => new ObjectId($userId),
            'createdAt' => $now,
            'updatedAt' => $now,
        ]));

        $object = $db->objects->findOne(['_id' => $result->getInsertedId()]);
        Response::json(Serializer::doc($object), 201);
    }
}
