// Реальные скриншоты для wow-деска. node scripts/capture-deck-screenshots.mjs
// Публичные страницы (ru) с живого localhost:3007. Полностраничные + viewport-обрезка.
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { execSync } from "node:child_process";
const require = createRequire(import.meta.url);
const { chromium } = require(`${execSync("npm root -g").toString().trim()}/playwright`);

const BASE = process.env.BASE || "http://localhost:3007";
const EID = "/ru/events/2c5b7a91-567d-430b-adb7-6fdfdab46af4";
const CID = "/ru/clubs/17dcb853-a7bd-4f60-9fa1-4374b9a60bdb";
const NEWS = "/ru/news/novyy-sezon-2026";

// [имя, путь, fullPage?]
const PAGES = [
  ["home", "/ru", true],
  ["events", "/ru/events", true],
  ["event-detail", EID, true],
  ["clubs", "/ru/clubs", true],
  ["club-detail", CID, true],
  ["news", "/ru/news", true],
  ["news-detail", NEWS, true],
  ["about", "/ru/about", true],
  ["rent", "/ru/rent", true],
  ["contacts", "/ru/contacts", true],
  ["rules", "/ru/rules", true],
  ["resources", "/ru/resources", true],
];

const dir = "docs/screenshots/user";
await mkdir(dir, { recursive: true });

const b = await chromium.launch();
const ctx = await b.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  locale: "ru-RU",
});
// дать аналитике cookie, чтобы не было лишних 400 в сетевой консоли
await ctx.addCookies([{ name: "dg_sid", value: "deck-capture-session", url: BASE }]);
const page = await ctx.newPage();

for (const [name, path, full] of PAGES) {
  try {
    await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 30000 });
  } catch {
    await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 30000 });
  }
  // лениво-подгружаемые фото: проскроллить до низа и обратно
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const t = setInterval(() => {
        window.scrollBy(0, 900);
        y += 900;
        if (y >= document.body.scrollHeight) {
          clearInterval(t);
          window.scrollTo(0, 0);
          setTimeout(res, 400);
        }
      }, 120);
    });
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${dir}/${name}.png`, fullPage: full });
  // также «героическая» обрезка первого экрана для обложек
  await page.screenshot({ path: `${dir}/${name}-top.png`, fullPage: false });
  console.log("shot:", name);
}

await ctx.close();
await b.close();
console.log("done");
