const IG_API = "https://graph.facebook.com/v19.0";

interface IgContainerResp {
  id?: string;
  error?: { message?: string };
}

interface IgPublishResp {
  id?: string;
  error?: { message?: string };
}

async function createMediaContainer(
  igUserId: string,
  accessToken: string,
  imageUrl: string,
  caption: string
): Promise<string | null> {
  const params = new URLSearchParams({
    image_url: imageUrl,
    caption,
    access_token: accessToken,
  });
  const r = await fetch(`${IG_API}/${igUserId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  const j: IgContainerResp = await r.json();
  if (!r.ok || !j.id) {
    console.error("Instagram container error:", j.error?.message || r.statusText);
    return null;
  }
  return j.id;
}

async function publishContainer(
  igUserId: string,
  accessToken: string,
  creationId: string
): Promise<boolean> {
  const params = new URLSearchParams({
    creation_id: creationId,
    access_token: accessToken,
  });
  const r = await fetch(`${IG_API}/${igUserId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  const j: IgPublishResp = await r.json();
  if (!r.ok || !j.id) {
    console.error("Instagram publish error:", j.error?.message || r.statusText);
    return false;
  }
  return true;
}

export async function sendInstagramPost(
  imageUrl: string,
  caption: string
): Promise<boolean> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igUserId = process.env.INSTAGRAM_ACCOUNT_ID;

  if (!token || !igUserId) {
    console.warn("[instagram] INSTAGRAM_ACCESS_TOKEN / INSTAGRAM_ACCOUNT_ID not set — skip");
    return false;
  }
  if (!imageUrl) {
    console.warn("[instagram] image_url is required for IG post");
    return false;
  }

  const creationId = await createMediaContainer(igUserId, token, imageUrl, caption);
  if (!creationId) return false;
  return publishContainer(igUserId, token, creationId);
}

export function formatNewsForInstagram(
  titleRu: string,
  titleKk: string,
  excerptRu: string,
  url: string
): string {
  const parts = [
    `📰 ${titleRu}`,
    `🇰🇿 ${titleKk}`,
    "",
    excerptRu,
    "",
    `Читать: ${url}`,
    "",
    "#ДворецГорняков #Жезказган #Культура",
  ].filter((p) => p !== undefined);
  return parts.join("\n").slice(0, 2200);
}

export function formatEventForInstagram(
  titleRu: string,
  titleKk: string,
  dateStr: string,
  location: string,
  url: string
): string {
  const parts = [
    `🎭 ${titleRu}`,
    `🇰🇿 ${titleKk}`,
    "",
    `📅 ${dateStr}`,
    location ? `📍 ${location}` : "",
    "",
    `Подробнее: ${url}`,
    "",
    "#ДворецГорняков #Жезказган #Мероприятие",
  ]
    .filter((p) => p !== undefined && p !== "")
    .concat([""]);
  return parts.join("\n").slice(0, 2200);
}
