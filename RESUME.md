# Resume Perubahan Evarti Store

Tanggal pembaruan: 6 November 2026

## Yang sudah diperbarui

- **Keranjang belanja:** tampilan desktop memakai tabel produk, harga, jumlah, dan subtotal, dengan ringkasan total di sisi kanan. Pada ponsel, baris berubah menjadi tampilan ringkas yang tidak menimbulkan scroll horizontal.
- **Batas kuantitas:** setiap produk hanya dapat dibeli satu kali dalam satu pesanan. Kontrol `+`/`−` dihapus; penambahan produk yang sama tidak menggandakan jumlah; data keranjang lama yang berisi duplikat dinormalisasi menjadi satu item.
- **Pilihan pembelian:** halaman detail produk menyediakan **BUY NOW** untuk langsung membuka checkout dengan produk tersebut, dan **ADD TO CART** untuk menambahkan produk sambil tetap berada di halaman.
- **Kupon:** tersedia kolom coupon code dan tombol **APPLY COUPON**. Kode `TANADA` memberi diskon 10%. Backend menghitungnya dari harga produk `published` di database, mengabaikan harga kiriman browser, menolak kode tidak valid, dan menolak jumlah atau produk duplikat.
- **Pembaruan cache:** URL CSS dan JavaScript diberi versi agar browser memuat perubahan terbaru.
- **Dokumentasi:** PRD dan README diperbarui untuk mencatat batas satu produk, pilihan beli langsung/keranjang, kupon `TANADA`, dan endpoint validasi kupon.

## Implementasi utama

- `frontend/js/storefront.js` — alur beli, keranjang, batas kuantitas, dan penerapan diskon.
- `frontend/css/style.css` — layout tabel keranjang desktop dan tampilan responsif.
- `backend/src/controllers/voucherController.js` — validasi kupon dan kalkulasi diskon memakai harga database.
- `backend/src/routes/voucherRoutes.js` dan `backend/src/app.js` — endpoint `POST /api/vouchers/validate`.
- `tests/e2e/storefront.spec.js` — pengujian kuantitas, kupon, checkout demo, dan tampilan responsif.
- `docs/PRD-pembelian.md` dan `README.md` — dokumentasi kebutuhan dan endpoint.

## Verifikasi terakhir

- `npm run test:e2e -- --quiet --reporter=dot`: **30 tes lulus**.
- `git diff --check`: bersih.
- Uji endpoint langsung: `TANADA` menghasilkan diskon 10% dari harga database; kode tidak dikenal ditolak; kuantitas di atas satu ditolak dengan HTTP 400.
- Backend dan frontend lokal saat ini **sudah dihentikan**. Port 3000 dan 5500 tidak merespons.

## Batasan saat ini

Checkout masih berupa simulasi. Pesanan belum disimpan ke database, pembayaran belum terhubung ke payment gateway, dan belum ada proses webhook, token unduhan, email konfirmasi, atau halaman admin pesanan. Kupon dihitung dan ditampilkan pada simulasi checkout, tetapi belum diterapkan ke transaksi nyata karena endpoint pembuatan order belum tersedia.

Skrip `npm test --prefix backend` juga masih placeholder; pengujian yang tersedia saat ini adalah Playwright di root proyek.
