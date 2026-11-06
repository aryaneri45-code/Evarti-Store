# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# Evarti Store

**Versi:** 1.0.0  
**Status:** Initial Planning  
**Jenis Proyek:** Digital Product E-Commerce  
**Referensi Desain:** Selina Presets  
**Tanggal:** 6 November 2026

---

# 1. Project Overview

## 1.1 Deskripsi Proyek

Evarti Store adalah platform e-commerce yang berfokus pada penjualan produk digital, khususnya Lightroom Presets dan produk kreatif digital lainnya.

Website ini dirancang dengan tampilan modern, elegan, minimalis, dan responsif. Referensi visual utama adalah Selina Presets, dengan identitas visual dan branding Evarti Store sendiri.

Pengunjung dapat melihat katalog produk, mempelajari detail produk, melakukan pembelian, menyelesaikan pembayaran, dan mengunduh produk digital setelah pembayaran berhasil diverifikasi.

Administrator memiliki akses ke dashboard untuk mengelola produk, pesanan, pelanggan, transaksi, promosi, dan laporan penjualan.

## 1.2 Project Goals

Tujuan utama pengembangan Evarti Store:

1. Membangun toko online khusus produk digital.
2. Menyediakan pengalaman belanja yang mudah dan nyaman.
3. Mengotomatiskan proses pembayaran dan pengiriman produk digital.
4. Menyediakan sistem pengelolaan toko melalui dashboard administrator.
5. Memastikan keamanan transaksi dan file digital.
6. Membuat website responsif untuk desktop, tablet, dan smartphone.
7. Menyediakan fondasi sistem yang mudah dikembangkan.

## 1.3 Target Pengguna

- Fotografer dan content creator.
- Pengguna Adobe Lightroom.
- Penggemar fotografi dan editing.
- Pengguna yang mencari preset foto berkualitas.
- Pelanggan yang membutuhkan produk digital praktis.

---

# 2. Technology Stack

Teknologi yang digunakan dalam pengembangan Evarti Store:

| Komponen | Teknologi |
|---|---|
| Frontend | HTML5 |
| Styling | CSS3 |
| Frontend Logic | Vanilla JavaScript |
| Backend | Node.js |
| Backend Framework | Express.js |
| Database | mySQL |
| Database Driver | mysql2 |
| Authentication | Session / JWT |
| API | REST API |
| Payment Gateway | Midtrans (rencana) |
| Web Server | Nginx |
| Operating System | Ubuntu Server 24.04 |
| Version Control | Git + GitHub |
| Deployment | VPS |

### 2.1 Arsitektur Aplikasi

Aplikasi menggunakan arsitektur frontend dan backend terpisah.

**Frontend**
- Menampilkan halaman website.
- Mengelola interaksi pengguna.
- Mengirim permintaan melalui REST API.
- Menampilkan informasi produk dan transaksi.

**Backend**
- Mengelola autentikasi.
- Mengelola data produk.
- Memproses pesanan.
- Mengintegrasikan pembayaran.
- Memverifikasi notifikasi pembayaran.
- Mengatur akses download produk.

**Database**
- Menyimpan data administrator.
- Menyimpan data pelanggan.
- Menyimpan produk dan kategori.
- Menyimpan pesanan dan pembayaran.
- Menyimpan riwayat download.

**File Storage**
- Menyimpan foto produk.
- Menyimpan file preset.
- Menyimpan file digital lainnya.
- Menyediakan akses download yang terkontrol.

---

# 3. Branding & UI/UX Design

## 3.1 Brand Identity

Nama brand: **Evarti Store**

Jenis bisnis: Digital Product Store.

Karakter brand:
- Elegant.
- Minimalist.
- Modern.
- Aesthetic.
- Professional.
- Creative.

## 3.2 Design Direction

Desain website mengambil inspirasi dari Selina Presets.

Karakteristik desain:
- Layout bersih dan minimalis.
- Foto produk menjadi fokus utama.
- Penggunaan whitespace yang cukup.
- Tipografi elegan.
- Navigasi sederhana.
- Animasi dan transisi yang halus.
- Tampilan responsif.

## 3.3 Color Palette

Palet warna awal yang direkomendasikan:

| Warna | Kode | Penggunaan |
|---|---|---|
| Cream | #F5F1EA | Background |
| Warm White | #FFFFFF | Card dan section |
| Beige | #D8C8B6 | Accent |
| Brown | #766354 | Secondary |
| Dark | #292521 | Teks utama |
| Soft Gray | #EAE7E2 | Border |

Palet warna dapat disesuaikan saat proses desain UI/UX.

## 3.4 Typography

Rekomendasi:
- Heading: Cormorant Garamond atau Playfair Display.
- Body: Inter atau DM Sans.

## 3.5 Responsive Design

Website harus mendukung:

- Desktop: 1440px dan lebih besar.
- Laptop: 1024px–1439px.
- Tablet: 768px–1023px.
- Smartphone: 320px–767px.

Semua halaman harus tetap nyaman digunakan pada berbagai ukuran layar.

---

# 4. Website Structure

## 4.1 Public Website

Halaman yang dapat diakses oleh pengunjung.

| Halaman | URL | Fungsi |
|---|---|---|
| Homepage | / | Halaman utama |
| Products | /products | Katalog produk |
| Product Detail | /products/:slug | Detail produk |
| Cart | /cart | Keranjang belanja |
| Checkout | /checkout | Proses pemesanan |
| Payment Status | /payment/:orderNumber | Status pembayaran |
| Order Lookup | /order | Pencarian pesanan |
| Downloads | /downloads/:token | Akses produk digital |
| Tutorials | /tutorials | Panduan penggunaan |
| About | /about | Informasi brand |
| Contact | /contact | Kontak dan bantuan |
| FAQ | /faq | Pertanyaan umum |

## 4.2 Administrator Website

Halaman administrator menggunakan sistem autentikasi.

| Halaman | URL | Fungsi |
|---|---|---|
| Login | /admin/login | Login administrator |
| Dashboard | /admin | Ringkasan bisnis |
| Products | /admin/products | Manajemen produk |
| Categories | /admin/categories | Manajemen kategori |
| Orders | /admin/orders | Manajemen pesanan |
| Transactions | /admin/transactions | Manajemen pembayaran |
| Customers | /admin/customers | Manajemen pelanggan |
| Reviews | /admin/reviews | Manajemen ulasan |
| Coupons | /admin/coupons | Manajemen promo |
| Tutorials | /admin/tutorials | Manajemen tutorial |
| Settings | /admin/settings | Pengaturan toko |

---

# 5. Functional Requirements

## 5.1 Homepage

Homepage merupakan halaman pertama yang dilihat pengunjung.

Komponen:

1. Announcement bar.
2. Navigation bar.
3. Hero section.
4. Featured products.
5. Best sellers.
6. Product categories.
7. Brand introduction.
8. Before & After showcase.
9. Customer testimonials.
10. FAQ preview.
11. Newsletter subscription (opsional).
12. Footer.

Fitur:
- Navigasi menuju katalog.
- Tombol Shop Now.
- Tampilan produk unggulan.
- Navigasi ke halaman detail produk.
- Informasi promo.

## 5.2 Product Catalog

Menampilkan seluruh produk digital yang tersedia.

Fitur:
- Grid produk.
- Pencarian produk.
- Filter kategori.
- Pengurutan harga.
- Pengurutan produk terbaru.
- Filter produk terlaris.
- Label diskon.
- Label Best Seller.
- Pagination.

Informasi setiap produk:
- Foto produk.
- Nama produk.
- Harga normal.
- Harga diskon.
- Kategori.
- Rating (jika tersedia).
- Status ketersediaan.

## 5.3 Product Detail

Halaman detail memberikan informasi lengkap mengenai produk.

Informasi:
- Nama produk.
- Galeri foto.
- Deskripsi.
- Harga.
- Harga diskon.
- Preview hasil editing.
- Foto Before & After.
- Isi paket.
- Kompatibilitas perangkat.
- Format file.
- Petunjuk penggunaan.
- Informasi lisensi.
- Ulasan pelanggan.

Fitur:
- Add to Cart.
- Buy Now.
- Quantity selector jika produk mendukung pembelian beberapa lisensi.
- Produk terkait.

## 5.4 Shopping Cart

Keranjang belanja menyimpan produk yang akan dibeli.

Fitur:
- Menambahkan produk.
- Menghapus produk.
- Mengubah jumlah.
- Menghitung subtotal.
- Menggunakan kode promo.
- Menghitung total pembayaran.
- Melanjutkan ke checkout.

Data keranjang disimpan menggunakan mekanisme penyimpanan yang sesuai, dengan validasi ulang harga dan ketersediaan oleh backend.

## 5.5 Checkout

Checkout digunakan untuk menyelesaikan pemesanan.

Data yang diperlukan:
- Nama pelanggan.
- Email aktif.
- Nomor WhatsApp (opsional).
- Produk yang dibeli.
- Kode promo (opsional).
- Metode pembayaran.

Ketentuan:
- Pelanggan tidak diwajibkan membuat akun untuk melakukan pembelian.
- Email wajib valid karena digunakan untuk informasi transaksi dan akses produk.
- Harga dan total pembayaran harus dihitung ulang oleh backend.
- Setiap checkout menghasilkan nomor pesanan unik.

## 5.6 Payment Gateway

Sistem pembayaran direncanakan menggunakan Midtrans.

Metode pembayaran mengikuti dukungan akun merchant dan konfigurasi payment gateway.

Alur:
1. Backend membuat pesanan.
2. Backend meminta token atau instruksi pembayaran dari payment gateway.
3. Pelanggan menyelesaikan pembayaran.
4. Payment gateway mengirim webhook ke backend.
5. Backend memverifikasi notifikasi pembayaran.
6. Status pembayaran diperbarui.
7. Sistem memberikan akses download jika pembayaran sudah berhasil.

Ketentuan keamanan:
- Tidak mempercayai status pembayaran dari frontend.
- Verifikasi signature notifikasi.
- Memastikan nominal pembayaran sesuai pesanan.
- Mencegah pemrosesan notifikasi ganda.
- Menyimpan riwayat perubahan status transaksi.

## 5.7 Digital Product Delivery

Fitur utama Evarti Store adalah pengiriman produk digital secara otomatis.

Setelah pembayaran berhasil diverifikasi:

1. Sistem membuat token download.
2. Token dikaitkan dengan pesanan dan produk.
3. Pelanggan mendapatkan informasi akses download.
4. Link download dapat diakses melalui halaman pesanan.
5. Pelanggan dapat mengunduh file sesuai ketentuan.

Jenis file yang didukung:
- ZIP.
- DNG.
- XMP.
- PDF.
- File digital lainnya.

Ketentuan:
- File produk tidak boleh dapat diakses langsung melalui URL publik.
- Token download harus unik dan sulit ditebak.
- Token memiliki masa berlaku.
- Jumlah download dapat dibatasi.
- Sistem mencatat waktu dan jumlah download.
- Akses download harus memeriksa status pembayaran.

## 5.8 Customer Order Access

Pelanggan dapat melihat informasi pembelian tanpa harus membuat akun.

Sistem menyediakan pencarian pesanan menggunakan:
- Nomor pesanan.
- Email pelanggan.
- Verifikasi melalui token atau mekanisme keamanan tambahan.

Informasi yang ditampilkan:
- Nomor pesanan.
- Tanggal transaksi.
- Produk yang dibeli.
- Total pembayaran.
- Status pembayaran.
- Status download.

## 5.9 Customer Reviews

Pelanggan dapat memberikan ulasan terhadap produk yang dibeli.

Fitur:
- Rating 1–5.
- Komentar.
- Tanggal ulasan.
- Moderasi administrator.

Hanya pelanggan dengan transaksi yang sudah lunas yang dapat memberikan ulasan terverifikasi.

## 5.10 Tutorial & FAQ

Menyediakan panduan penggunaan produk digital.

Contoh kategori:
- Cara menggunakan Lightroom Presets.
- Cara mengimpor file XMP.
- Cara menggunakan file DNG.
- Panduan instalasi pada smartphone.
- Panduan instalasi pada desktop.

Administrator dapat menambahkan, mengedit, dan menghapus artikel tutorial.

---

# 6. Administrator Dashboard

## 6.1 Authentication

Administrator harus login sebelum mengakses dashboard.

Fitur:
- Login.
- Logout.
- Password hashing.
- Session management.
- Proteksi halaman admin.
- Pembatasan percobaan login.
- Pengelolaan sesi aktif.

## 6.2 Dashboard Overview

Dashboard menampilkan:

- Total penjualan.
- Total pesanan.
- Total pelanggan.
- Pesanan menunggu pembayaran.
- Pesanan berhasil.
- Pendapatan hari ini.
- Pendapatan bulanan.
- Produk terlaris.
- Grafik penjualan.

Semua statistik harus berasal dari database.

## 6.3 Product Management

Administrator dapat:
- Menambahkan produk.
- Mengedit produk.
- Menghapus atau mengarsipkan produk.
- Mengunggah foto.
- Mengunggah file digital.
- Mengatur harga.
- Mengatur harga diskon.
- Mengatur kategori.
- Mengatur status publikasi.
- Mengatur produk unggulan.
- Mengatur produk terlaris.
- Mengelola varian produk.

Status produk:
- Draft.
- Published.
- Archived.

## 6.4 Category Management

Fitur:
- Tambah kategori.
- Edit kategori.
- Hapus kategori.
- Mengatur slug.
- Mengatur gambar kategori.
- Mengatur urutan kategori.

## 6.5 Order Management

Administrator dapat melihat:
- Nomor pesanan.
- Nama pelanggan.
- Email.
- Produk.
- Total pembayaran.
- Tanggal pesanan.
- Status pesanan.
- Status pembayaran.

Filter:
- Pending.
- Paid.
- Expired.
- Cancelled.
- Failed.
- Refunded.

## 6.6 Transaction Management

Administrator dapat:
- Melihat transaksi.
- Melihat metode pembayaran.
- Melihat nominal pembayaran.
- Melihat waktu pembayaran.
- Melihat referensi transaksi gateway.
- Melihat riwayat status pembayaran.

Perubahan status pembayaran tidak boleh dilakukan sembarangan. Status paid harus berasal dari verifikasi pembayaran yang sah atau prosedur manual khusus yang tercatat dalam audit log.

## 6.7 Customer Management

Administrator dapat:
- Melihat data pelanggan.
- Melihat riwayat pesanan.
- Melihat email.
- Melihat total transaksi.
- Mencari pelanggan.

## 6.8 Coupon Management

Administrator dapat membuat kode promo dengan ketentuan:
- Kode kupon.
- Jenis diskon persentase atau nominal.
- Nilai diskon.
- Minimum pembelian.
- Maksimum potongan.
- Batas penggunaan.
- Masa berlaku.
- Status aktif/nonaktif.

## 6.9 Store Settings

Pengaturan:
- Nama toko.
- Logo.
- Favicon.
- Deskripsi toko.
- Email.
- WhatsApp.
- Social media.
- Informasi footer.
- Kebijakan privasi.
- Syarat dan ketentuan.

---

# 7. Database Design

Database utama menggunakan MariaDB.

Tabel yang direncanakan:

| Tabel | Fungsi |
|---|---|
| admins | Data administrator |
| customers | Data pelanggan |
| categories | Kategori produk |
| products | Data produk |
| product_images | Galeri produk |
| product_variants | Varian produk |
| product_files | File digital |
| carts | Keranjang belanja |
| cart_items | Detail keranjang |
| orders | Data pesanan |
| order_items | Detail pesanan |
| payments | Data pembayaran |
| payment_logs | Riwayat notifikasi pembayaran |
| download_tokens | Token download |
| download_logs | Riwayat download |
| reviews | Ulasan produk |
| coupons | Data kupon |
| coupon_usages | Penggunaan kupon |
| tutorials | Artikel tutorial |
| settings | Pengaturan website |
| admin_logs | Audit aktivitas admin |

### 7.1 Database Rules

- Menggunakan primary key pada setiap tabel.
- Menggunakan foreign key untuk relasi.
- Menggunakan indeks pada kolom pencarian.
- Menyimpan nominal uang dalam tipe integer atau DECIMAL yang sesuai.
- Menggunakan transaksi database untuk proses penting.
- Menggunakan timestamps untuk pencatatan.
- Menyimpan snapshot nama produk dan harga pada order_items agar riwayat transaksi tidak berubah ketika data produk diperbarui.
- Menyimpan password dalam bentuk hash, bukan plaintext.

---

# 8. API Design

Backend menyediakan REST API.

## 8.1 Public API

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | /api/products | Daftar produk |
| GET | /api/products/:slug | Detail produk |
| GET | /api/categories | Daftar kategori |
| POST | /api/orders | Membuat pesanan |
| GET | /api/orders/:number | Informasi pesanan |
| POST | /api/payments/create | Membuat pembayaran |
| POST | /api/payments/webhook | Menerima notifikasi pembayaran |
| GET | /api/downloads/:token | Mengakses download |
| POST | /api/reviews | Membuat ulasan |

## 8.2 Admin API

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | /api/admin/login | Login |
| POST | /api/admin/logout | Logout |
| GET | /api/admin/dashboard | Statistik |
| GET | /api/admin/products | Daftar produk |
| POST | /api/admin/products | Tambah produk |
| PUT | /api/admin/products/:id | Edit produk |
| DELETE | /api/admin/products/:id | Hapus produk |
| GET | /api/admin/orders | Daftar pesanan |
| GET | /api/admin/payments | Daftar pembayaran |
| GET | /api/admin/customers | Daftar pelanggan |
| GET | /api/admin/reviews | Daftar ulasan |
| GET | /api/admin/coupons | Daftar kupon |
| PUT | /api/admin/settings | Pengaturan toko |

Seluruh endpoint admin harus dilindungi autentikasi dan otorisasi.

---

# 9. Security Requirements

Keamanan menjadi salah satu prioritas pengembangan.

Ketentuan:

1. Password harus di-hash menggunakan algoritma yang aman seperti Argon2id atau bcrypt.
2. Menggunakan HTTPS.
3. Menggunakan prepared statements atau query parameterized.
4. Melakukan validasi input pada backend.
5. Menerapkan proteksi XSS.
6. Menerapkan proteksi CSRF jika menggunakan cookie-based session.
7. Menerapkan rate limiting.
8. Melakukan validasi tipe dan ukuran file upload.
9. Menyimpan file digital di luar public web root.
10. Menggunakan token download yang aman.
11. Memverifikasi webhook pembayaran.
12. Menggunakan environment variables untuk konfigurasi rahasia.
13. Membatasi akses endpoint administrator.
14. Melakukan backup database secara berkala.
15. Menyediakan audit log aktivitas administrator.

---

# 10. Business Rules

## 10.1 Product Rules

- Produk harus memiliki nama dan deskripsi.
- Produk harus memiliki harga.
- Produk digital harus memiliki file yang dapat diunduh sebelum dipublikasikan.
- Produk draft tidak tampil di katalog publik.
- Produk archived tidak dapat dibeli.
- Produk yang sudah masuk pesanan harus tetap tercatat dalam riwayat transaksi.

## 10.2 Order Rules

- Setiap pesanan memiliki nomor unik.
- Satu pesanan dapat memiliki beberapa produk.
- Harga pesanan disimpan sebagai snapshot.
- Total pembayaran dihitung backend.
- Pesanan tidak otomatis dianggap lunas hanya karena pelanggan kembali ke halaman sukses.

## 10.3 Payment Rules

Status pembayaran:
- Pending.
- Paid.
- Expired.
- Failed.
- Refunded.

Aturan:
- Status paid hanya setelah pembayaran diverifikasi.
- Webhook harus idempotent.
- Nominal pembayaran harus sesuai.
- Pesanan expired tidak dapat diunduh.
- Refund harus tercatat.

## 10.4 Download Rules

- Download hanya tersedia setelah pembayaran berhasil.
- Link download menggunakan token khusus.
- Token tidak boleh dapat ditebak.
- Jumlah download dapat dibatasi.
- Token dapat dinonaktifkan.
- Semua aktivitas download dicatat.

---

# 11. Non-Functional Requirements

## 11.1 Performance

- Homepage harus dimuat secara optimal.
- Gambar menggunakan format WebP atau format modern lainnya.
- Menggunakan lazy loading.
- Mengoptimalkan query database.
- Menggunakan pagination pada katalog dan dashboard.
- Meminimalkan penggunaan JavaScript yang tidak diperlukan.

## 11.2 Reliability

- Sistem harus menangani kegagalan payment gateway.
- Sistem harus mencegah transaksi ganda.
- Data transaksi harus konsisten.
- Sistem harus menyediakan mekanisme backup dan recovery.

## 11.3 Maintainability

- Frontend dan backend dipisahkan.
- Struktur kode modular.
- Penamaan file konsisten.
- Dokumentasi API tersedia.
- Konfigurasi menggunakan environment variables.
- Kode dikelola menggunakan Git.

## 11.4 Compatibility

Website mendukung browser modern:
- Google Chrome.
- Mozilla Firefox.
- Microsoft Edge.
- Safari.

---

# 12. Project Milestones

Pengembangan dibagi menjadi beberapa tahap.

| Tahap | Pekerjaan | Hasil |
|---|---|---|
| 1 | Perencanaan dan PRD | Dokumen kebutuhan |
| 2 | UI/UX Design | Desain halaman |
| 3 | Project Setup | Struktur frontend/backend |
| 4 | Database | Schema dan relasi |
| 5 | Public Website | Homepage dan katalog |
| 6 | Product Management | CRUD produk |
| 7 | Shopping System | Cart dan checkout |
| 8 | Payment Gateway | Integrasi pembayaran |
| 9 | Digital Delivery | Sistem download |
| 10 | Admin Dashboard | Manajemen toko |
| 11 | Testing | Pengujian sistem |
| 12 | Deployment | Website production |

---

# 13. Testing & Acceptance Criteria

Website dapat dinyatakan siap diluncurkan apabila:

### Frontend
- [ ] Semua halaman dapat diakses.
- [ ] Navigasi berfungsi.
- [ ] Katalog menampilkan data database.
- [ ] Detail produk tampil dengan benar.
- [ ] Cart berfungsi.
- [ ] Checkout responsif.
- [ ] Tampilan mobile tidak mengalami layout overflow.

### Backend
- [ ] API berfungsi.
- [ ] Database terhubung.
- [ ] Autentikasi administrator berfungsi.
- [ ] Validasi input berjalan.
- [ ] Pengelolaan produk berfungsi.
- [ ] Pengelolaan pesanan berfungsi.

### Payment
- [ ] Pesanan dapat dibuat.
- [ ] Pembayaran dapat diproses.
- [ ] Webhook dapat diverifikasi.
- [ ] Status pembayaran diperbarui.
- [ ] Pembayaran ganda tidak menghasilkan pemrosesan ganda.

### Digital Delivery
- [ ] File tidak dapat diakses secara publik.
- [ ] Download hanya tersedia untuk transaksi lunas.
- [ ] Token download berfungsi.
- [ ] Batas download berjalan.
- [ ] Riwayat download tersimpan.

### Security
- [ ] Halaman admin terlindungi.
- [ ] Password tersimpan dalam bentuk hash.
- [ ] API admin terlindungi.
- [ ] HTTPS aktif.
- [ ] Backup database tersedia.

---

# 14. Future Development

Fitur berikut dapat ditambahkan setelah versi awal berjalan stabil:

- Customer account dan dashboard pribadi.
- Wishlist.
- Affiliate system.
- Loyalty points.
- Paket bundling preset.
- Gift voucher.
- Multi-language.
- Multi-currency.
- Analytics penjualan lanjutan.
- Integrasi email marketing.
- Otomatisasi promosi.
- Produk digital selain Lightroom Presets.

---

# 15. Project Scope & Priorities

## MVP (Minimum Viable Product)

Fitur yang wajib tersedia pada peluncuran pertama:

1. Homepage.
2. Katalog produk.
3. Detail produk.
4. Shopping cart.
5. Checkout.
6. Integrasi pembayaran.
7. Verifikasi pembayaran.
8. Download otomatis.
9. Admin login.
10. Dashboard administrator.
11. CRUD produk dan kategori.
12. Manajemen pesanan.
13. Pengaturan toko.

## Post-MVP

Fitur yang dapat dikembangkan setelah MVP:
- Reviews.
- Coupons.
- Tutorials management.
- Newsletter.
- Customer accounts.
- Advanced analytics.
- Affiliate program.

---

# 16. Assumptions & Open Decisions

Beberapa keputusan masih perlu ditetapkan sebelum implementasi:

| Hal | Status |
|---|---|
| Nama brand | Evarti Store |
| Jenis toko | Digital product store |
| Produk utama | Lightroom Presets |
| Referensi desain | Selina Presets |
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js + Express.js |
| Database | MariaDB |
| Hosting | Ubuntu VPS |
| Payment gateway | Midtrans (rencana) |
| Domain | Belum ditentukan |
| Logo final | Belum ditentukan |
| Harga produk | Belum ditentukan |
| Batas download | Perlu ditentukan |
| Masa berlaku token | Perlu ditentukan |
| Kebijakan refund | Perlu ditentukan |
| Lisensi produk | Perlu ditentukan |

Keputusan yang belum ditentukan akan dikonfirmasi sebelum fitur terkait dikembangkan.

---

# 17. Final Project Vision

Evarti Store diharapkan menjadi platform penjualan produk digital yang memiliki tampilan profesional, pengalaman belanja yang nyaman, sistem pembayaran yang aman, dan pengiriman produk digital secara otomatis.

Pengembangan dilakukan secara modular agar setiap fitur dapat dikembangkan, diuji, dan dipelihara tanpa mengganggu bagian sistem lainnya.

**Project Name:** Evarti Store  
**Document:** Product Requirements Document  
**Version:** 1.0.0  
**Status:** Initial Planning