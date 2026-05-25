import { permanentRedirect } from "next/navigation";
import { isValidLocale, type Locale } from "@/lib/i18n";

// Страница «Контакты» объединена со страницей «О нас» (секция #contacts).
// Старый путь /contacts постоянно перенаправляется туда.
export default async function ContactsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : "kk";
  permanentRedirect(`/${locale}/about#contacts`);
}
