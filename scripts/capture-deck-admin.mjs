// Админ-скриншоты для деска. node scripts/capture-deck-admin.mjs <auth_token>
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { execSync } from "node:child_process";
const require = createRequire(import.meta.url);
const { chromium } = require(`${execSync("npm root -g").toString().trim()}/playwright`);

const BASE = process.env.BASE || "http://localhost:3007";
const TOKEN = process.argv[2];

const PAGES = [
  ["admin-dashboard", "/ru/admin"],
  ["admin-analytics", "/ru/admin/analytics"],
  ["admin-events", "/ru/admin/events"],
  ["admin-chatbot", "/ru/admin/chatbot"],
  ["admin-ai-usage", "/ru/admin/ai-usage"],
  ["admin-scheduler", "/ru/admin/scheduler"],
];

const dir = "docs/screenshots/admin";
await mkdir(dir, { recursive: true });

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, locale: "ru-RU" });
await ctx.addCookies([{ name: "auth_token", value: TOKEN, url: BASE }]);
const page = await ctx.newPage();

for (const [name, path] of PAGES) {
  try {
    await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 30000 });
  } catch {
    await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 30000 });
  }
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${dir}/${name}.png`, fullPage: false });
  console.log("shot:", name);
}

await ctx.close();
await b.close();
console.log("done");
