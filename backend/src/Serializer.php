<?php

namespace App;

use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

class Serializer
{
    public static function doc(mixed $doc): mixed
    {
        if ($doc instanceof ObjectId) {
            return (string) $doc;
        }
        if ($doc instanceof UTCDateTime) {
            return $doc->toDateTime()->format(\DateTime::ATOM);
        }
        if (is_array($doc) || $doc instanceof \Traversable) {
            $result = [];
            foreach ($doc as $k => $v) {
                $result[$k] = static::doc($v);
            }
            return $result;
        }
        return $doc;
    }
}
