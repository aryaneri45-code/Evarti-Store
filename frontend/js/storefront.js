const API_URL = "http://localhost:3000/api";
const CART_KEY = "evarti-store-cart-v1";
const IMAGE_DIR = "assets/images/sample-presets/";
const photos = ["cafe-portrait.jpg", "coast.jpg", "coffee.jpg", "portrait.jpg", "fashion.jpg", "sunrise.jpg"];

let products = [];
let categories = [];
let activeCategory = "all";
let activeSort = "featured";
let activeProduct = null;

const money = value => new Intl.NumberFormat("id-ID", {
  style: "currency", currency: "IDR", maximumFractionDigits: 0,
}).format(Number(value) || 0);
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);
const fallbackPhoto = product => `${IMAGE_DIR}${photos[(Number(product.id) - 1 + photos.length) % photos.length]}`;
const productPhoto = product => product.image || fallbackPhoto(product);
const productPreview = product => product.before_image && product.after_image;
const productGallery = product => {
  const offset = (Number(product.id) - 1) * 2;
  return [productPhoto(product), ...[1, 2].map(index => `${IMAGE_DIR}${photos[(offset + index) % photos.length]}`)];
};
const productUrl = product => `product.html?slug=${encodeURIComponent(product.slug)}`;
const cartItems = () => {
  try {
    const items = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    if (!Array.isArray(items)) return [];
    const uniqueItems = new Map();
    for (const item of items) {
      if (!item || typeof item.slug !== "string" || uniqueItems.has(item.slug)) continue;
      uniqueItems.set(item.slug, { ...item, quantity: 1 });
    }
    return [...uniqueItems.values()];
  }
  catch { return []; }
};
const saveCart = items => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartCount();
};
const countCart = () => cartItems().reduce((sum, item) => sum + item.quantity, 0);

function renderHeader() {
  document.querySelector("#site-header").innerHTML = `
    <header class="site-header">
      <a class="wordmark" href="index.html" aria-label="Evarti home"><img src="assets/images/evarti-logo-horizontal.png" alt="Evarti — Weaving stories into your life"></a>
      <button class="menu-toggle icon-button" type="button" aria-label="Open menu" aria-expanded="false" data-action="menu">☰</button>
      <nav class="primary-nav" aria-label="Main navigation">
        <a href="index.html" ${document.body.dataset.page === "home" ? 'aria-current="page"' : ""}>Home</a>
        <a href="store.html" ${document.body.dataset.page === "store" ? 'aria-current="page"' : ""}>Preset</a>
        <a href="tutorial.html" ${document.body.dataset.page === "tutorial" ? 'aria-current="page"' : ""}>Tutorial</a>
        <a href="about.html" ${document.body.dataset.page === "about" ? 'aria-current="page"' : ""}>About</a>
      </nav>
      <div class="header-tools">
        <a class="icon-button bag-link" href="cart.html" aria-label="Shopping bag, ${countCart()} items"><svg class="bag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 8h14l1 13H4L5 8Z"></path><path d="M9 8V6a3 3 0 0 1 6 0v2"></path></svg><span class="bag-count">${countCart()}</span></a>
        <button class="icon-button" type="button" aria-label="Search presets" data-action="search"><svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"></circle><path d="m16 16 5 5"></path></svg></button>
      </div>
    </header>
    <div class="search-panel" hidden>
      <form class="search-form" role="search"><label for="site-search">Search presets</label><input id="site-search" type="search" placeholder="Try ‘warm’ or ‘film’" autocomplete="off"><button class="icon-button" type="submit" aria-label="Submit search">⌕</button></form>
      <div class="search-results" aria-live="polite"></div>
    </div><div class="demo-banner">Ini adalah demo katalog. Checkout belum memproses pembayaran atau mengirim file.</div>`;
}

function renderFooter() {
  document.querySelector("#site-footer").innerHTML = `
    <footer class="site-footer">
      <div class="footer-social"><span>EVARTI PRESETS</span></div>
      <div class="footer-columns">
        <div><a class="wordmark footer-mark" href="index.html" aria-label="Evarti home"><img src="assets/images/evarti-logo-horizontal.png" alt="Evarti — Weaving stories into your life"></a></div>
        <div><h3>Help &amp; support</h3><a href="about.html#terms">Terms of Service</a><a href="tutorial.html#faq">FAQs</a></div>
        <div><h3>Metode pada simulasi</h3><div class="payment-logos" aria-label="Metode pembayaran yang ditampilkan dalam simulasi">
          <span class="payment-logo payment-mastercard"><img src="assets/images/payment-logos/mastercard.svg" alt="Mastercard" loading="lazy"></span>
          <span class="payment-logo payment-visa"><img src="assets/images/payment-logos/visa.svg" alt="Visa" loading="lazy"></span>
          <span class="payment-logo payment-qris"><img src="assets/images/payment-logos/qris.svg" alt="QRIS" loading="lazy"></span>
          <span class="payment-logo payment-gopay"><img src="assets/images/payment-logos/gopay.svg" alt="GoPay" loading="lazy"></span>
          <span class="payment-logo payment-ovo"><img src="assets/images/payment-logos/ovo-white.png" alt="OVO" loading="lazy"></span>
          <span class="payment-logo payment-shopeepay"><img src="assets/images/payment-logos/shopeepay.svg" alt="ShopeePay" loading="lazy"></span>
          <span class="payment-logo payment-va" aria-label="Virtual Account (VA)">VA</span>
        </div></div>
      </div>
      <div class="footer-bottom"><span>© ${new Date().getFullYear()} EVARTI PRESETS</span><span>Made for the photos you love.</span></div>
    </footer>`;
}

function renderOverlays() {
  document.querySelector("#site-overlays").innerHTML = `
    <div class="modal-backdrop" hidden data-action="close-modal"></div>
    <section class="added-modal" role="dialog" aria-modal="true" aria-labelledby="added-title" hidden>
      <button class="modal-close icon-button" type="button" aria-label="Close" data-action="close-modal">×</button>
      <p class="eyebrow">ADDED TO YOUR BAG</p><h2 id="added-title">A good choice.</h2><div class="added-product"></div>
      <a class="button button-dark full-button" href="cart.html">View bag (<span class="modal-count">0</span>)</a>
      <button class="text-button continue-shopping" type="button" data-action="close-modal">Continue shopping</button>
    </section>`;
}

function updateCartCount() {
  const count = countCart();
  const badge = document.querySelector(".bag-count");
  if (badge) badge.textContent = count;
  const link = document.querySelector(".bag-link");
  if (link) link.setAttribute("aria-label", `Shopping bag, ${count} items`);
  const modalCount = document.querySelector(".modal-count");
  if (modalCount) modalCount.textContent = count;
}

function cardMarkup(product) {
  const discounted = Number(product.compare_price) > Number(product.price);
  return `<article class="product-card" data-category="${escapeHtml(product.category_slug || "")}">
    <a class="product-image-link" href="${productUrl(product)}" aria-label="View ${escapeHtml(product.name)}">
      ${discounted ? '<span class="sale-badge">Sale</span>' : ""}
      <img src="${escapeHtml(productPhoto(product))}" alt="Foto contoh ${escapeHtml(product.name)}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackPhoto(product)}'">
      ${product.image ? "" : '<span class="image-disclaimer">Foto ilustrasi</span>'}
    </a>
    <div class="product-card-info"><a class="product-title" href="${productUrl(product)}">${escapeHtml(product.name)}</a>
      <span class="product-category">${escapeHtml(product.category_name || "Lightroom Preset")}</span>
      <div class="product-price">${discounted ? `<s>${money(product.compare_price)}</s>` : ""}<strong>${money(product.price)}</strong></div>
      <button class="button button-dark add-button" type="button" data-action="add" data-slug="${escapeHtml(product.slug)}">ADD TO CART</button>
    </div>
  </article>`;
}

function gridMarkup(list) {
  if (!list.length) return '<p class="empty-note">Belum ada preset di kategori ini.</p>';
  return list.map(cardMarkup).join("");
}

function renderHome() {
  const collage = ["cafe-portrait.jpg", "coffee.jpg", "portrait.jpg", "fashion.jpg", "sunrise.jpg", "coast.jpg", "portrait.jpg", "cafe-portrait.jpg", "coffee.jpg"];
  document.querySelector("#page-content").innerHTML = `
    <section class="hero-campaign">
      <div class="hero-collage">${collage.map((image, index) => `<img src="${IMAGE_DIR}${image}" alt="Evarti preset photo example ${index + 1}" ${index > 2 ? 'loading="lazy"' : ""}>`).join("")}
        <span class="collage-title">Everyday<br><i>stories</i></span>
      </div>
      <div class="hero-copy"><span class="eyebrow">NEW DROP</span><h1>Soft light.<br><em>Real moments.</em></h1><p>Presets made for the photos that feel like you.</p><a class="button button-outline" href="store.html">SHOP NOW <span>↗</span></a></div>
    </section>
    <section class="home-picks section-wrap" aria-labelledby="picks-title"><div class="center-heading"><h2 id="picks-title">Our picks</h2><p>Find your own kind of beautiful.</p></div><div class="product-grid home-product-grid">${gridMarkup(products.filter(product => product.is_featured).slice(0, 6))}</div><a class="text-link view-all" href="store.html">VIEW ALL PRESETS <span>↗</span></a></section>
    <section class="why-section"><p class="eyebrow">A LITTLE ABOUT US</p><h2>Why Evarti Presets?</h2><p class="why-copy">Setiap preset Evarti dibuat untuk membantu foto sehari-hari terasa lebih hidup. Pilih tone yang kamu suka, aplikasikan di Lightroom, lalu sesuaikan sedikit sampai hasilnya terasa milikmu.</p><a class="text-link" href="about.html">READ MORE <span>↗</span></a></section>
    <section class="benefit-strip"><article><span class="benefit-icon">✧</span><h3>Pilih tone</h3><p>Jelajahi gaya warna yang tersedia.</p></article><article><span class="benefit-icon">♡</span><h3>Pilih format</h3><p>Mobile DNG atau Desktop XMP.</p></article><article><span class="benefit-icon">↗</span><h3>Pelajari cara pakai</h3><p>Lihat panduan pemasangan preset.</p></article><article><span class="benefit-icon">⌑</span><h3>Lihat detail</h3><p>Periksa contoh dan informasi produk.</p></article></section>
    <section class="testimonial-section section-wrap" aria-labelledby="testimonial-title"><div class="center-heading"><p class="eyebrow">ULASAN PELANGGAN</p><h2 id="testimonial-title">Kata mereka tentang Olive Preset</h2></div><div class="testimonial-grid"><article><span class="stars" aria-label="5 dari 5 bintang">★★★★★</span><blockquote>“Presetnya bagus bangett 😻”</blockquote><strong>Sekar</strong><span class="review-product">Olive Preset</span></article><article><span class="stars" aria-label="5 dari 5 bintang">★★★★★</span><blockquote>“Awal ragu, tapi hasilnya keren bangett ga kaya di oren yang pada jual murah 😂”</blockquote><strong>Dinda Alifia</strong><span class="review-product">Olive Preset</span></article></div></section>
    <section class="instagram-band"><p>INSPIRASI FOTO</p><div>${collage.slice(0, 5).map(image => `<img src="${IMAGE_DIR}${image}" alt="Foto ilustrasi Evarti" loading="lazy">`).join("")}</div></section>`;
}

function renderStore(query = "") {
  const page = document.querySelector("#page-content");
  page.innerHTML = `<section class="page-intro"><p class="eyebrow">THE EVARTI COLLECTION</p><h1>Preset Store</h1><p>Find a tone that feels like yours.</p></section>
    <section class="store-section section-wrap"><div class="store-toolbar"><div class="category-filters" aria-label="Filter by category"><button type="button" class="filter-chip ${activeCategory === "all" ? "is-active" : ""}" data-category-filter="all">All presets</button>${categories.map(category => `<button type="button" class="filter-chip ${activeCategory === category.slug ? "is-active" : ""}" data-category-filter="${escapeHtml(category.slug)}">${escapeHtml(category.name)}</button>`).join("")}</div><label class="sort-control">Sort by <select id="sort-products"><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name</option></select></label></div>
    <div class="product-grid store-product-grid">${gridMarkup(filteredProducts(query))}</div><p class="store-count">Showing ${filteredProducts(query).length} presets</p></section>`;
  const sort = document.querySelector("#sort-products");
  if (sort) sort.value = activeSort;
}

function filteredProducts(query = "") {
  let list = [...products];
  if (activeCategory !== "all") list = list.filter(product => product.category_slug === activeCategory);
  if (query) list = list.filter(product => `${product.name} ${product.description} ${product.category_name}`.toLowerCase().includes(query.toLowerCase()));
  if (activeSort === "price-low") list.sort((a, b) => Number(a.price) - Number(b.price));
  if (activeSort === "price-high") list.sort((a, b) => Number(b.price) - Number(a.price));
  if (activeSort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
  if (activeSort === "featured") list.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
  return list;
}

function renderProduct(product) {
  activeProduct = product;
  document.title = `${product.name} — Evarti Presets`;
  const gallery = productGallery(product);
  const discounted = Number(product.compare_price) > Number(product.price);
  document.querySelector("#page-content").innerHTML = `<div class="breadcrumb"><a href="index.html">Home</a><span>/</span><a href="store.html">Preset</a><span>/</span><span>${escapeHtml(product.name)}</span></div>
    <section class="product-detail section-wrap"><div class="product-gallery"><div class="gallery-main"><img src="${escapeHtml(gallery[0])}" alt="Foto contoh ${escapeHtml(product.name)}" data-gallery-main onerror="this.onerror=null;this.src='${fallbackPhoto(product)}'"></div><div class="gallery-thumbs">${gallery.map((image, index) => `<button type="button" class="gallery-thumb ${index === 0 ? "is-active" : ""}" data-image="${escapeHtml(image)}" aria-label="Show sample ${index + 1}"><img src="${escapeHtml(image)}" alt="" onerror="this.onerror=null;this.src='${fallbackPhoto(product)}'"></button>`).join("")}</div><p class="gallery-note">${productPreview(product) ? "Lihat perbandingan asli di bawah." : "Foto galeri ini ilustrasi, bukan hasil edit preset."}</p></div>
    <div class="product-detail-copy"><p class="eyebrow">${escapeHtml(product.category_name || "LIGHTROOM PRESET")}</p><h1>${escapeHtml(product.name)}</h1><div class="detail-price">${discounted ? `<s>${money(product.compare_price)}</s>` : ""}<strong>${money(product.price)}</strong></div><p class="detail-description">${escapeHtml(product.description || "Preset Lightroom pilihan untuk memberi karakter pada foto-foto favoritmu.")}</p><div class="product-facts"><h2>Sebelum memilih</h2><p>Pilih format Mobile (DNG) untuk Lightroom Mobile atau Desktop (XMP) untuk Lightroom desktop. Hasil warna dapat berbeda sesuai cahaya dan foto asal.</p><p>Checkout situs ini masih demo; belum ada pembayaran atau pengiriman file otomatis.</p></div><label class="format-select">Pilih format<select id="product-format" aria-label="Choose your format"><option value="Mobile (DNG)">Mobile (DNG)</option><option value="Desktop (XMP)">Desktop (XMP)</option></select></label><div class="purchase-row"><button class="button button-dark detail-buy" type="button" data-action="buy-now">COBA CHECKOUT</button><button class="button button-outline detail-add" type="button" data-action="add-detail">ADD TO CART</button></div><p class="detail-meta">Maksimal 1 item per produk. Kategori: <a href="store.html?category=${encodeURIComponent(product.category_slug || "")}">${escapeHtml(product.category_name || "Preset")}</a></p><a class="text-link" href="tutorial.html">Cara memasang preset <span>↗</span></a></div></section>
    <section class="product-tabs section-wrap"><h2>Contoh visual</h2><p class="preview-disclaimer">${productPreview(product) ? "Bandingkan foto yang sama sebelum dan sesudah preset." : "Foto di bawah hanya ilustrasi suasana. Belum tersedia perbandingan asli sebelum dan sesudah untuk produk ini."}</p>${productPreview(product) ? `<div class="comparison" style="--reveal:50%"><img class="comparison-after" src="${escapeHtml(product.after_image)}" alt="Foto setelah preset"><img class="comparison-before" src="${escapeHtml(product.before_image)}" alt="Foto sebelum preset"><span class="comparison-label comparison-label-before">Sebelum</span><span class="comparison-label comparison-label-after">Sesudah</span></div><label class="comparison-control">Geser untuk membandingkan<input type="range" min="0" max="100" value="50" data-comparison aria-label="Bandingkan sebelum dan sesudah"></label>` : `<div class="sample-grid">${gallery.map((image, index) => `<figure><img src="${escapeHtml(image)}" alt="Foto ilustrasi ${index + 1}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackPhoto(product)}'"><figcaption>Foto ilustrasi 0${index + 1}</figcaption></figure>`).join("")}</div>`}</section>`;
}

function renderTutorial() {
  const ios = ["Siapkan file preset DNG di perangkatmu. Checkout demo ini belum menyediakan unduhan.", "Buka file ZIP yang berisi preset DNG.", "Simpan file DNG ke aplikasi Files atau galeri.", "Buka file DNG melalui Lightroom Mobile.", "Ketuk menu titik tiga di kanan atas.", "Pilih Create Preset, lalu beri nama preset.", "Gunakan preset baru pada foto lain dan sesuaikan exposure bila perlu."];
  const android = ["Siapkan file preset DNG di perangkatmu. Checkout demo ini belum menyediakan unduhan.", "Ekstrak file ZIP menggunakan file manager.", "Buka file DNG di Lightroom Mobile.", "Ketuk menu titik tiga lalu pilih Create Preset.", "Beri nama preset dan simpan ke grup yang kamu inginkan."];
  const steps = (items, title, photoset) => `<section class="tutorial-platform"><div class="platform-heading"><p class="eyebrow">STEP-BY-STEP GUIDE</p><h2>${title}</h2><p>Ikuti langkah sederhana ini untuk mulai mengedit.</p></div><div class="steps-grid">${items.map((item, index) => `<article class="tutorial-step"><img src="${IMAGE_DIR}${photos[(index + photoset) % photos.length]}" alt="Contoh visual tutorial langkah ${index + 1}" loading="lazy"><div><span>STEP ${String(index + 1).padStart(2, "0")}</span><p>${item}</p></div></article>`).join("")}</div></section>`;
  document.querySelector("#page-content").innerHTML = `<section class="page-intro tutorial-intro"><p class="eyebrow">LEARN WITH EVARTI</p><h1>Tutorial</h1><p>Quick &amp; easy preset installation.</p></section><div class="tutorial-content section-wrap">${steps(ios, "iOS · DNG FILE", 0)}${steps(android, "ANDROID · DNG FILE", 2)}<section class="faq-section" id="faq"><p class="eyebrow">NEED A HAND?</p><h2>FAQs</h2><details><summary>Apakah preset bisa digunakan di Lightroom gratis?</summary><p>Preset DNG dapat digunakan di aplikasi Lightroom Mobile. Pastikan aplikasi sudah diperbarui.</p></details><details><summary>Apakah preset langsung dikirim setelah pembelian?</summary><p>Belum. Checkout pada situs demo ini tidak menerima pembayaran atau mengirim file. Pengiriman otomatis belum tersedia.</p></details><details><summary>Bisakah satu preset terlihat berbeda pada foto?</summary><p>Hasil dapat berubah tergantung cahaya, kamera, dan warna foto asal. Sesuaikan exposure untuk hasil terbaik.</p></details></section></div>`;
}

function renderAbout() {
  document.querySelector("#page-content").innerHTML = `<section class="page-intro"><p class="eyebrow">A NOTE FROM EVARTI</p><h1>About us</h1><p>A little more feeling in every frame.</p></section><section class="about-story section-wrap"><img src="${IMAGE_DIR}cafe-portrait.jpg" alt="Warm afternoon at a cafe" loading="lazy"><div><p class="eyebrow">WHY EVARTI PRESETS?</p><h2>Make room for the moments that matter.</h2><p>Evarti adalah studio kecil yang menyukai foto dengan warna lembut, cahaya natural, dan cerita yang terasa personal. Kami membuat preset Lightroom supaya proses edit terasa mudah, konsisten, dan tetap memberi ruang untuk gayamu sendiri.</p><p>Setiap koleksi dirancang untuk menjadi titik awal, bukan aturan. Terapkan preset, sesuaikan dengan cahaya fotomu, lalu simpan hasil yang paling terasa seperti kamu.</p><a class="button button-outline" href="store.html">EXPLORE PRESETS <span>↗</span></a></div></section><section class="about-values"><article><span>01</span><h2>Thoughtful tones</h2><p>Warna dibuat dengan hati-hati dan diuji di beragam foto.</p></article><article><span>02</span><h2>Made for everyone</h2><p>Panduan sederhana membantu kamu mulai dari ponsel atau desktop.</p></article><article><span>03</span><h2>Your style first</h2><p>Preset adalah awal edit; sentuhan terakhirmu yang membuat foto khas.</p></article></section><section class="terms-section section-wrap" id="terms"><h2>Terms of service</h2><p>Preset Evarti adalah produk digital untuk penggunaan personal. Checkout saat ini hanya simulasi. Belum ada pembayaran, pesanan, atau file yang dikirim dari situs ini. Penggunaan ulang atau distribusi file tanpa izin tidak diperbolehkan.</p></section>`;
}

function renderCart() {
  const items = cartItems();
  const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const rows = items.map(item => `<article class="cart-row"><div class="cart-product-cell"><button class="cart-remove" type="button" data-action="remove" data-slug="${escapeHtml(item.slug)}" aria-label="Remove ${escapeHtml(item.name)}">×</button><a class="cart-thumb" href="product.html?slug=${encodeURIComponent(item.slug)}"><img src="${escapeHtml(item.image)}" alt=""></a><div class="cart-item-info"><a class="product-title" href="product.html?slug=${encodeURIComponent(item.slug)}">${escapeHtml(item.name)}</a><span>${escapeHtml(item.format || "Mobile (DNG)")}</span></div></div><span class="cart-price" data-label="Price">${money(item.price)}</span><span class="cart-quantity" data-label="Quantity">1</span><strong class="line-total" data-label="Subtotal">${money(item.price)}</strong></article>`).join("");
  document.querySelector("#page-content").innerHTML = `<section class="page-intro"><p class="eyebrow">YOUR SELECTION</p><h1>Shopping bag</h1></section><section class="cart-page section-wrap">${items.length ? `<div class="cart-layout"><div class="cart-items"><div class="cart-table-header" aria-hidden="true"><span>Product</span><span>Price</span><span>Quantity</span><span>Subtotal</span></div>${rows}<div class="cart-actions"><form class="coupon-form" id="coupon-form"><label class="visually-hidden" for="coupon-code">Coupon code</label><input id="coupon-code" name="code" type="text" placeholder="Coupon code" autocomplete="off"><button class="button button-dark" type="submit">APPLY COUPON</button><p class="coupon-message" role="status" aria-live="polite" hidden></p></form><a class="text-link" href="store.html">← CONTINUE SHOPPING</a></div></div><aside class="cart-summary"><h2>Cart totals</h2><div><span>Subtotal</span><strong data-cart-subtotal>${money(total)}</strong></div><div class="coupon-discount-row" data-coupon-row hidden><span data-coupon-label>Discount</span><strong data-coupon-discount></strong></div><div><span>Pengiriman</span><strong>Belum tersedia di demo</strong></div><div class="summary-total"><span>Total</span><strong data-cart-total>${money(total)}</strong></div><button type="button" class="button button-dark full-button" data-action="checkout-start">COBA CHECKOUT DEMO</button><p>Simulasi saja · Tidak ada pembayaran atau pengiriman file</p></aside></div><section class="checkout-panel" hidden><div class="checkout-heading"><p class="eyebrow">SIMULASI</p><h2>Checkout demo</h2><p>Formulir ini hanya untuk mencoba alur. Jangan masukkan data pribadi asli.</p></div><form id="checkout-form"><label>Nama lengkap<input name="name" autocomplete="name" required></label><label>Email<input name="email" type="email" autocomplete="email" required></label><label>Metode pembayaran<select name="payment" required><option value="">Pilih metode</option><option>QRIS</option><option value="virtual-account">Virtual Account (VA)</option><option>E-wallet</option></select></label><button class="button button-dark full-button" type="submit" data-checkout-total>PLACE DEMO ORDER · ${money(total)}</button><p class="checkout-note">Demo storefront: formulir ini tidak memproses pembayaran atau menyimpan pesanan ke server.</p></form></section>` : `<div class="cart-empty"><p class="empty-bag-icon">♧</p><h2>Your bag is empty</h2><p>Temukan preset untuk foto-foto favoritmu.</p><a class="button button-dark" href="store.html">SHOP PRESETS</a></div>`}</section>`;
}

function addToCart(product, format = "Mobile (DNG)") {
  const items = cartItems();
  const existing = items.find(item => item.slug === product.slug);
  if (!existing) items.push({ slug: product.slug, name: product.name, price: Number(product.price), image: productPhoto(product), format, quantity: 1 });
  saveCart(items);
  const modal = document.querySelector(".added-modal");
  modal.querySelector(".eyebrow").textContent = existing ? "ALREADY IN YOUR BAG" : "ADDED TO YOUR BAG";
  modal.querySelector("h2").textContent = existing ? "This preset is already selected." : "A good choice.";
  document.querySelector(".added-product").innerHTML = `<img src="${productPhoto(product)}" alt=""><div><strong>${escapeHtml(product.name)}</strong><span>${money(product.price)}</span></div>`;
  document.querySelector(".modal-backdrop").hidden = false;
  modal.hidden = false;
  document.body.classList.add("modal-open");
  updateCartCount();
}

function closeModal() {
  const modal = document.querySelector(".added-modal");
  if (modal) modal.hidden = true;
  const backdrop = document.querySelector(".modal-backdrop");
  if (backdrop) backdrop.hidden = true;
  document.body.classList.remove("modal-open");
}

function showSearchResults(query) {
  const results = document.querySelector(".search-results");
  if (!results) return;
  const q = query.trim().toLowerCase();
  if (!q) { results.innerHTML = '<p class="search-hint">Ketik nama preset atau tone yang kamu cari.</p>'; return; }
  const found = products.filter(product => `${product.name} ${product.description} ${product.category_name}`.toLowerCase().includes(q)).slice(0, 5);
  results.innerHTML = found.length ? found.map(product => `<a class="search-result" href="${productUrl(product)}"><img src="${productPhoto(product)}" alt=""><span>${escapeHtml(product.name)}<small>${money(product.price)}</small></span><b>↗</b></a>`).join("") : '<p class="search-hint">Tidak ada preset yang cocok.</p>';
}

function bindEvents() {
  document.addEventListener("click", event => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action === "menu") {
      const button = event.target.closest("[data-action=menu]");
      const open = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(open));
      document.querySelector(".primary-nav").classList.toggle("is-open", open);
    }
    if (action === "search") {
      const panel = document.querySelector(".search-panel");
      panel.hidden = !panel.hidden;
      if (!panel.hidden) { showSearchResults(""); document.querySelector("#site-search").focus(); }
    }
    if (action === "close-modal") closeModal();
    if (action === "add") {
      const product = products.find(item => item.slug === event.target.closest("[data-slug]").dataset.slug);
      if (product) addToCart(product);
    }
    if (action === "add-detail" && activeProduct) {
      addToCart(activeProduct, document.querySelector("#product-format").value);
    }
    if (action === "buy-now" && activeProduct) {
      addToCart(activeProduct, document.querySelector("#product-format").value);
      location.href = "cart.html?checkout=1";
    }
    if (action === "remove") {
      const slug = event.target.closest("[data-slug]").dataset.slug;
      saveCart(cartItems().filter(item => item.slug !== slug)); renderCart();
    }
    if (action === "checkout-start") document.querySelector(".checkout-panel").hidden = false;
    const filter = event.target.closest("[data-category-filter]");
    if (filter) { activeCategory = filter.dataset.categoryFilter; renderStore(new URLSearchParams(location.search).get("q") || ""); }
    const imageButton = event.target.closest("[data-image]");
    if (imageButton) {
      document.querySelector("[data-gallery-main]").src = imageButton.dataset.image;
      document.querySelectorAll(".gallery-thumb").forEach(button => button.classList.toggle("is-active", button === imageButton));
    }
    const tab = event.target.closest("[data-tab]");
    if (tab) {
      document.querySelectorAll(".tab-button").forEach(button => button.classList.toggle("is-active", button === tab));
      document.querySelectorAll(".tab-panel").forEach(panel => panel.hidden = panel.dataset.tabPanel !== tab.dataset.tab);
    }
  });

  document.addEventListener("input", event => {
    if (event.target.matches("#site-search")) showSearchResults(event.target.value);
    if (event.target.matches("[data-comparison]")) document.querySelector(".comparison")?.style.setProperty("--reveal", `${event.target.value}%`);
  });
  document.addEventListener("change", event => {
    if (event.target.matches("#sort-products")) { activeSort = event.target.value; renderStore(new URLSearchParams(location.search).get("q") || ""); }
  });
  document.addEventListener("submit", event => {
    if (event.target.matches(".search-form")) {
      event.preventDefault();
      const query = document.querySelector("#site-search").value.trim();
      location.href = `store.html?q=${encodeURIComponent(query)}`;
    }
    if (event.target.matches("#checkout-form")) {
      event.preventDefault();
      const formData = new FormData(event.target);
      const name = formData.get("name");
      saveCart([]);
      document.querySelector(".cart-page").innerHTML = `<div class="order-confirmation"><p class="eyebrow">DEMO ORDER</p><h2>Simulasi selesai, ${escapeHtml(name)}.</h2><p>Simulasi checkout berhasil. Tidak ada pembayaran yang diproses dan pesanan belum dikirim ke server.</p><a class="button button-dark" href="store.html">BACK TO STORE</a></div>`;
    }
    if (event.target.matches("#coupon-form")) {
      event.preventDefault();
      const code = new FormData(event.target).get("code").trim();
      const message = event.target.querySelector(".coupon-message");
      const submitButton = event.target.querySelector("button[type=submit]");
      if (!code) {
        message.textContent = "Enter a coupon code first.";
        message.hidden = false;
        return;
      }
      submitButton.disabled = true;
      message.textContent = "Checking coupon…";
      message.hidden = false;
      fetch(`${API_URL}/vouchers/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, items: cartItems().map(item => ({ slug: item.slug, quantity: 1 })) }),
      }).then(async response => {
        const result = await response.json();
        if (!response.ok || !result.valid) throw new Error(result.message || "This coupon code is invalid.");
        const discount = Number(result.discount) || 0;
        document.querySelector("[data-cart-subtotal]").textContent = money(result.subtotal);
        document.querySelector("[data-coupon-label]").textContent = `Discount (${result.code} · ${result.discount_percent}%)`;
        document.querySelector("[data-coupon-discount]").textContent = `−${money(discount)}`;
        document.querySelector("[data-coupon-row]").hidden = false;
        document.querySelector("[data-cart-total]").textContent = money(result.total);
        const checkoutButton = document.querySelector("[data-checkout-total]");
        if (checkoutButton) checkoutButton.textContent = `PLACE DEMO ORDER · ${money(result.total)}`;
        message.textContent = `Coupon ${result.code} applied — ${result.discount_percent}% off.`;
      }).catch(error => {
        const baseTotal = cartItems().reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
        document.querySelector("[data-coupon-row]").hidden = true;
        document.querySelector("[data-cart-subtotal]").textContent = money(baseTotal);
        document.querySelector("[data-cart-total]").textContent = money(baseTotal);
        const checkoutButton = document.querySelector("[data-checkout-total]");
        if (checkoutButton) checkoutButton.textContent = `PLACE DEMO ORDER · ${money(baseTotal)}`;
        message.textContent = error.message === "Failed to fetch" ? "Coupon validation is unavailable. Your total is unchanged." : error.message;
      }).finally(() => { submitButton.disabled = false; });
    }
  });
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });
}

async function loadCatalog() {
  try {
    const productResponse = await fetch(`${API_URL}/products`);
    if (!productResponse.ok) throw new Error("Product API unavailable");
    const productResult = await productResponse.json();
    products = Array.isArray(productResult.data) ? productResult.data : [];
    try {
      const categoryResponse = await fetch(`${API_URL}/categories`);
      if (categoryResponse.ok) {
        const categoryResult = await categoryResponse.json();
        categories = Array.isArray(categoryResult.data) ? categoryResult.data : [];
      }
    } catch {
      categories = [];
    }
  } catch (error) {
    console.warn("Catalog could not be loaded:", error.message);
    products = [];
    categories = [];
  }
}

async function init() {
  renderHeader(); renderFooter(); renderOverlays(); bindEvents();
  const page = document.body.dataset.page;
  if (["home", "store", "product"].includes(page)) await loadCatalog();
  if (page === "home") renderHome();
  if (page === "store") {
    const category = new URLSearchParams(location.search).get("category");
    if (category) activeCategory = category;
    const query = new URLSearchParams(location.search).get("q") || "";
    renderStore(query);
  }
  if (page === "product") {
    const slug = new URLSearchParams(location.search).get("slug");
    const product = products.find(item => item.slug === slug);
    if (product) renderProduct(product);
    else document.querySelector("#page-content").innerHTML = '<section class="page-intro"><h1>Preset not found</h1><p>Preset ini mungkin sudah tidak tersedia.</p><a class="button button-dark" href="store.html">BACK TO STORE</a></section>';
  }
  if (page === "tutorial") renderTutorial();
  if (page === "about") renderAbout();
  if (page === "cart") {
    renderCart();
    if (new URLSearchParams(location.search).get("checkout") === "1") {
      const checkoutPanel = document.querySelector(".checkout-panel");
      if (checkoutPanel) {
        checkoutPanel.hidden = false;
        checkoutPanel.scrollIntoView({ block: "start", behavior: "smooth" });
      }
    }
  }
  updateCartCount();
}

document.addEventListener("DOMContentLoaded", init);
