#!/usr/bin/env bash
# convert-and-deploy.sh — конвертирует jpg → webp и копирует в репо
# Использование: ./convert-and-deploy.sh <SOURCE_DIR> <REPO_DIR>
# Пример:        ./convert-and-deploy.sh ~/Downloads ~/projects/dvorets-gornyakov

set -euo pipefail

SRC="${1:-$HOME/Downloads}"
REPO="${2:-./dvorets-gornyakov}"
DEST="$REPO/public/dvorets"
QUALITY=82

FILES=(
  hero.jpg
  og-cover.jpg
  dvorets-01.jpg dvorets-02.jpg dvorets-03.jpg dvorets-04.jpg
  dvorets-05.jpg dvorets-06.jpg dvorets-07.jpg dvorets-08.jpg
  dvorets-09-1.jpg dvorets-10.jpg dvorets-11.jpg dvorets-12.jpg
  dvorets-13.jpg dvorets-14.jpg
)

echo "→ Source:  $SRC"
echo "→ Dest:    $DEST"
echo "→ Quality: $QUALITY"
echo ""

# Проверка
if [ ! -d "$SRC" ]; then
  echo "ОШИБКА: $SRC не существует" >&2
  exit 1
fi
if [ ! -d "$REPO" ]; then
  echo "ОШИБКА: $REPO не существует (репо)" >&2
  exit 1
fi

# Какой конвертер
CONVERTER=""
if command -v cwebp >/dev/null 2>&1; then
  CONVERTER="cwebp"
elif command -v magick >/dev/null 2>&1; then
  CONVERTER="magick"
elif command -v convert >/dev/null 2>&1; then
  CONVERTER="convert"
else
  echo "ОШИБКА: нужен cwebp (brew install webp / apt install webp) или ImageMagick (magick)" >&2
  exit 1
fi
echo "→ Конвертер: $CONVERTER"
echo ""

mkdir -p "$DEST"

MISSING=()
OK=0

for f in "${FILES[@]}"; do
  IN="$SRC/$f"
  OUT_NAME="${f%.jpg}.webp"
  OUT="$DEST/$OUT_NAME"

  if [ ! -f "$IN" ]; then
    MISSING+=("$f")
    echo "  ✗ $f — НЕ найден"
    continue
  fi

  case "$CONVERTER" in
    cwebp)
      cwebp -q "$QUALITY" -metadata none "$IN" -o "$OUT" >/dev/null 2>&1
      ;;
    magick)
      magick "$IN" -strip -quality "$QUALITY" "$OUT"
      ;;
    convert)
      convert "$IN" -strip -quality "$QUALITY" "$OUT"
      ;;
  esac

  SZ=$(du -h "$OUT" 2>/dev/null | cut -f1)
  echo "  ✓ $f → $OUT_NAME ($SZ)"
  OK=$((OK + 1))
done

echo ""
echo "═══════════════════════════════════════════"
echo "  Готово: $OK / ${#FILES[@]}"
if [ "${#MISSING[@]}" -gt 0 ]; then
  echo "  Пропущено: ${MISSING[*]}"
  echo ""
  echo "  Положи недостающие файлы в $SRC и запусти повторно."
  exit 2
fi

echo ""
echo "Следующие шаги:"
echo "  1. cd $REPO"
echo "  2. git add public/dvorets/"
echo "  3. Обнови маппинги (см. MAPPINGS.md)"
echo "  4. git commit -m 'feat: добавлены AI-изображения для событий и кружков'"
