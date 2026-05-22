// Публикация на страницу Facebook через Graph API (по образцу instagram.ts / AIMAK FacebookService).
// Креды: FACEBOOK_PAGE_ID + FACEBOOK_PAGE_ACCESS_TOKEN (long-lived page token).

const FB_API = "https://graph.facebook.com/v19.0";

interface FbResp {
  id?: string;
  post_id?: string;
  error?: { message?: string };
}

export interface FbCreds {
  pageId?: string | null;
  token?: string | null;
}

function creds(override?: FbCreds): { pageId: string; token: string } | null {
  const pageId = override?.pageId || process.env.FACEBOOK_PAGE_ID;
  const token = override?.token || process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) {
    console.warn("[facebook] page id / access token not set — skip");
    return null;
  }
  return { pageId, token };
}

/** Текстовый пост со ссылкой. Возвращает id поста или null. */
export async function sendFacebookLinkPost(message: string, link: string, override?: FbCreds): Promise<string | null> {
  const c = creds(override);
  if (!c) return null;
  const params = new URLSearchParams({ message, link, access_token: c.token });
  try {
    const r = await fetch(`${FB_API}/${c.pageId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const j: FbResp = await r.json();
    if (!r.ok || !(j.id || j.post_id)) {
      console.error("[facebook] link post error:", j.error?.message || r.statusText);
      return null;
    }
    return j.id || j.post_id || null;
  } catch (e) {
    console.error("[facebook] link post error:", e);
    return null;
  }
}

/** Фото-пост с подписью. imageUrl должен быть публично доступен. Возвращает id или null. */
export async function sendFacebookPhotoPost(imageUrl: string, caption: string, override?: FbCreds): Promise<string | null> {
  const c = creds(override);
  if (!c) return null;
  const params = new URLSearchParams({ url: imageUrl, caption, access_token: c.token });
  try {
    const r = await fetch(`${FB_API}/${c.pageId}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const j: FbResp = await r.json();
    if (!r.ok || !(j.id || j.post_id)) {
      console.error("[facebook] photo post error:", j.error?.message || r.statusText);
      return null;
    }
    return j.post_id || j.id || null;
  } catch (e) {
    console.error("[facebook] photo post error:", e);
    return null;
  }
}
