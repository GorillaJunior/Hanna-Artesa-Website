<?php

require_once __DIR__ . '/helpers.php';

function build_graph_url(string $path, array $params = []): string
{
    $graphVersion = get_env_value('INSTAGRAM_GRAPH_API_VERSION', 'v23.0');
    $url = 'https://graph.facebook.com/' . $graphVersion . $path;

    $filteredParams = array_filter($params, static function ($value) {
        return $value !== null && $value !== '';
    });

    if (!$filteredParams) {
        return $url;
    }

    return $url . '?' . http_build_query($filteredParams);
}

function fetch_graph(string $path, array $params = []): array
{
    $response = http_json_request('GET', build_graph_url($path, $params), [
        'Accept' => 'application/json',
    ]);

    $data = is_array($response['json']) ? $response['json'] : [];

    if ($response['status'] < 200 || $response['status'] >= 300 || !empty($data['error'])) {
        $message = !empty($data['error']['message'])
            ? $data['error']['message']
            : 'Instagram API request failed.';
        throw new RuntimeException($message);
    }

    return $data;
}

function get_media_source(array $mediaItem): string
{
    if (($mediaItem['media_type'] ?? '') === 'VIDEO') {
        return (string) ($mediaItem['thumbnail_url'] ?? $mediaItem['media_url'] ?? '');
    }

    if (($mediaItem['media_type'] ?? '') === 'CAROUSEL_ALBUM' && !empty($mediaItem['children']['data'][0])) {
        $firstChild = $mediaItem['children']['data'][0];
        return (string) ($firstChild['media_url'] ?? $firstChild['thumbnail_url'] ?? $mediaItem['media_url'] ?? $mediaItem['thumbnail_url'] ?? '');
    }

    return (string) ($mediaItem['media_url'] ?? $mediaItem['thumbnail_url'] ?? '');
}

function resolve_instagram_user_id(string $accessToken): string
{
    $instagramUserId = get_env_value('INSTAGRAM_USER_ID');
    if ($instagramUserId) {
        return $instagramUserId;
    }

    $pageId = get_env_value('INSTAGRAM_PAGE_ID');
    if (!$pageId) {
        throw new RuntimeException('Missing INSTAGRAM_USER_ID or INSTAGRAM_PAGE_ID environment variable.');
    }

    $pageData = fetch_graph('/' . $pageId, [
        'fields' => 'instagram_business_account{id}',
        'access_token' => $accessToken,
    ]);

    $resolvedId = $pageData['instagram_business_account']['id'] ?? '';
    if (!$resolvedId) {
        throw new RuntimeException('No Instagram business account is connected to the configured Facebook Page.');
    }

    return (string) $resolvedId;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    header('Allow: GET');
    send_json(405, ['error' => 'Method not allowed.']);
}

$accessToken = get_env_value('INSTAGRAM_ACCESS_TOKEN');
if (!$accessToken) {
    send_json(500, [
        'error' => 'Missing INSTAGRAM_ACCESS_TOKEN environment variable.',
    ]);
}

try {
    $instagramUserId = resolve_instagram_user_id($accessToken);

    $profileData = fetch_graph('/' . $instagramUserId, [
        'fields' => 'username,profile_picture_url,biography',
        'access_token' => $accessToken,
    ]);

    $mediaData = fetch_graph('/' . $instagramUserId . '/media', [
        'fields' => 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,children{media_url,thumbnail_url,media_type}',
        'limit' => '3',
        'access_token' => $accessToken,
    ]);

    $username = (string) ($profileData['username'] ?? get_env_value('INSTAGRAM_USERNAME', 'instagram'));
    $profileUrl = get_env_value('INSTAGRAM_PROFILE_URL', 'https://www.instagram.com/' . $username . '/');
    $posts = [];

    if (!empty($mediaData['data']) && is_array($mediaData['data'])) {
        foreach ($mediaData['data'] as $item) {
            $posts[] = [
                'id' => (string) ($item['id'] ?? ''),
                'caption' => (string) ($item['caption'] ?? ''),
                'mediaType' => (string) ($item['media_type'] ?? ''),
                'mediaUrl' => get_media_source(is_array($item) ? $item : []),
                'permalink' => (string) ($item['permalink'] ?? $profileUrl),
                'timestamp' => (string) ($item['timestamp'] ?? ''),
            ];
        }
    }

    send_json(200, [
        'profile' => [
            'username' => $username,
            'biography' => (string) ($profileData['biography'] ?? ''),
            'profilePictureUrl' => (string) ($profileData['profile_picture_url'] ?? ''),
            'profileUrl' => $profileUrl,
        ],
        'posts' => $posts,
    ], [
        'Cache-Control' => 's-maxage=300, stale-while-revalidate=900',
    ]);
} catch (Throwable $error) {
    send_json(500, [
        'error' => $error->getMessage() ?: 'Failed to load Instagram feed.',
    ]);
}
