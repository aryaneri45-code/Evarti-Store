# Evarti Store

Etalase digital untuk koleksi Lightroom preset dan produk kreatif Evarti Store. Proyek ini berisi frontend berbasis HTML, CSS, dan JavaScript serta REST API berbasis Node.js, Express, dan MySQL.

## Fitur saat ini

- Homepage, katalog preset, filter kategori, pengurutan harga, dan pencarian.
- Halaman detail dengan galeri contoh, format preset, kuantitas, serta add-to-bag.
- Shopping bag tersimpan di browser dan alur checkout demo.
- Halaman About dan panduan instalasi iOS/Android.
- API untuk membaca produk dan kategori serta endpoint health check.

> Checkout frontend hanya simulasi. Backend belum menyimpan pesanan, memproses pembayaran, atau mengirim file digital.

## Foto pratinjau produk

Foto contoh di `frontend/assets/images/sample-presets/` adalah ilustrasi, bukan bukti hasil preset. Untuk menampilkan perbandingan sebelum/sesudah yang asli, simpan **dua foto dari sumber yang sama** di `product_images` untuk satu produk: satu baris dengan `alt_text` persis `Before`, satu baris dengan `alt_text` persis `After`. Kolom `image_path` harus berisi URL atau path gambar yang dapat diakses browser. API katalog akan mengembalikan keduanya sebagai `before_image` dan `after_image`, lalu halaman produk menampilkan slider perbandingan. Bila pasangan gambar belum ada, halaman akan menampilkan label ilustrasi.

## Struktur proyek

```text
backend/
  src/
    config/       Koneksi MySQL
    controllers/  Handler endpoint API
    models/       Query database
    routes/       Rute API
  package.json
frontend/
  index.html      Homepage
  store.html      Katalog dan pencarian
  product.html    Detail preset
  cart.html       Shopping bag dan checkout demo
  tutorial.html   Panduan pemasangan
  about.html      Informasi Evarti
  css/            Stylesheet
  js/             Katalog, pencarian, dan cart
  assets/         Gambar dan ikon
database/         File skema database lokal
```

## Persyaratan

- Node.js dan npm
- MySQL
- Python 3 atau web server statis lain untuk menyajikan frontend

## Menjalankan backend

1. Masuk ke folder backend dan pasang dependensi:

   ```bash
   cd backend
   npm install
   ```

2. Buat file `backend/.env` dengan konfigurasi database:

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=password_mysql_anda
   DB_NAME=evarti_store
   ```

   Sesuaikan nilai koneksi dengan konfigurasi MySQL lokal. Jangan commit file `.env`.

3. Siapkan database MySQL `evarti_store` beserta tabel-tabel yang diperlukan. File skema berada di `database/schema.sql` pada working copy lokal, tetapi folder `database/` diabaikan Git dan tidak tersedia otomatis setelah clone. Jika file tersebut tidak ada, minta skema database dari pengelola proyek.

4. Jalankan server:

   ```bash
   npm run dev
   ```

   Backend berjalan di `http://localhost:3000`. Untuk menjalankan tanpa nodemon, gunakan `npm start`.

## Menjalankan frontend

Di terminal lain, jalankan server statis dari folder frontend:

```bash
cd frontend
python3 -m http.server 5500
```

Buka `http://localhost:5500` di browser. Frontend mengambil data produk dari `http://localhost:3000/api`, jadi backend dan database perlu berjalan agar daftar produk dapat dimuat.

## Menjalankan frontend dan backend

Dari folder utama proyek, jalankan keduanya sekaligus:

```bash
npm run dev
```

Frontend tersedia di `http://localhost:5500` dan API di `http://localhost:3000`. Pastikan MySQL dan konfigurasi `backend/.env` sudah siap. Tekan `Ctrl+C` untuk menghentikan kedua server.

## Endpoint API

| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/` | Informasi singkat API |
| `GET` | `/api/health` | Status backend |
| `GET` | `/api/health/database` | Status koneksi database |
| `GET` | `/api/products` | Daftar produk yang dipublikasikan |
| `GET` | `/api/products/:slug` | Detail produk berdasarkan slug |
| `GET` | `/api/categories` | Daftar kategori aktif |
| `GET` | `/api/categories/:slug` | Detail kategori berdasarkan slug |
| `POST` | `/api/vouchers/validate` | Validasi kupon `TANADA` dan hitung diskon 10% dari harga produk published |

## Pengembangan

Skrip yang tersedia di `backend/package.json`:

- `npm run dev` — jalankan backend dengan nodemon.
- `npm start` — jalankan backend.
- `npm test` — belum dikonfigurasi untuk menjalankan pengujian.

## Pemeriksaan frontend dengan Playwright

Playwright menjalankan alur storefront di Chromium desktop dan ukuran layar mobile. Tes memakai data katalog contoh, jadi backend dan MySQL tidak perlu aktif. Instal dependensi dan browser satu kali:

```bash
npm install
npx playwright install chromium
```

Jalankan cek browser:

```bash
npm run test:e2e
```

Untuk membuka browser saat tes atau membuat screenshot halaman penuh:

```bash
npm run test:e2e:headed
npm run screenshot
```

Screenshot disimpan sebagai `artifacts/evarti-homepage.png` secara default. Lokasi lain bisa diberikan sebagai argumen, misalnya `npm run screenshot -- /tmp/evarti.png`.
