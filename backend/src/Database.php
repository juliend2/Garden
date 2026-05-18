<?php

namespace App;

use MongoDB\Client;
use MongoDB\Database as MongoDatabase;

class Database
{
    private static ?MongoDatabase $instance = null;

    public static function get(): MongoDatabase
    {
        if (self::$instance === null) {
            $client = new Client(getenv('MONGO_URI') ?: 'mongodb://mongo:27017');
            self::$instance = $client->selectDatabase(getenv('MONGO_DB') ?: 'objects_app');
        }
        return self::$instance;
    }
}
