"use client";

import Slider from "@/components/ui/Slider";
import type { Locale } from "@/lib/i18n";

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
}

interface BannerSliderProps {
  banners: Banner[];
  locale: Locale;
  heroTitle: string;
  heroSubtitle: string;
}

export default function BannerSlider({ banners, locale, heroTitle, heroSubtitle }: BannerSliderProps) {
  if (banners.length === 0) {
    // Default hero when no banners
    return (
      <div className="relative bg-gradient-to-br from-primary to-primary-dark rounded-xl overflow-hidden">
        {/* Kazakh ornament pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 200 200" preserveAspectRatio="none">
            <pattern id="kazakh-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M20 0L40 20L20 40L0 20Z" fill="white" />
              <circle cx="20" cy="20" r="5" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#kazakh-pattern)" />
          </svg>
        </div>
        <div className="relative px-8 py-16 md:py-24 text-center text-white">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{heroTitle}</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">{heroSubtitle}</p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <a
              href={`/${locale}/clubs`}
              className="px-6 py-3 bg-accent hover:bg-accent-dark text-white rounded-lg font-medium transition-colors"
            >
              {locale === "kk" ? "Үйірмелер" : "Кружки"}
            </a>
            <a
              href={`/${locale}/events`}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors"
            >
              {locale === "kk" ? "Іс-шаралар" : "Мероприятия"}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Slider className="aspect-[21/9] md:aspect-[3/1]">
      {banners.map((banner) => (
        <div key={banner.id} className="relative w-full h-full">
          {banner.link_url ? (
            <a href={banner.link_url} className="block w-full h-full">
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
            </a>
          ) : (
            <img
              src={banner.image_url}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h2 className="text-2xl md:text-4xl font-bold">{banner.title}</h2>
          </div>
        </div>
      ))}
    </Slider>
  );
}
