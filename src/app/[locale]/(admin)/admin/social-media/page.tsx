import Link from "next/link";
import { redirect } from "next/navigation";
import { isValidLocale, type Locale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth";
import SocialMediaSettings from "@/components/features/SocialMediaSettings";

export const dynamic = "force-dynamic";

export default async function SocialMediaConfigPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);

  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect(`/${locale}/admin`);

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-gray-900">{T("Соцсеттер: автопубликация", "Соцсети: автопубликация")}</h1>
          <p className="max-w-2xl text-sm text-gray-500">
            {T(
              "Әр платформа үшін: қосу/өшіру, әдепкі тіл және токендер. Жаңалықтар мен іс-шаралар қосылған платформаларға автоматты жарияланады.",
              "Для каждой платформы: включение, язык по умолчанию и токены. Новости и события автоматически публикуются на включённые платформы."
            )}
          </p>
        </div>
        <Link
          href={`/${locale}/admin/social-publications`}
          className="shrink-0 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400"
        >
          {T("Журнал →", "Журнал →")}
        </Link>
      </div>

      <SocialMediaSettings locale={locale} />

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">{T("Шаблондар", "Шаблоны")}</h2>
        <p className="text-sm text-gray-500">
          {T("Хабарлама мәтінін ", "Текст сообщений настраивается в ")}
          <Link href={`/${locale}/admin/social-templates`} className="font-medium text-primary hover:underline">
            {T("SMM шаблондарында баптаңыз", "SMM-шаблонах")}
          </Link>
          {T(" (Telegram / Instagram / Facebook).", " (Telegram / Instagram / Facebook).")}
        </p>
      </div>
    </div>
  );
}
