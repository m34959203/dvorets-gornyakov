# Пакет AI-изображений для Дворца горняков

Дата: 2026-05-26
Источник: Gemini 2.0 Flash (image generation)
Назначение: hero, OG-обложка, карточки событий, карточки кружков

## 1. Состав пакета

```
dvorets-images-pack/
├── README.md                  ← этот файл
├── MAPPINGS.md                ← привязка файлов к БД/JSX
├── convert-and-deploy.sh      ← Linux/macOS/WSL: webp + копирование в репо
├── convert-and-deploy.ps1     ← Windows PowerShell: аналог
├── prompts.md                 ← все 16 промтов (для воспроизведения)
└── COMMIT.md                  ← черновик git commit + PR description
```

## 2. Что должно быть в `~/Downloads`

После серии генерации в Gemini у тебя в `Downloads` должны лежать ровно эти 16 файлов (имена соответствуют autodownload-триггеру):

| Файл | Аспект | Сюжет |
|---|---|---|
| `hero.jpg` | 16:9 (1024×572) | Казахский ансамбль на сцене |
| `og-cover.jpg` | 16:9 (1024×541) | Фасад дворца на закате |
| `dvorets-08.jpg` | 4:3 (1024×765) | Большой концертный зал (650), пустой, вид со сцены |
| `dvorets-10.jpg` | 4:3 (1024×765) | Камерный зал (120), экран + трибуна |
| `dvorets-12.jpg` | 4:3 (1024×765) | Репетиционный зал (40), зеркала + станок |
| `dvorets-07.jpg` | 3:4 (765×1024) | Концерт — вокалистка в красном + ансамбль |
| `dvorets-06.jpg` | 3:4 (765×1024) | Выставка казахского прикладного искусства |
| `dvorets-11.jpg` | 3:4 (765×1024) | Мастер-класс по танцам (девочки + хореограф) |
| `dvorets-03.jpg` | 3:4 (765×1024) | Наурыз — юрта, домбристы, столы с баурсаками |
| `dvorets-04.jpg` | 3:4 (765×1024) | Музконкурс — подросток с домброй + жюри |
| `dvorets-09-1.jpg` | 3:4 (765×1024) | Театр — драма в костюмах 19 века |
| `dvorets-05.jpg` | 4:3 (1024×765) | Вокальная студия — педагог + ученица |
| `dvorets-02.jpg` | 4:3 (1024×765) | Фортепиано — урок |
| `dvorets-13.jpg` | 4:3 (1024×765) | Изостудия — мольберты + натюрморт |
| `dvorets-01.jpg` | 4:3 (1024×765) | Раннее развитие — педагог + дети с книгой |
| `dvorets-14.jpg` | 4:3 (1024×765) | Детское творчество — лепка, вырезание, краски |

**Размер каждого** ~150–300 KB (JPEG q92). После конвертации в webp q82 — ~40–80 KB.

## 3. Быстрый старт

### Windows (PowerShell):

```powershell
cd <папка-с-этим-README>
.\convert-and-deploy.ps1 -SourceDir "$env:USERPROFILE\Downloads" -RepoDir "D:\projects\dvorets-gornyakov"
```

### Linux/macOS/WSL:

```bash
cd <папка-с-этим-README>
./convert-and-deploy.sh ~/Downloads /path/to/dvorets-gornyakov
```

Скрипт сделает:
1. Соберёт 16 .jpg из `SourceDir`
2. Сконвертирует каждый в `.webp` (q82, метаданные стерты)
3. Скопирует в `<repo>/public/dvorets/` (создаст папку если нет)
4. Покажет diff что изменилось

**Требования:**
- ImageMagick `magick` или `convert` (для конверсии в webp)
- Альтернатива — `cwebp` из libwebp
- Скрипт сам определит что доступно

## 4. Куда сослаться в коде

См. `MAPPINGS.md` — там точные file:line привязки в:
- `src/components/events/EventCard.tsx`
- `src/components/clubs/ClubCard.tsx`
- `src/app/[locale]/layout.tsx` (og-cover)
- `src/app/[locale]/page.tsx` (hero)
- SQL: `events.cover_image`, `clubs.image` колонки в seed-данных

## 5. Лицензия / атрибуция

Все изображения сгенерированы Gemini 2.0 Flash из текстовых промтов (см. `prompts.md`).
Для AI-сгенерированных изображений нужна пометка в `<img alt="...">` или в подвале сайта:

> Изображения для иллюстраций сгенерированы нейросетью на основе текстовых описаний концертной деятельности Дворца горняков им. Ш. Дильдебаева. Не является документальной фотографией.

Размещение в подвале страниц `/events`, `/clubs`, главная — обязательно.

## 6. Чек-лист для PR

- [ ] 16 .webp в `public/dvorets/`
- [ ] Старые placeholder.svg удалены из `events.cover_image` и `clubs.image`
- [ ] OG-meta обновлён (og-cover.jpg → og-cover.webp с fallback)
- [ ] Hero на главной заменён (hero.jpg → hero.webp)
- [ ] Атрибуция AI добавлена в Footer.tsx
- [ ] `next.config.js` — domain пересмотрен (не нужен для local public/)
- [ ] Lighthouse — proof что страница не потяжелела (webp легче jpg)
- [ ] Скриншот /events и /clubs в PR description
