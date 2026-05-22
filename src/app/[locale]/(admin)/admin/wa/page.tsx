import { redirect } from "next/navigation";
import { isValidLocale, type Locale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth";
import WaBridge from "@/components/features/WaBridge";

export const dynamic = "force-dynamic";

export default async function AdminWaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);

  // WA-мост — только админ
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect(`/${locale}/admin`);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">{T("WhatsApp-мост", "WhatsApp-мост")}</h1>
      <p className="mb-6 max-w-2xl text-sm text-gray-500">
        {T(
          "Тау-кеншілер сарайының WhatsApp нөмірін байланыстырыңыз — зал брондау боты осы нөмір арқылы жұмыс істейді.",
          "Привяжите WhatsApp-номер Дворца — бот бронирования залов будет работать через этот номер."
        )}
      </p>
      <WaBridge locale={locale} />
    </div>
  );
}
