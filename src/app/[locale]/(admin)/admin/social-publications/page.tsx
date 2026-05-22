import { redirect } from "next/navigation";
import { isValidLocale, type Locale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth";
import { getMany } from "@/lib/db";

export const dynamic = "force-dynamic";

interface PubRow {
  id: string;
  kind: string;
  item_id: string;
  platform: string;
  status: string;
  external_id: string | null;
  error: string | null;
  created_at: string;
}

async function load(): Promise<PubRow[]> {
  try {
    return await getMany<PubRow>(
      `SELECT id, kind, item_id, platform, status, external_id, error, created_at
         FROM social_publications
        ORDER BY created_at DESC
        LIMIT 200`
    );
  } catch {
    return [];
  }
}

const PLATFORM_LABEL: Record<string, string> = {
  telegram: "Telegram",
  instagram: "Instagram",
  facebook: "Facebook",
};

export default async function SocialPublicationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);

  const user = await getCurrentUser();
  if (!user || !["admin", "editor"].includes(user.role)) redirect(`/${locale}/admin`);

  const rows = await load();
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(locale === "kk" ? "kk-KZ" : "ru-RU", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "Asia/Almaty",
    });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">{T("Соцсетідегі жарияланымдар", "Публикации в соцсетях")}</h1>
      <p className="mb-6 max-w-2xl text-sm text-gray-500">
        {T(
          "Жаңалықтар мен іс-шаралардың автопубликация журналы. Сәтті жарияланым қайта жіберілмейді.",
          "Журнал автопубликаций новостей и событий. Успешная публикация повторно не отправляется."
        )}
      </p>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          {T("Әзірге жарияланым жоқ", "Публикаций пока нет")}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">{T("Күні", "Дата")}</th>
                <th className="px-4 py-3">{T("Тип", "Тип")}</th>
                <th className="px-4 py-3">{T("Платформа", "Платформа")}</th>
                <th className="px-4 py-3">{T("Элемент", "Элемент")}</th>
                <th className="px-4 py-3">{T("Күй", "Статус")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{fmt(r.created_at)}</td>
                  <td className="px-4 py-3 text-gray-700">{r.kind === "news" ? T("Жаңалық", "Новость") : T("Іс-шара", "Событие")}</td>
                  <td className="px-4 py-3 text-gray-900">{PLATFORM_LABEL[r.platform] ?? r.platform}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 font-mono text-xs text-gray-500" title={r.item_id}>{r.item_id}</td>
                  <td className="px-4 py-3">
                    {r.status === "success" ? (
                      <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">✓ {T("сәтті", "успешно")}</span>
                    ) : (
                      <span
                        className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700"
                        title={r.error ?? ""}
                      >
                        ✕ {T("қате", "ошибка")}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
