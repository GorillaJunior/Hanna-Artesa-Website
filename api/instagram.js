const DEFAULT_GRAPH_VERSION = process.env.INSTAGRAM_GRAPH_API_VERSION || "v23.0";

function buildGraphUrl(path, params = {}) {
  const url = new URL(`https://graph.facebook.com/${DEFAULT_GRAPH_VERSION}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

async function fetchGraph(path, params = {}) {
  const response = await fetch(buildGraphUrl(path, params));
  const data = await response.json();

  if (!response.ok || data.error) {
    const message = data?.error?.message || "Instagram API request failed.";
    throw new Error(message);
  }

  return data;
}

function getMediaSource(mediaItem) {
  if (!mediaItem) {
    return "";
  }

  if (mediaItem.media_type === "VIDEO") {
    return mediaItem.thumbnail_url || mediaItem.media_url || "";
  }

  if (mediaItem.media_type === "CAROUSEL_ALBUM" && Array.isArray(mediaItem.children?.data)) {
    const firstChild = mediaItem.children.data[0];
    return firstChild?.media_url || firstChild?.thumbnail_url || mediaItem.media_url || mediaItem.thumbnail_url || "";
  }

  return mediaItem.media_url || mediaItem.thumbnail_url || "";
}

async function resolveInstagramUserId(accessToken) {
  if (process.env.INSTAGRAM_USER_ID) {
    return process.env.INSTAGRAM_USER_ID;
  }

  if (!process.env.INSTAGRAM_PAGE_ID) {
    throw new Error("Missing INSTAGRAM_USER_ID or INSTAGRAM_PAGE_ID environment variable.");
  }

  const pageData = await fetchGraph(`/${process.env.INSTAGRAM_PAGE_ID}`, {
    fields: "instagram_business_account{id}",
    access_token: accessToken,
  });

  const instagramUserId = pageData?.instagram_business_account?.id;

  if (!instagramUserId) {
    throw new Error("No Instagram business account is connected to the configured Facebook Page.");
  }

  return instagramUserId;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken) {
    return res.status(500).json({
      error: "Missing INSTAGRAM_ACCESS_TOKEN environment variable.",
    });
  }

  try {
    const instagramUserId = await resolveInstagramUserId(accessToken);

    const [profileData, mediaData] = await Promise.all([
      fetchGraph(`/${instagramUserId}`, {
        fields: "username,profile_picture_url,biography",
        access_token: accessToken,
      }),
      fetchGraph(`/${instagramUserId}/media`, {
        fields: "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,children{media_url,thumbnail_url,media_type}",
        limit: "3",
        access_token: accessToken,
      }),
    ]);

    const username = profileData.username || process.env.INSTAGRAM_USERNAME || "instagram";
    const profileUrl = process.env.INSTAGRAM_PROFILE_URL || `https://www.instagram.com/${username}/`;
    const posts = Array.isArray(mediaData.data)
      ? mediaData.data.map((item) => ({
        id: item.id,
        caption: item.caption || "",
        mediaType: item.media_type || "",
        mediaUrl: getMediaSource(item),
        permalink: item.permalink || profileUrl,
        timestamp: item.timestamp || "",
      }))
      : [];

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=900");
    return res.status(200).json({
      profile: {
        username,
        biography: profileData.biography || "",
        profilePictureUrl: profileData.profile_picture_url || "",
        profileUrl,
      },
      posts,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Failed to load Instagram feed.",
    });
  }
};
