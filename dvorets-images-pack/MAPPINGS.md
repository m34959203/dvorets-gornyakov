# Маппинги: куда подставить файлы

## 1. Hero на главной

**Файл:** `src/app/[locale]/page.tsx` (или `src/components/Hero.tsx`)

Заменить ссылку на background-image / `<Image src=...>`:

```diff
- src="/placeholder-hero.svg"
+ src="/dvorets/hero.webp"
```

Если используется CSS-фон через Tailwind:

```diff
- bg-[url('/placeholder-hero.svg')]
+ bg-[url('/dvorets/hero.webp')]
```

## 2. OG-обложка (Open Graph)

**Файл:** `src/app/[locale]/layout.tsx`

```diff
  export const metadata: Metadata = {
    openGraph: {
-     images: ['/og-default.png'],
+     images: [{ url: '/dvorets/og-cover.webp', width: 1024, height: 541, alt: '...' }],
    },
    twitter: {
-     images: ['/og-default.png'],
+     images: ['/dvorets/og-cover.webp'],
    },
  };
```

## 3. Карточки залов на /rent

**Файл:** `src/app/[locale]/(public)/rent/page.tsx`

```ts
const halls = [
  { id: 'big',        image: '/dvorets/dvorets-08.webp', seats: 650 },
  { id: 'chamber',    image: '/dvorets/dvorets-10.webp', seats: 120 },
  { id: 'rehearsal',  image: '/dvorets/dvorets-12.webp', seats: 40 },
];
```

## 4. Карточки событий (cover_image)

### Вариант А: SQL seed

**Файл:** `sql/00X_events_seed.sql` или миграция

```sql
UPDATE events SET cover_image = '/dvorets/dvorets-07.webp' WHERE slug = 'concert-arman';
UPDATE events SET cover_image = '/dvorets/dvorets-03.webp' WHERE slug LIKE '%nauryz%';
UPDATE events SET cover_image = '/dvorets/dvorets-04.webp' WHERE category = 'competition';
UPDATE events SET cover_image = '/dvorets/dvorets-06.webp' WHERE category = 'exhibition';
UPDATE events SET cover_image = '/dvorets/dvorets-09-1.webp' WHERE category = 'theatre';
UPDATE events SET cover_image = '/dvorets/dvorets-11.webp' WHERE category IN ('masterclass', 'dance');
```

### Вариант Б: JSON fixture / TypeScript

**Файл:** `src/data/events.ts` или подобный

| `event.category` или `event.type` | Файл |
|---|---|
| `concert` / `vocal-show` | `dvorets-07.webp` |
| `exhibition` | `dvorets-06.webp` |
| `dance-class` / `masterclass` | `dvorets-11.webp` |
| `nauryz` / `festival` | `dvorets-03.webp` |
| `competition` / `contest` | `dvorets-04.webp` |
| `theatre` / `drama` | `dvorets-09-1.webp` |

## 5. Карточки кружков (clubs.image)

**Файл:** `src/data/clubs.ts` или `sql/00X_clubs_seed.sql`

| `club.category` | Файл |
|---|---|
| `vocal` | `dvorets-05.webp` |
| `piano` / `music` | `dvorets-02.webp` |
| `art` / `painting` | `dvorets-13.webp` |
| `early-development` / `preschool` | `dvorets-01.webp` |
| `crafts` / `handmade` | `dvorets-14.webp` |
| `dance` | `dvorets-11.webp` (общий с событиями) |

SQL пример:

```sql
UPDATE clubs SET image = '/dvorets/dvorets-05.webp' WHERE category = 'vocal';
UPDATE clubs SET image = '/dvorets/dvorets-02.webp' WHERE category = 'piano';
UPDATE clubs SET image = '/dvorets/dvorets-13.webp' WHERE category = 'art';
UPDATE clubs SET image = '/dvorets/dvorets-01.webp' WHERE category = 'early-development';
UPDATE clubs SET image = '/dvorets/dvorets-14.webp' WHERE category = 'crafts';
UPDATE clubs SET image = '/dvorets/dvorets-11.webp' WHERE category = 'dance';
```

## 6. Next.js Image component

Если используется `next/image`, обновить sizes для каждого ratio:

```tsx
// 4:3 карточки (залы, изостудия, и т.п.)
<Image src="/dvorets/dvorets-08.webp" width={1024} height={768} alt="..." />

// 3:4 карточки (события, мастер-классы)
<Image src="/dvorets/dvorets-07.webp" width={768} height={1024} alt="..." />

// hero
<Image src="/dvorets/hero.webp" width={1024} height={572} priority alt="..." />
```

## 7. Alt-текст (для a11y и SEO)

Обязательно — иначе a11y-audit покажет fail.

```ts
const altTexts = {
  'hero.webp': 'Концерт казахского национального ансамбля на сцене Дворца горняков',
  'og-cover.webp': 'Здание Дворца горняков им. Ш. Дильдебаева в Сатпаеве на закате',
  'dvorets-08.webp': 'Интерьер большого концертного зала на 650 мест',
  'dvorets-10.webp': 'Камерный зал на 120 мест с проекционным экраном',
  'dvorets-12.webp': 'Репетиционный зал с зеркалами и балетным станком',
  'dvorets-07.webp': 'Концертное выступление вокалистки с живым ансамблем',
  'dvorets-06.webp': 'Художественная выставка казахского прикладного искусства',
  'dvorets-11.webp': 'Мастер-класс по казахскому народному танцу',
  'dvorets-03.webp': 'Празднование Наурыз — юрта и народные музыканты',
  'dvorets-04.webp': 'Конкурс юных исполнителей казахской народной музыки',
  'dvorets-09-1.webp': 'Театральная постановка драматического репертуара',
  'dvorets-05.webp': 'Урок вокала в студии звукозаписи',
  'dvorets-02.webp': 'Урок фортепиано в музыкальном классе',
  'dvorets-13.webp': 'Изостудия — дети рисуют на мольбертах',
  'dvorets-01.webp': 'Кружок раннего развития для дошкольников',
  'dvorets-14.webp': 'Кружок детского прикладного творчества',
};
```
