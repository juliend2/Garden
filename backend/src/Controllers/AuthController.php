<?php

namespace App\Controllers;

use App\Database;
use App\Response;
use App\Serializer;
use Jumbojett\OpenIDConnectClient;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

class AuthController extends BaseController
{
    private function oidc(): OpenIDConnectClient
    {
        $oidc = new OpenIDConnectClient(
            'https://accounts.google.com',
            getenv('GOOGLE_CLIENT_ID'),
            getenv('GOOGLE_CLIENT_SECRET')
        );
        $oidc->setRedirectURL(getenv('GOOGLE_REDIRECT_URI') ?: 'http://localhost:5173/api/auth/callback');
        $oidc->addScope(['openid', 'email', 'profile']);
        return $oidc;
    }

    public function login(array $vars): void
    {
        // authenticate() redirects to Google and exits when no code is present
        $this->oidc()->authenticate();
    }

    public function callback(array $vars): void
    {
        $oidc = $this->oidc();
        try {
            $oidc->authenticate();
        } catch (\Exception $e) {
            Response::error('Authentication failed: ' . $e->getMessage(), 401);
            return;
        }

        $googleId = $oidc->getVerifiedClaims('sub');
        $email    = $oidc->getVerifiedClaims('email');
        $name     = $oidc->getVerifiedClaims('name');

        $now  = new UTCDateTime();
        $user = Database::get()->users->findOneAndUpdate(
            ['googleId' => $googleId],
            [
                '$set'         => ['email' => $email, 'name' => $name, 'updatedAt' => $now],
                '$setOnInsert' => ['createdAt' => $now, 'googleId' => $googleId],
            ],
            ['upsert' => true, 'returnDocument' => \MongoDB\Operation\FindOneAndUpdate::RETURN_DOCUMENT_AFTER]
        );

        $_SESSION['user_id'] = (string) $user->_id;

        header('Location: ' . (getenv('FRONTEND_URL') ?: 'http://localhost:5173'));
        exit;
    }

    public function logout(array $vars): void
    {
        session_destroy();
        Response::json(['ok' => true]);
    }

    public function me(array $vars): void
    {
        if (!$userId = $this->requireAuth()) return;

        $user = Database::get()->users->findOne(['_id' => new ObjectId($userId)]);

        if (!$user) {
            Response::error('User not found', 401);
            return;
        }

        Response::json(Serializer::doc($user));
    }
}
