import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getMany } from "@/lib/db";
import DgIcon, { type DgIconName } from "./DgIcon";

interface FooterProps {
  locale: Locale;
  messages: Record<string, Record<string, string>>;
}

interface SocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  telegram?: string;
  tiktok?: string;
}

async function loadSocialLinks(): Promise<SocialLinks> {
  try {
    const rows = await getMany<{ key: string; value: string }>(
      `SELECT key, value FROM site_settings
        WHERE key IN ('social_instagram','social_facebook','social_youtube','social_telegram','social_tiktok','instagram_handle','telegram_channel')`
    );
    const map: Record<string, string> = {};
    for (const r of rows) {
      if (r.value && r.value.trim()) map[r.key] = r.value.trim();
    }
    const igHandle = map.instagram_handle?.replace(/^@/, "");
    const tgChannel = map.telegram_channel?.replace(/^@/, "");
    return {
      instagram: map.social_instagram || (igHandle ? `https://instagram.com/${igHandle}` : undefined),
      facebook: map.social_facebook,
      youtube: map.social_youtube,
      telegram: map.social_telegram || (tgChannel ? `https://t.me/${tgChannel}` : undefined),
      tiktok: map.social_tiktok,
    };
  } catch {
    return {};
  }
}

// Chiaroscuro-редизайн v4: тёмный подвал, 4 колонки, коралловый акцент.
export default async function Footer({ locale }: FooterProps) {
  const social = await loadSocialLinks();
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);

  const socialEntries = (
    [
      ["ig", social.instagram, "Instagram"],
      ["fb", social.facebook, "Facebook"],
      ["yt", social.youtube, "YouTube"],
      ["tg", social.telegram, "Telegram"],
    ] as const
  ).filter(([, url]) => Boolean(url)) as Array<[DgIconName, string, string]>;

  const fallbackSocials: Array<[DgIconName, string]> = [
    ["fb", "Facebook"],
    ["ig", "Instagram"],
    ["yt", "YouTube"],
  ];

  const menuLinks: Array<[string, string]> = [
    [T("Оферта", "Оферта"), `/${locale}/resources`],
    [T("Мемсатып алу 2026", "Госзакупки 2026"), `/${locale}/resources`],
    [T("Мінез-құлық ережелері", "Правила поведения"), `/${locale}/resources`],
    [T("Құжаттар", "Документы"), `/${locale}/resources`],
    [T("Қолдау қызметі", "Служба поддержки"), `/${locale}/contacts`],
    [T("Қайтару ережелері", "Правила возврата"), `/${locale}/resources`],
  ];

  return (
    <footer className="dg-footer" id="contacts">
      <div className="dg-wrap">
        <div className="dg-footer-top">
          {/* О нас */}
          <div className="dg-foot-col dg-foot-about">
            <h4>{T("Біз туралы", "О нас")}</h4>
            <p>
              {T(
                "«Ш. Дільдебаев атындағы Тау-кеншілер сарайы» коммуналдық мемлекеттік қазыналық кәсіпорны — Ұлытау облысы мәдениет басқармасы",
                "Коммунальное государственное казённое предприятие «Дворец горняков им. Ш. Дильдебаева» управления культуры области Улытау"
              )}
            </p>
          </div>

          {/* Меню */}
          <div className="dg-foot-col">
            <h4>{T("Мәзір", "Меню")}</h4>
            <ul>
              {menuLinks.map(([label, href]) => (
                <li key={label}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Контакты */}
          <div className="dg-foot-col dg-foot-contact">
            <h4>{T("Байланыс", "Контакты")}</h4>
            <ul>
              <li className="item">
                <DgIcon name="pin" size={14} />
                <span>
                  <strong>{T("К.И. Сәтбаев даңғылы, 106", "Проспект К.И. Сатпаева, 106")}</strong>
                  <br />
                  {T("101300, Сәтбаев қ., Қазақстан", "101300, г. Сатпаев, Казахстан")}
                </span>
              </li>
              <li className="item">
                <DgIcon name="phone" size={14} />
                <span>
                  <strong>{T("Қолдау қызметі", "Служба поддержки")}</strong>
                  <br />
                  <a href="tel:+77106362330">+7 (71063) 6-23-30</a>
                </span>
              </li>
            </ul>
          </div>

          {/* Касса */}
          <div className="dg-foot-col dg-foot-contact">
            <h4>{T("Касса", "Касса")}</h4>
            <ul>
              <li className="item">
                <DgIcon name="phone" size={14} />
                <span>
                  <strong>
                    <a href="tel:+77106362440">+7 (71063) 6-24-40</a>
                  </strong>
                </span>
              </li>
              <li className="item">
                <DgIcon name="clock" size={14} />
                <span>
                  {T("Дс–Жм 09:00–18:00", "Пн–Пт 09:00–18:00")}
                  <br />
                  {T("Сб–Жс 10:00–17:00", "Сб–Вс 10:00–17:00")}
                </span>
              </li>
            </ul>
            <div className="dg-foot-socials">
              {socialEntries.length > 0
                ? socialEntries.map(([icon, url, label]) => (
                    <a key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={label}>
                      <DgIcon name={icon} size={16} />
                    </a>
                  ))
                : fallbackSocials.map(([icon, label]) => (
                    <a key={label} href="#" aria-label={label}>
                      <DgIcon name={icon} size={16} />
                    </a>
                  ))}
            </div>
          </div>
        </div>

        <div className="dg-foot-credit">
          {T(
            "Фотосуреттер: «Ш. Дільдебаев атындағы мәдениет және шығармашылық орталығы» КМҚК",
            "Фото: КГКП «Центр культуры и творчества им. Ш. Дильдебаева»"
          )}
        </div>

        <div className="dg-footer-bot">
          <div>© 2026 — {T("Тау-кеншілер сарайы. Барлық құқықтар қорғалған.", "Дворец горняков. Все права защищены.")}</div>
          <Link href={`/${locale}/resources`}>{T("Кіру ережелері", "Правила посещения")}</Link>
        </div>
      </div>
    </footer>
  );
}
