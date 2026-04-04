<?php

function get_env_value(string $key, ?string $default = null): ?string
{
    $value = getenv($key);

    if ($value !== false && $value !== '') {
        return $value;
    }

    if (isset($_ENV[$key]) && $_ENV[$key] !== '') {
        return $_ENV[$key];
    }

    if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') {
        return $_SERVER[$key];
    }

    return $default;
}

function send_json(int $statusCode, array $payload, array $headers = []): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');

    foreach ($headers as $name => $value) {
        header($name . ': ' . $value);
    }

    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function get_json_input(): array
{
    $raw = file_get_contents('php://input');

    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);

    if (json_last_error() !== JSON_ERROR_NONE || !is_array($decoded)) {
        throw new RuntimeException('Invalid JSON body.');
    }

    return $decoded;
}

function is_valid_email(string $email): bool
{
    return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
}

function http_json_request(string $method, string $url, array $headers = [], $body = null): array
{
    $encodedBody = $body;

    if (is_array($body) || is_object($body)) {
        $encodedBody = json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    if (function_exists('curl_init')) {
        $curlHeaders = [];
        foreach ($headers as $name => $value) {
            $curlHeaders[] = $name . ': ' . $value;
        }

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, strtoupper($method));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $curlHeaders);
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);

        if ($encodedBody !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $encodedBody);
        }

        $responseBody = curl_exec($ch);

        if ($responseBody === false) {
            $message = curl_error($ch) ?: 'HTTP request failed.';
            curl_close($ch);
            throw new RuntimeException($message);
        }

        $statusCode = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);

        return [
            'status' => $statusCode,
            'body' => $responseBody,
            'json' => json_decode($responseBody, true),
        ];
    }

    $headerLines = [];
    foreach ($headers as $name => $value) {
        $headerLines[] = $name . ': ' . $value;
    }

    $context = stream_context_create([
        'http' => [
            'method' => strtoupper($method),
            'header' => implode("\r\n", $headerLines),
            'content' => $encodedBody ?? '',
            'ignore_errors' => true,
            'timeout' => 20,
        ],
    ]);

    $responseBody = file_get_contents($url, false, $context);

    if ($responseBody === false) {
        throw new RuntimeException('HTTP request failed.');
    }

    $statusCode = 0;
    if (!empty($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $matches)) {
        $statusCode = (int) $matches[1];
    }

    return [
        'status' => $statusCode,
        'body' => $responseBody,
        'json' => json_decode($responseBody, true),
    ];
}
