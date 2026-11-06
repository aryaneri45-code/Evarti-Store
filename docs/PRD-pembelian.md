# PRD --- Evarti Store

## Alur Pembelian Produk Digital (Lightroom Presets)

**Versi:** 1.0\
**Tanggal:** 6 November 2026\
**Status:** Draft implementasi\
**Referensi:** Video "Revisi Cara Pembelian.mp4".

## 1. Ringkasan

Evarti Store adalah toko online produk digital yang berfokus pada
Lightroom Presets. Dokumen ini menjelaskan pengalaman pembelian dari
pengunjung membuka toko, memilih preset, checkout, membayar, hingga
menerima akses unduhan.

Alur yang diadaptasi dari video: pengunjung membuka tautan toko,
menjelajahi katalog, membuka produk, melanjutkan ke checkout, mengisi
data pembeli, memasukkan voucher bila tersedia, memeriksa ringkasan,
menyelesaikan pembayaran, lalu menerima konfirmasi dan akses produk
digital.

Payment gateway, metode pembayaran, aturan voucher, serta mekanisme
pengiriman file harus dikonfigurasi. Integrasi tertentu tidak dianggap
tersedia sebelum akun merchant dan API dikonfirmasi.

## 2. Tujuan

1.  Proses pembelian mudah dan nyaman di ponsel maupun desktop.
2.  Meminimalkan langkah dari katalog ke pembayaran.
3.  Mengumpulkan data pembeli yang diperlukan untuk konfirmasi pesanan.
4.  Memastikan file hanya dapat diunduh pembeli yang berhak.
5.  Menampilkan subtotal, diskon, biaya, dan total secara transparan.
6.  Menyediakan status transaksi yang jelas bagi pembeli dan admin.

## 3. Ruang Lingkup MVP

**Termasuk:** katalog, detail produk, beli langsung/keranjang sederhana,
guest checkout, form pembeli, voucher opsional, ringkasan pesanan,
pembuatan order, pembayaran, status pending/sukses/gagal/kedaluwarsa,
konfirmasi email, token unduhan, dan pengelolaan pesanan admin.

**Tidak termasuk:** langganan berulang, afiliasi, loyalty point,
aplikasi mobile native, dan refund otomatis penuh.

## 4. Pengguna

-   **Pembeli:** mengakses toko dari desktop atau ponsel, memilih
    preset, membayar, dan mengunduh file.
-   **Admin/Owner:** mengelola produk, kategori, harga, file, voucher,
    pesanan, dan status pembayaran.

## 5. Alur Pembelian

``` mermaid
flowchart TD
 A[Pengunjung membuka Evarti Store] --> B[Jelajahi katalog]
 B --> C[Pilih produk]
 C --> D[Detail produk]
 D --> E{Beli sekarang?}
 E -- Tidak --> B
 E -- Ya --> F[Checkout]
 F --> G[Isi nama dan email]
 G --> H[Masukkan voucher opsional]
 H --> I[Backend validasi dan hitung total]
 I --> J[Konfirmasi ringkasan]
 J --> K[Buat pesanan]
 K --> L[Pilih metode pembayaran]
 L --> M[Menunggu pembayaran]
 M --> N{Pembayaran terverifikasi?}
 N -- Belum --> M
 N -- Ya --> O[Pesanan lunas]
 O --> P[Buat token unduhan]
 P --> Q[Halaman sukses dan konfirmasi]
 Q --> R[Unduh preset]
```

### 5.1 Katalog

Homepage menampilkan identitas toko, kategori, produk unggulan, promosi,
dan tombol menuju katalog. Kartu produk menampilkan gambar, nama, harga,
harga pembanding bila ada, dan label produk. Hanya produk berstatus
`published` yang dapat dibeli.

### 5.2 Detail produk

Menampilkan galeri preview, nama, kategori, deskripsi, manfaat,
kompatibilitas Lightroom (jika telah dikonfirmasi), format/isi paket,
harga, serta tombol **Beli Sekarang** dan **Tambahkan ke Keranjang**.
**Beli Sekarang** langsung membuka checkout untuk produk tersebut.
Sertakan keterangan bahwa produk digital tidak dikirim secara fisik.

### 5.3 Checkout

Checkout dibuat satu halaman dan mobile-first.

  -----------------------------------------------------------------------
  Field                               Aturan
  ----------------------------------- -----------------------------------
  Nama pembeli                        Wajib

  Email                               Wajib, format harus valid; untuk
                                      konfirmasi dan akses pesanan

  Nomor WhatsApp                      Opsional atau wajib sesuai
                                      keputusan bisnis

  Kode voucher                        Opsional

  Persetujuan ketentuan               Wajib
  -----------------------------------------------------------------------

Alamat pengiriman tidak diperlukan karena produk digital.

Ringkasan checkout menampilkan produk, harga satuan, kuantitas,
subtotal, diskon, biaya pembayaran jika ada, dan total akhir. Harga dan
diskon harus dihitung ulang oleh backend; nilai dari browser tidak boleh
dipercaya.

### 5.4 Voucher

Kolom voucher opsional dan dapat dinonaktifkan. Tombol **Terapkan**
meminta backend memvalidasi kode. Tampilkan pesan untuk kode valid,
tidak valid, kedaluwarsa, belum aktif, kuota habis, atau tidak memenuhi
minimum transaksi. Backend memvalidasi ulang ketika order dibuat.
Kode promosi awal `TANADA` memberi diskon 10% dari subtotal produk.

### 5.5 Pembuatan pesanan dan pembayaran

1.  Backend memastikan produk masih aktif dan `published`.
2.  Backend mengambil harga dari database dan menghitung total.
3.  Backend membuat `orders` dan `order_items` dengan snapshot nama
    serta harga.
4.  Status awal pesanan adalah menunggu pembayaran.
5.  Backend membuat transaksi ke payment gateway yang dipilih.
6.  Pembeli melihat instruksi/QR/kode pembayaran sesuai respons
    provider.
7.  Tampilkan nomor order, nominal, metode, instruksi, dan batas waktu
    bila disediakan provider.
8.  Status menjadi lunas hanya setelah callback/webhook diverifikasi
    oleh backend.
9.  Webhook harus memeriksa signature, kecocokan order dan nominal,
    serta idempotent.

**Penting:** QRIS statis tidak otomatis memberikan verifikasi pembayaran
otomatis. Jika sementara memakai QRIS statis, konfirmasi harus dilakukan
secara manual oleh admin dan unduhan tidak dibuka sebelum diverifikasi.

### 5.6 Hasil pembayaran

**Berhasil:** tampilkan status berhasil, nomor pesanan, tanggal, email,
produk, total, dan tombol **Unduh Produk**. Kirim email konfirmasi bila
email diaktifkan.

**Menunggu:** tampilkan status dan instruksi pembayaran, serta tombol
untuk memeriksa status terbaru. File belum boleh diunduh.

**Gagal/kedaluwarsa:** tampilkan status dan cara mencoba kembali jika
provider mendukungnya. Pesanan kedaluwarsa tidak dianggap lunas.

### 5.7 Unduhan

Setiap item order lunas memperoleh token acak yang sulit ditebak. Simpan
hash token, bukan token mentah. Token memiliki masa berlaku dan batas
jumlah unduhan. Endpoint memeriksa token, status pembayaran, masa
berlaku, kuota, dan file. File disimpan di lokasi privat, bukan folder
publik yang URL-nya mudah ditebak. Catat waktu dan jumlah unduhan.

## 6. Halaman UI

1.  Homepage.
2.  Katalog dan filter kategori.
3.  Detail produk.
4.  Checkout.
5.  Instruksi pembayaran.
6.  Pembayaran berhasil.
7.  Pembayaran gagal/kedaluwarsa.
8.  Detail pesanan dan unduhan.
9.  Admin daftar/detail pesanan.

### Prinsip desain

-   Identitas visual pink Evarti Store konsisten.
-   Gaya bersih, elegan, editorial, berorientasi fotografi.
-   Mobile-first dan checkout nyaman di layar kecil.
-   CTA utama jelas.
-   Validasi form dekat dengan field terkait.
-   Status tidak dibedakan hanya dengan warna.
-   Sediakan loading, empty, success, dan error state.

## 7. Kebutuhan Fungsional

  -----------------------------------------------------------------------
  ID                      Kebutuhan               Prioritas
  ----------------------- ----------------------- -----------------------
  FR-01                   Menampilkan produk      Must
                          published               

  FR-02                   Membuka detail produk   Must

  FR-03                   Memulai checkout dari   Must
                          detail produk           

  FR-04                   Memvalidasi nama dan    Must
                          email                   

  FR-05                   Menghitung total di     Must
                          backend                 

  FR-06                   Membuat nomor pesanan   Must
                          unik                    

  FR-07                   Menyimpan snapshot      Must
                          harga dan item          

  FR-08                   Menyediakan pembayaran  Must
                          atau prosedur           
                          verifikasi manual       

  FR-09                   Memverifikasi           Must
                          pembayaran sebelum      
                          unduhan                 

  FR-10                   Membuat token unduhan   Must
                          untuk order lunas       

  FR-11                   Menampilkan status      Must
                          transaksi               

  FR-12                   Admin dapat mengelola   Must
                          pesanan                 

  FR-13                   Voucher jika fitur      Should
                          diaktifkan              

  FR-14                   Email konfirmasi        Should

  FR-15                   Unduh ulang selama      Should
                          token valid             

  FR-16                   Pencarian/filter        Could
                          katalog                 
  -----------------------------------------------------------------------

## 8. Nonfungsional dan Keamanan

-   Validasi input di frontend dan backend.
-   Gunakan prepared statements.
-   Simpan secret gateway di environment variables.
-   Verifikasi signature webhook dan terapkan idempotency.
-   Rate limit checkout, validasi voucher, dan unduhan.
-   Jangan tampilkan stack trace atau secret kepada pembeli.
-   Sanitasi konten produk sebelum dirender; jangan memasukkan deskripsi
    admin ke `innerHTML` tanpa sanitasi.
-   Gunakan HTTPS pada produksi.
-   Batasi akses admin dengan autentikasi dan otorisasi.
-   Catat perubahan status pembayaran dan pesanan.
-   Jelaskan penggunaan email dan nomor WhatsApp pada kebijakan privasi.

## 9. Pemetaan Database Saat Ini

  Tabel               Fungsi
  ------------------- -----------------------------------------
  `categories`        Kategori katalog
  `products`          Produk, harga, status
  `product_images`    Preview produk
  `product_files`     File preset
  `customers`         Akun pelanggan jika digunakan
  `orders`            Header pesanan dan kontak pembeli
  `order_items`       Snapshot nama, harga, kuantitas
  `payments`          Provider, ID transaksi, nominal, status
  `download_tokens`   Hash token, masa berlaku, kuota unduhan
  `admins`            Admin toko

Catatan skema: - Pastikan status order mencakup `pending`, `paid`,
`failed`, `expired`, dan `cancelled` atau padanan yang konsisten. -
Status payment setidaknya membedakan `pending`, `paid`, `failed`, dan
`expired`. - Tambahkan tabel voucher/coupon jika voucher masuk MVP;
tabel ini belum ada di skema awal. - Pertimbangkan `paid_at`,
`expires_at`, referensi transaksi, dan metadata provider. -
`order_items` harus menyimpan snapshot harga/nama agar histori tidak
berubah ketika produk diedit. - Untuk guest checkout,
`orders.customer_email` menjadi kontak utama dan `customer_id` boleh
null. - File digital tidak boleh disimpan di folder frontend publik.

## 10. Rancangan API

Endpoint berikut adalah rancangan dan perlu diselaraskan dengan struktur
route yang sudah ada.

  -------------------------------------------------------------------------------------
  Method                  Endpoint                              Fungsi
  ----------------------- ------------------------------------- -----------------------
  GET                     `/api/products`                       Daftar produk published

  GET                     `/api/products/:slug`                 Detail produk

  POST                    `/api/checkout`                       Validasi data dan
                                                                membuat order

  POST                    `/api/vouchers/validate`              Validasi voucher

  POST                    `/api/payments/:orderNumber/create`   Membuat transaksi
                                                                pembayaran

  GET                     `/api/orders/:orderNumber/status`     Status order dengan
                                                                akses aman

  POST                    `/api/payments/webhook/:provider`     Callback payment
                                                                gateway

  GET                     `/api/download/:token`                Validasi token dan
                                                                kirim file

  GET                     `/api/orders/:orderNumber`            Detail order dengan
                                                                verifikasi akses
  -------------------------------------------------------------------------------------

Detail order tidak boleh dapat diakses hanya dengan menebak nomor
pesanan. Gunakan token akses, autentikasi, atau verifikasi email/OTP.

## 11. Aturan Bisnis

1.  Hanya produk `published` yang dapat dibeli.
2.  Harga final ditentukan backend.
3.  Kuantitas setiap produk tepat 1 per pesanan. Produk yang sama tidak
    dapat ditambahkan lagi, termasuk lewat format berbeda. Produk lain
    tetap boleh dibeli bersama. Backend menolak duplikat `product_id`
    dan tidak mempercayai kuantitas dari browser.
4.  Total = subtotal − diskon + biaya yang benar-benar dikenakan.
5.  Order belum lunas tidak dapat mengunduh file.
6.  Status `paid` hanya berasal dari verifikasi gateway atau tindakan
    admin tercatat untuk pembayaran manual.
7.  Callback duplikat tidak boleh menggandakan transaksi atau token.
8.  File yang diterima harus sesuai produk yang dibeli.
9.  Pembatalan, refund, dan penerbitan ulang token harus tercatat.
10. Total dan ketentuan ditampilkan sebelum konfirmasi.

## 12. Acceptance Criteria

-   [ ] Produk published tampil; draft/archived tidak dapat dibeli.
-   [ ] Tombol Beli Sekarang membawa produk yang tepat ke checkout.
-   [ ] Tombol Tambahkan ke Keranjang menyimpan produk tanpa membuka checkout.
-   [ ] Kuantitas produk selalu 1; produk yang sama tidak dapat dibeli
    berulang dalam satu pesanan, termasuk dengan mengubah payload browser.
-   [ ] Form menolak email tidak valid dan field wajib kosong.
-   [ ] Manipulasi harga dari browser tidak mengubah total order.
-   [ ] Order dan item tersimpan dengan snapshot harga benar.
-   [ ] Voucher invalid tidak mengurangi total.
-   [ ] Instruksi pembayaran menampilkan nomor order dan nominal yang
    benar.
-   [ ] Redirect sukses saja tidak mengubah status menjadi paid.
-   [ ] Webhook terverifikasi memperbarui status secara idempotent.
-   [ ] Pembeli belum lunas ditolak saat mengakses file.
-   [ ] Pembeli lunas dapat mengunduh sesuai batas token.
-   [ ] Token invalid, kedaluwarsa, atau melebihi kuota ditolak.
-   [ ] Email konfirmasi benar jika fitur email diaktifkan.
-   [ ] Checkout dan unduhan berfungsi di ponsel dan desktop.
-   [ ] Admin dapat menelusuri order dan status pembayaran.

## 13. Tahapan Implementasi

**Tahap 1 --- Katalog** - Selesaikan gambar produk individual. -
Hubungkan `product_images` ke API. - Uji katalog dan detail produk.

**Tahap 2 --- Checkout** - Buat halaman checkout responsif. - Validasi
data pembeli. - Buat endpoint order dan order items. - Uji kalkulasi
harga di backend.

**Tahap 3 --- Pembayaran** - Tentukan gateway dan metode pembayaran. -
Implementasikan pembuatan transaksi dan webhook. - Jika memakai QRIS
statis, buat verifikasi manual yang aman.

**Tahap 4 --- Produk digital** - Simpan file di lokasi privat. - Buat
token dan endpoint unduhan. - Buat halaman sukses dan detail order. -
Tambahkan email konfirmasi.

**Tahap 5 --- Pengujian** - Uji pembayaran sukses, pending, gagal,
kedaluwarsa, callback ganda, dan nominal tidak cocok. - Uji token
invalid, kedaluwarsa, dan batas unduhan. - Uji mobile/desktop, input,
serta akses admin.

## 14. Keputusan yang Perlu Dikonfirmasi

1.  Payment gateway yang akan digunakan.
2.  Apakah nomor WhatsApp wajib atau email saja cukup.
3.  Apakah voucher masuk MVP atau tahap berikutnya.
4.  File dikirim lewat email, halaman unduhan, atau keduanya.
5.  Masa berlaku link unduhan dan batas jumlah unduhan.
6.  Guest checkout atau wajib membuat akun.

------------------------------------------------------------------------

**Prinsip utama:** pengalaman pembelian dibuat sesederhana mungkin,
sedangkan validasi harga, status pembayaran, dan hak unduh tetap
dikendalikan backend.
