<?php

require_once __DIR__ . '/helpers.php';

const BREVO_API_URL = 'https://api.brevo.com/v3/contacts';

function subscribe_with_webhook(string $email): void
{
    $webhookUrl = get_env_value('NEWSLETTER_WEBHOOK_URL');
    $response = http_json_request('POST', $webhookUrl, [
        'Content-Type' => 'application/json',
        'Accept' => 'application/json',
    ], [
        'email' => $email,
        'source' => 'hanna-artesa-website',
    ]);

    if ($response['status'] < 200 || $response['status'] >= 300) {
        throw new RuntimeException('Webhook newsletter integracija nije uspela.');
    }
}

function subscribe_with_brevo(string $email): void
{
    $apiKey = get_env_value('BREVO_API_KEY');
    $listId = get_env_value('BREVO_NEWSLETTER_LIST_ID');
    $payload = [
        'email' => $email,
        'updateEnabled' => true,
    ];

    if ($listId !== null && $listId !== '' && is_numeric($listId)) {
        $payload['listIds'] = [(int) $listId];
    }

    $response = http_json_request('POST', BREVO_API_URL, [
        'Content-Type' => 'application/json',
        'Accept' => 'application/json',
        'api-key' => $apiKey,
    ], $payload);

    if (($response['status'] >= 200 && $response['status'] < 300) || $response['status'] === 204) {
        return;
    }

    $message = is_array($response['json']) && !empty($response['json']['message'])
        ? $response['json']['message']
        : 'Brevo newsletter integracija nije uspela.';

    throw new RuntimeException($message);
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    header('Allow: POST');
    send_json(405, ['error' => 'Method not allowed.']);
}

try {
    $body = get_json_input();
    $email = strtolower(trim((string) ($body['email'] ?? '')));

    if (!is_valid_email($email)) {
        send_json(400, ['error' => 'Unesite ispravnu email adresu.']);
    }

    if (get_env_value('NEWSLETTER_WEBHOOK_URL')) {
        subscribe_with_webhook($email);
    } elseif (get_env_value('BREVO_API_KEY')) {
        subscribe_with_brevo($email);
    } else {
        send_json(500, [
            'error' => 'Newsletter nije povezan sa pravim servisom. Dodajte NEWSLETTER_WEBHOOK_URL ili BREVO_API_KEY.',
        ]);
    }

    send_json(200, [
        'ok' => true,
        'message' => 'Hvala! Vase prijavljivanje je uspesno sacuvano.',
    ]);
} catch (Throwable $error) {
    send_json(500, [
        'error' => $error->getMessage() ?: 'Prijava na newsletter trenutno nije uspela.',
    ]);
}
