import { chromium, devices } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const port = Number(process.env.PORT || 5500);
const url = `http://127.0.0.1:${port}`;
const output = process.argv[2] || "artifacts/evarti-homepage.png";
const pagePath = process.argv[3] || "/";
const viewportWidth = Number(process.argv[4] || devices["Desktop Chrome"].viewport.width);
const server = spawn("python3", ["-m", "http.server", String(port), "--directory", "frontend"], {
  stdio: "ignore",
});
let browser;

try {
  let ready = false;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {}
    await delay(250);
  }
  if (!ready) throw new Error(`Frontend did not start at ${url}`);

  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: viewportWidth, height: 900 } });
  await page.route("http://localhost:3000/api/products", route => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      success: true,
      data: [
        { id: 1, name: "Soft Pink Preset", slug: "soft-pink-preset", description: "Soft pink tone", price: 25000, compare_price: 35000, is_featured: 1, category_name: "Mobile Presets", category_slug: "mobile-presets", image: null },
        { id: 2, name: "Creamy Tone Preset", slug: "creamy-tone-preset", description: "Warm creamy tone", price: 30000, compare_price: 40000, is_featured: 1, category_name: "Lightroom Presets", category_slug: "lightroom-presets", image: null },
        { id: 3, name: "Vintage Film Preset", slug: "vintage-film-preset", description: "Vintage film tone", price: 20000, compare_price: 30000, is_featured: 1, category_name: "Desktop Presets", category_slug: "desktop-presets", image: null },
      ],
    }),
  }));
  await page.route("http://localhost:3000/api/categories", route => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ success: true, data: [{ name: "Mobile Presets", slug: "mobile-presets" }] }),
  }));
  await page.goto(new URL(pagePath, url).href, { waitUntil: "networkidle" });
  await page.locator("main img").evaluateAll(async images => {
    await Promise.all(images.map(image => { image.loading = "eager"; return image.decode().catch(() => null); }));
  });
  await mkdir(dirname(output), { recursive: true });
  await page.screenshot({ path: output, fullPage: true });
  await browser.close();
  console.log(`Screenshot saved to ${output}`);
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
