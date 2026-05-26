# convert-and-deploy.ps1 — конвертирует jpg → webp и копирует в репо
# Использование:
#   .\convert-and-deploy.ps1 -SourceDir "$env:USERPROFILE\Downloads" -RepoDir "D:\projects\dvorets-gornyakov"

param(
    [string]$SourceDir = "$env:USERPROFILE\Downloads",
    [string]$RepoDir = "$PWD\dvorets-gornyakov",
    [int]$Quality = 82
)

$ErrorActionPreference = 'Stop'

$Files = @(
    'hero.jpg', 'og-cover.jpg',
    'dvorets-01.jpg', 'dvorets-02.jpg', 'dvorets-03.jpg', 'dvorets-04.jpg',
    'dvorets-05.jpg', 'dvorets-06.jpg', 'dvorets-07.jpg', 'dvorets-08.jpg',
    'dvorets-09-1.jpg', 'dvorets-10.jpg', 'dvorets-11.jpg', 'dvorets-12.jpg',
    'dvorets-13.jpg', 'dvorets-14.jpg'
)

$Dest = Join-Path $RepoDir 'public\dvorets'

Write-Host "-> Source:  $SourceDir"
Write-Host "-> Dest:    $Dest"
Write-Host "-> Quality: $Quality"
Write-Host ""

if (-not (Test-Path $SourceDir)) {
    Write-Error "Source не существует: $SourceDir"
    exit 1
}
if (-not (Test-Path $RepoDir)) {
    Write-Error "Repo не существует: $RepoDir"
    exit 1
}

# Конвертер
$Converter = $null
if (Get-Command cwebp -ErrorAction SilentlyContinue) {
    $Converter = 'cwebp'
} elseif (Get-Command magick -ErrorAction SilentlyContinue) {
    $Converter = 'magick'
} else {
    Write-Error "Нужен cwebp (https://developers.google.com/speed/webp/download) или ImageMagick (https://imagemagick.org/script/download.php#windows)"
    exit 1
}
Write-Host "-> Конвертер: $Converter"
Write-Host ""

New-Item -ItemType Directory -Force -Path $Dest | Out-Null

$Missing = @()
$Ok = 0

foreach ($f in $Files) {
    $In = Join-Path $SourceDir $f
    $OutName = [System.IO.Path]::ChangeExtension($f, 'webp')
    $Out = Join-Path $Dest $OutName

    if (-not (Test-Path $In)) {
        $Missing += $f
        Write-Host "  X $f - НЕ найден" -ForegroundColor Red
        continue
    }

    try {
        if ($Converter -eq 'cwebp') {
            & cwebp -q $Quality -metadata none $In -o $Out 2>$null | Out-Null
        } else {
            & magick $In -strip -quality $Quality $Out
        }
        $Sz = '{0:N0} KB' -f ((Get-Item $Out).Length / 1KB)
        Write-Host "  + $f -> $OutName ($Sz)" -ForegroundColor Green
        $Ok++
    } catch {
        Write-Host "  X $f - ошибка конверсии: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==========================================="
Write-Host "  Готово: $Ok / $($Files.Count)"

if ($Missing.Count -gt 0) {
    Write-Host "  Пропущено: $($Missing -join ', ')" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Положи недостающие в $SourceDir и запусти повторно."
    exit 2
}

Write-Host ""
Write-Host "Следующие шаги:"
Write-Host "  1. cd $RepoDir"
Write-Host "  2. git add public/dvorets/"
Write-Host "  3. Обнови маппинги (см. MAPPINGS.md)"
Write-Host "  4. git commit -m 'feat: добавлены AI-изображения для событий и кружков'"
