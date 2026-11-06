import { test, expect } from "@playwright/test";

const catalog = {
  success: true,
  data: [
    { id: 1, name: "Soft Pink Preset", slug: "soft-pink-preset", description: "Soft pink photo tone", price: "25000.00", compare_price: "35000.00", is_featured: 1, category_name: "Mobile Presets", category_slug: "mobile-presets", image: null },
    { id: 2, name: "Creamy Tone Preset", slug: "creamy-tone-preset", description: "Warm creamy photo tone", price: "30000.00", compare_price: "40000.00", is_featured: 1, category_name: "Desktop Presets", category_slug: "desktop-presets", image: null },
    { id: 3, name: "Vintage Film Preset", slug: "vintage-film-preset", description: "Vintage film style", price: "20000.00", compare_price: "30000.00", is_featured: 1, category_name: "Lightroom Presets", category_slug: "lightroom-presets", image: null },
  ],
};
const categoryResult = {
  success: true,
  data: [
    { name: "Mobile Presets", slug: "mobile-presets" },
    { name: "Desktop Presets", slug: "desktop-presets" },
    { name: "Lightroom Presets", slug: "lightroom-presets" },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.route("http://localhost:3000/api/products**", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(catalog) }));
  await page.route("http://localhost:3000/api/categories**", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(categoryResult) }));
});

test("home page, product cards, and sample images load", async ({ page }) => {
  await page.goto("/");
  const logo = page.locator(".site-header .wordmark img");
  await expect(logo).toHaveAttribute("src", "assets/images/evarti-logo-horizontal.png");
  await expect.poll(() => logo.evaluate(image => image.complete && image.naturalWidth > 0)).toBeTruthy();
  await expect(page.getByRole("heading", { name: /Soft light/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Our picks" })).toBeVisible();
  await expect(page.getByRole("article").filter({ hasText: "Soft Pink Preset" })).toBeVisible();
  expect(await page.locator(".product-card").count()).toBe(3);

  const imagesLoaded = await page.locator("main img").evaluateAll(async images => {
    await Promise.all(images.map(image => {
      image.loading = "eager";
      return image.decode().catch(() => null);
    }));
    return images.every(image => image.complete && image.naturalWidth > 0);
  });
  expect(imagesLoaded).toBeTruthy();
});

test("footer displays all requested payment marks", async ({ page }) => {
  await page.goto("/");
  const logos = page.locator(".payment-logo img");
  await expect(logos).toHaveCount(6);
  const loaded = await logos.evaluateAll(async images => {
    await Promise.all(images.map(image => {
      image.loading = "eager";
      return image.decode().catch(() => null);
    }));
    return images.every(image => image.complete && image.naturalWidth > 0 && image.alt.length > 0);
  });
  expect(loaded).toBeTruthy();
});

test("store filters by category, sorts, and searches products", async ({ page }) => {
  await page.goto("/store.html");
  await page.getByRole("button", { name: "Mobile Presets" }).click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await expect(page.getByText("Soft Pink Preset")).toBeVisible();

  await page.goto("/store.html?q=Vintage");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await expect(page.getByText("Vintage Film Preset")).toBeVisible();

  await page.goto("/store.html");
  await page.locator("#sort-products").selectOption("price-low");
  await expect(page.locator(".product-card .product-title").first()).toHaveText("Vintage Film Preset");
});

test("header search opens results and navigates to the selected preset", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search presets" }).click();
  await page.getByRole("searchbox", { name: "Search presets" }).fill("Creamy");
  await page.locator(".search-result").filter({ hasText: "Creamy Tone Preset" }).click();
  await expect(page).toHaveURL(/product\.html\?slug=creamy-tone-preset/);
  await expect(page.getByRole("heading", { name: "Creamy Tone Preset" })).toBeVisible();
});

test("product page gallery, quantity, tabs, and add-to-bag work", async ({ page }) => {
  await page.goto("/product.html?slug=soft-pink-preset");
  await expect(page.getByRole("heading", { name: "Soft Pink Preset" })).toBeVisible();
  await expect(page.getByText("Rp 25.000").first()).toBeVisible();
  await page.getByRole("button", { name: "Show sample 2" }).click();
  await expect(page.locator("[data-gallery-main]")).toHaveAttribute("src", /coast\.jpg/);
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await expect(page.locator("#quantity-value")).toHaveText("2");
  await page.getByRole("button", { name: "Reviews (0)" }).click();
  await expect(page.getByText("Belum ada ulasan untuk preset ini.")).toBeVisible();
  await page.getByRole("button", { name: "Description" }).click();
  await page.getByRole("button", { name: "ADD TO CART" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".bag-count")).toHaveText("2");
  await page.getByRole("link", { name: /View bag/ }).click();
  await expect(page).toHaveURL(/cart\.html/);
  await expect(page.locator(".line-total")).toHaveText("Rp 50.000");
});

test("bag quantities, remove, and demo checkout work", async ({ page }) => {
  await page.goto("/product.html?slug=creamy-tone-preset");
  await page.getByRole("button", { name: "ADD TO CART" }).click();
  await page.getByRole("link", { name: /View bag/ }).click();
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await expect(page.locator(".line-total")).toHaveText("Rp 60.000");
  await page.getByRole("button", { name: "PROCEED TO CHECKOUT" }).click();
  await page.getByLabel("Nama lengkap").fill("Test Customer");
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Metode pembayaran").selectOption({ label: "QRIS" });
  await page.getByRole("button", { name: /PLACE DEMO ORDER/ }).click();
  await expect(page.getByRole("heading", { name: /Terima kasih, Test Customer/ })).toBeVisible();
  await expect(page.locator(".bag-count")).toHaveText("0");
});

test("removing the last item returns the bag to its empty state", async ({ page }) => {
  await page.goto("/product.html?slug=vintage-film-preset");
  await page.getByRole("button", { name: "ADD TO CART" }).click();
  await page.getByRole("link", { name: /View bag/ }).click();
  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByRole("heading", { name: "Your bag is empty" })).toBeVisible();
  await expect(page.locator(".bag-count")).toHaveText("0");
});

test("tutorial and about pages load their content and links", async ({ page }) => {
  await page.goto("/tutorial.html");
  await expect(page.getByRole("heading", { name: "Tutorial" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "iOS · DNG FILE" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "ANDROID · DNG FILE" })).toBeVisible();
  await page.getByText("FAQs", { exact: true }).last().click();
  await expect(page.locator("#faq")).toBeInViewport();

  await page.goto("/about.html");
  await expect(page.getByRole("heading", { name: "About us" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Make room for the moments/ })).toBeVisible();
});

test("empty and unavailable API states remain readable", async ({ page }) => {
  await page.route("http://localhost:3000/api/products**", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: [] }) }));
  await page.goto("/");
  await expect(page.getByText("Belum ada preset di kategori ini.")).toBeVisible();

  await page.unroute("http://localhost:3000/api/products**");
  await page.route("http://localhost:3000/api/products**", route => route.abort("failed"));
  await page.goto("/store.html");
  await expect(page.getByText("Belum ada preset di kategori ini.")).toBeVisible();
});

test("products remain visible when only the category API is unavailable", async ({ page }) => {
  await page.route("http://localhost:3000/api/categories**", route => route.abort("failed"));
  await page.goto("/store.html");
  await expect(page.locator(".product-card")).toHaveCount(3);
});

test("mobile navigation works without horizontal overflow", async ({ page }) => {
  await page.goto("/");
  for (const width of [320, 360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(dimensions.viewport);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("navigation")).toBeVisible();
  await page.getByRole("navigation").getByRole("link", { name: "Tutorial" }).click();
  await expect(page).toHaveURL(/tutorial\.html/);
});
