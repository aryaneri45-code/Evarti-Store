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
  await expect(page.locator(".bag-link .bag-icon")).toBeVisible();
  await expect(page.locator(".bag-link")).toHaveAttribute("aria-label", "Shopping bag, 0 items");
  await expect(page.getByRole("heading", { name: /Soft light/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Our picks" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Kata mereka tentang Olive Preset" })).toBeVisible();
  await expect(page.locator(".testimonial-grid article")).toHaveCount(2);
  await expect(page.locator(".testimonial-grid")).toContainText("Presetnya bagus bangett 😻");
  await expect(page.locator(".testimonial-grid")).toContainText("Dinda Alifia");
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
  await expect(page.locator(".payment-va")).toHaveText("VA");
  await expect(page.locator(".payment-va")).toHaveAttribute("aria-label", "Virtual Account (VA)");
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

test("product page gallery, tabs, and one-per-product add-to-bag work", async ({ page }) => {
  await page.goto("/product.html?slug=soft-pink-preset");
  await expect(page.getByRole("heading", { name: "Soft Pink Preset" })).toBeVisible();
  await expect(page.getByText("Rp 25.000").first()).toBeVisible();
  await page.getByRole("button", { name: "Show sample 2" }).click();
  await expect(page.locator("[data-gallery-main]")).toHaveAttribute("src", /coast\.jpg/);
  await expect(page.getByText(/Maksimal 1 item per produk/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Increase quantity" })).toHaveCount(0);
  await expect(page.getByText(/hanya ilustrasi suasana/)).toBeVisible();
  await page.getByRole("button", { name: "ADD TO CART" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".bag-count")).toHaveText("1");
  await page.getByRole("button", { name: "Continue shopping" }).click();
  await page.getByRole("button", { name: "ADD TO CART" }).click();
  await expect(page.getByText("This preset is already selected.")).toBeVisible();
  await expect(page.locator(".bag-count")).toHaveText("1");
  await page.getByRole("link", { name: /View bag/ }).click();
  await expect(page).toHaveURL(/cart\.html/);
  await expect(page.locator(".line-total")).toHaveText("Rp 25.000");
  await expect(page.getByText("Mobile (DNG)")).toBeVisible();
  await expect(page.locator(".cart-quantity")).toHaveText("1");
});

test("bag item limit, remove, and demo checkout work", async ({ page }) => {
  await page.route("**/api/vouchers/validate", async route => {
    const request = route.request().postDataJSON();
    expect(request.code).toBe("TANADA");
    expect(request.items).toEqual([{ slug: "creamy-tone-preset", quantity: 1 }]);
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
      success: true, valid: true, code: "TANADA", discount_percent: 10, subtotal: 30000, discount: 3000, total: 27000,
    }) });
  });
  await page.goto("/product.html?slug=creamy-tone-preset");
  await page.getByRole("button", { name: "ADD TO CART" }).click();
  await page.getByRole("link", { name: /View bag/ }).click();
  await expect(page.getByRole("button", { name: "Increase quantity" })).toHaveCount(0);
  await expect(page.locator(".line-total")).toHaveText("Rp 30.000");
  await expect(page.getByText("Mobile (DNG)")).toBeVisible();
  await expect(page.locator(".cart-quantity")).toHaveText("1");
  await page.getByRole("textbox", { name: "Coupon code" }).fill("TANADA");
  await page.getByRole("button", { name: "APPLY COUPON" }).click();
  await expect(page.getByRole("status")).toHaveText("Coupon TANADA applied — 10% off.");
  await expect(page.locator("[data-coupon-row]")).toContainText("3.000");
  await expect(page.locator(".summary-total")).toContainText("Rp 27.000");
  await page.getByRole("button", { name: "COBA CHECKOUT DEMO" }).click();
  await page.getByLabel("Nama lengkap").fill("Test Customer");
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByRole("combobox", { name: "Metode pembayaran", exact: true }).selectOption("virtual-account");
  await expect(page.getByRole("combobox", { name: "Metode pembayaran", exact: true })).toHaveValue("virtual-account");
  await page.getByRole("combobox", { name: "Metode pembayaran", exact: true }).selectOption({ label: "QRIS" });
  await page.getByRole("button", { name: /PLACE DEMO ORDER/ }).click();
  await expect(page.getByRole("heading", { name: /Simulasi selesai, Test Customer/ })).toBeVisible();
  await expect(page.locator(".bag-count")).toHaveText("0");
});

test("invalid coupon codes leave the cart total unchanged", async ({ page }) => {
  await page.route("**/api/vouchers/validate", route => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ success: true, valid: false, message: "Coupon code is invalid" }),
  }));
  await page.goto("/product.html?slug=creamy-tone-preset");
  await page.getByRole("button", { name: "ADD TO CART" }).click();
  await page.getByRole("link", { name: /View bag/ }).click();
  await page.getByRole("textbox", { name: "Coupon code" }).fill("NOPE");
  await page.getByRole("button", { name: "APPLY COUPON" }).click();
  await expect(page.getByRole("status")).toHaveText("Coupon code is invalid");
  await expect(page.locator("[data-coupon-row]")).toBeHidden();
  await expect(page.locator(".summary-total")).toContainText("Rp 30.000");
});

test("buy now opens checkout with the selected product", async ({ page }) => {
  await page.goto("/product.html?slug=soft-pink-preset");
  await page.getByLabel("Choose your format").selectOption("Desktop (XMP)");
  await page.getByRole("button", { name: "COBA CHECKOUT" }).click();
  await expect(page).toHaveURL(/cart\.html\?checkout=1/);
  await expect(page.getByRole("heading", { name: "Checkout demo" })).toBeVisible();
  await expect(page.locator(".cart-row")).toContainText("Soft Pink Preset");
  await expect(page.locator(".cart-row")).toContainText("Desktop (XMP)");
  await expect(page.locator(".cart-quantity")).toHaveText("1");
});

test("legacy or edited bag data cannot show duplicate units of one product", async ({ page }) => {
  await page.goto("/cart.html");
  await page.evaluate(() => localStorage.setItem("evarti-store-cart-v1", JSON.stringify([
    { slug: "soft-pink-preset", name: "Soft Pink Preset", price: 25000, quantity: 9, image: "assets/images/sample-presets/cafe-portrait.jpg" },
    { slug: "soft-pink-preset", name: "Soft Pink Preset", price: 25000, quantity: 2, image: "assets/images/sample-presets/cafe-portrait.jpg" },
  ])));
  await page.reload();
  await expect(page.locator(".cart-row")).toHaveCount(1);
  await expect(page.locator(".cart-quantity")).toHaveText("1");
  await expect(page.locator(".line-total")).toHaveText("Rp 25.000");
});

test("cart uses a four-column summary on desktop and compact item cards on mobile", async ({ page }) => {
  await page.goto("/cart.html");
  await page.evaluate(() => localStorage.setItem("evarti-store-cart-v1", JSON.stringify([
    { slug: "soft-pink-preset", name: "Soft Pink Preset", price: 25000, quantity: 1, image: "assets/images/sample-presets/cafe-portrait.jpg" },
  ])));
  await page.reload();
  await expect(page.locator(".cart-table-header")).toContainText("Product");
  await expect(page.locator(".cart-table-header")).toContainText("Price");
  await expect(page.locator(".cart-table-header")).toContainText("Quantity");
  await expect(page.locator(".cart-table-header")).toContainText("Subtotal");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".cart-table-header")).toBeHidden();
  await expect(page.locator(".cart-quantity")).toBeVisible();
  const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(widths.content).toBeLessThanOrEqual(widths.viewport);
});

test("removing the last item returns the bag to its empty state", async ({ page }) => {
  await page.goto("/product.html?slug=vintage-film-preset");
  await page.getByRole("button", { name: "ADD TO CART" }).click();
  await page.getByRole("link", { name: /View bag/ }).click();
  await page.getByRole("button", { name: "Remove Vintage Film Preset" }).click();
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
  await expect(page.getByRole("heading", { name: "Koleksi belum dapat dimuat" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Coba lagi" })).toBeVisible();
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

test("mobile catalog keeps product cards readable and checkout is identified as demo", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/store.html");
  await expect(page.locator(".demo-banner")).toContainText("Checkout belum memproses pembayaran");
  const layout = await page.locator(".store-product-grid").evaluate(grid => ({
    columns: getComputedStyle(grid).gridTemplateColumns.split(" ").length,
    buttonHeight: grid.querySelector(".add-button").getBoundingClientRect().height,
  }));
  expect(layout.columns).toBe(2);
  expect(layout.buttonHeight).toBeGreaterThanOrEqual(44);
});

test("product with real preview images shows an interactive comparison", async ({ page }) => {
  const withPreview = { ...catalog, data: catalog.data.map((product, index) => index === 0 ? {
    ...product,
    before_image: "assets/images/sample-presets/cafe-portrait.jpg",
    after_image: "assets/images/sample-presets/coffee.jpg",
  } : product) };
  await page.route("http://localhost:3000/api/products**", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(withPreview) }));
  await page.goto("/product.html?slug=soft-pink-preset");
  await expect(page.locator(".comparison")).toBeVisible();
  await page.getByRole("slider", { name: "Bandingkan sebelum dan sesudah" }).fill("75");
  await expect(page.locator(".comparison")).toHaveCSS("--reveal", "75%");
});


test("catalog search, filters, and sort survive reload and can be reset", async ({ page }) => {
  await page.goto("/store.html");
  const search = page.getByRole("searchbox", { name: "Cari dalam koleksi" });
  await search.fill("Creamy");
  await expect(search).toBeFocused();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Desktop Presets", exact: true }).click();
  await expect(page.getByRole("button", { name: "Desktop Presets", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.locator("#sort-products").selectOption("price-high");
  await expect(page).toHaveURL(/q=Creamy&category=desktop-presets&sort=price-high/);
  await page.reload();
  await expect(search).toHaveValue("Creamy");
  await expect(page.locator("#sort-products")).toHaveValue("price-high");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await search.fill("no matching preset");
  await expect(page.locator(".product-card")).toHaveCount(0);
  await page.getByRole("button", { name: "Lihat semua preset" }).click();
  await expect(page.locator(".product-card")).toHaveCount(3);
  await expect(page).toHaveURL(/store\.html$/);
});

test("bag dialog contains keyboard focus and returns it to the add button", async ({ page }) => {
  await page.goto("/product.html?slug=soft-pink-preset");
  const add = page.getByRole("button", { name: "ADD TO CART", exact: true });
  await add.click();
  const close = page.getByRole("button", { name: "Close", exact: true });
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Continue shopping" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(add).toBeFocused();
  await expect(page.locator("main")).not.toHaveAttribute("inert");
});

test("search and mobile navigation expose state and close with Escape", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Search presets", exact: true });
  const menu = page.getByRole("button", { name: "Open menu" });
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await toggle.click();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("searchbox", { name: "Search presets" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});

test("all storefront pages fit small phones, tablets, and desktops", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of ["/store.html", "/product.html?slug=soft-pink-preset", "/cart.html", "/tutorial.html", "/about.html"]) {
    await page.goto(path);
    await expect(page.locator("main h1")).toBeVisible();
    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const size = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
      expect(size.content, `${path} at ${width}px`).toBeLessThanOrEqual(size.viewport);
    }
  }
});
