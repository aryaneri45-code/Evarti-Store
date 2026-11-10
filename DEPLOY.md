# Deploy Evarti Store dengan Caddy atau Nginx

Panduan ini memakai **Ubuntu Server 24.04 LTS**, satu VPS, satu domain, Node.js 24, MySQL, dan `systemd`. Jalankan bagian persiapan bersama, lalu pilih **salah satu**: Caddy atau Nginx. Contoh mengasumsikan VPS baru dan akun SSH non-root dengan akses `sudo`.

Dokumen ini hanya panduan. Konfigurasi dan perintah di bawah belum diterapkan ke server. Checkout proyek masih simulasi; deploy tidak menambahkan pembayaran, penyimpanan pesanan, atau pengiriman file.

## 1. Arsitektur dan nilai yang perlu diganti

```text
Browser → HTTPS :443 → Caddy atau Nginx
                       ├── /          → /srv/evarti-store/frontend
                       └── /api/*     → Express 127.0.0.1:3000
                                         └── MySQL 127.0.0.1:3306
```

| Contoh | Ganti dengan |
| --- | --- |
| `presets.example.com` | Domain atau subdomain toko Anda |
| `admin@example.com` | Email pengelola sertifikat |
| `IP_VPS_ANDA` | Alamat IP publik VPS |
| `deploy` | Nama akun SSH Anda |
| `URL_REPOSITORY_ANDA` | URL Git repository yang dapat diakses server |
| `main` | Branch yang akan di-deploy |
| `GANTI_PASSWORD_DATABASE` | Password database yang unik |

Path `/srv/evarti-store`, user layanan `evarti`, database `evarti_store`, dan port `3000` boleh dipakai seperti contoh. Jika diganti, sesuaikan seluruh konfigurasi terkait.

Frontend adalah HTML/CSS/JavaScript biasa: **tidak membutuhkan build**. Caddy/Nginx langsung menyajikan folder `frontend`; server Python dan `npm run dev` tidak dijalankan di produksi.

## 2. Persiapan kode sebelum deploy

Lakukan perubahan berikut di repository pengembangan, lalu commit dan push ke branch deploy sebelum menyalinnya ke VPS. Ini adalah prasyarat tutorial; membuat `DEPLOY.md` tidak otomatis mengubah kode aplikasi.

### 2.1. Ubah alamat API frontend

Di `frontend/js/storefront.js`, ganti:

```js
const API_URL = "http://localhost:3000/api";
```

menjadi:

```js
const API_URL = "/api";
```

Dengan begitu, browser mengakses `https://presets.example.com/api/products`. Alamat `localhost` pada JavaScript browser menunjuk ke perangkat pengunjung, bukan VPS.

Versi lokal saat ini memakai dua port berbeda. Setelah memakai `/api`, pengembangan lokal juga memerlukan reverse proxy, atau perubahan ini disimpan pada konfigurasi/branch deploy yang dipilih. Tes Playwright dan skrip screenshot saat ini mencegat URL `http://localhost:3000/api`; sesuaikan pola route ke `**/api/products**` dan `**/api/categories**` jika pengujian dijalankan pada kode yang sudah diubah. Server statis pengujian sendiri tidak meneruskan request API.

### 2.2. Batasi backend ke localhost

Di `backend/src/app.js`, setelah `const app = express();`, tambahkan:

```js
app.set("trust proxy", "loopback");
```

Lalu ganti blok `app.listen` menjadi:

```js
app.listen(PORT, "127.0.0.1", () => {
    console.log(`Evarti Store API running on 127.0.0.1:${PORT}`);
});
```

Pengaturan ini ditujukan untuk **satu reverse proxy di mesin yang sama**. Backend hanya menerima koneksi lokal, sedangkan Express mengenali informasi proxy dari loopback. Jika nanti memakai Docker, CDN, atau proxy di mesin terpisah, tinjau alamat upstream dan daftar proxy yang dipercaya. [Dokumentasi Express](https://expressjs.com/en/guide/behind-proxies/)

Middleware `cors()` yang sekarang ada tidak perlu ditambahkan atau diperluas untuk deployment satu domain ini. CORS bukan pengganti pembatasan akses jaringan.

## 3. Siapkan VPS dan DNS

Buat record **A** untuk `presets.example.com` menuju `IP_VPS_ANDA`. Tambahkan **AAAA** hanya jika IPv6 VPS sudah benar-benar berfungsi. Panduan memakai satu hostname; jika menambah `www`, siapkan DNS dan konfigurasi sertifikat untuk hostname tersebut juga.

Masuk ke VPS:

```bash
ssh deploy@IP_VPS_ANDA
```

Pasang paket dasar:

```bash
sudo apt update
sudo apt install -y git curl ca-certificates gnupg mysql-server ufw
sudo systemctl enable --now mysql
```

Buka port web dan pertahankan akses SSH:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose
```

Jika SSH menggunakan port selain `22`, izinkan port SSH aktual **sebelum** mengaktifkan UFW. Terapkan aturan yang sama pada firewall/security group penyedia VPS. Port `3000`, `3306`, dan `5500` tidak perlu dibuka ke publik. Bila VPS sudah memiliki aturan firewall, periksa aturan yang ada terlebih dahulu.

## 4. Pasang Node.js dan salin proyek

Contoh berikut memakai paket Node.js 24 dari repository NodeSource. Jika Node.js yang sesuai sudah terpasang secara sistem, lewati pemasangannya. [Panduan NodeSource](https://github.com/nodesource/distributions/blob/master/DEV_README.md)

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x -o /tmp/evarti-nodesource-setup.sh
sudo bash /tmp/evarti-nodesource-setup.sh
sudo apt install -y nodejs
node --version
npm --version
/usr/bin/node --version
```

Berkas unit `systemd` di panduan ini memakai `/usr/bin/node`. Instalasi melalui NVM di direktori home tidak otomatis tersedia untuk user layanan; jika memakai cara instalasi lain, sesuaikan `ExecStart` dengan lokasi Node yang bisa diakses user `evarti`.

Siapkan direktori dan clone repository sebagai akun SSH Anda:

```bash
sudo install -d -m 755 -o "$USER" -g "$(id -gn)" /srv/evarti-store
git clone --branch main 'URL_REPOSITORY_ANDA' /srv/evarti-store
cd /srv/evarti-store
npm ci --omit=dev --prefix backend
node --check backend/src/app.js
```

Gunakan direktori kosong saat clone pertama. Untuk repository privat, gunakan akses Git/deploy key yang sesuai; jangan menulis token akses ke URL di dokumen atau konfigurasi layanan. Dependensi pada root proyek hanya untuk tes browser dan tidak diperlukan oleh backend produksi.

## 5. Siapkan database dan konfigurasi backend

### 5.1. Impor skema atau database yang sudah ada

Folder `database/` diabaikan Git. Karena itu, `database/schema.sql` **tidak tersedia setelah clone**, meskipun mungkin ada di komputer pengembangan.

Untuk instalasi baru, kirim skema dari komputer pengembangan:

```bash
# Jalankan di komputer pengembangan, dari root proyek.
scp database/schema.sql deploy@IP_VPS_ANDA:/tmp/evarti-schema.sql
```

Jika file tidak ada, dapatkan salinan dari pengelola proyek. Di VPS, impor ke instalasi baru:

```bash
sudo mysql < /tmp/evarti-schema.sql
```

Skema lokal saat ini membuat database `evarti_store` dan tabel-tabelnya. File itu bukan migration yang aman dijalankan berulang pada database terisi. Untuk memindahkan data toko yang sudah ada, gunakan dump dari database sumber sebagai pengganti impor skema baru dan backup database tujuan sebelum restore.

Skema saja tidak mengisi katalog. Produk harus berstatus `published` agar muncul; kategori harus `is_active = TRUE` agar tampil di filter. Jangan memakai data contoh dari tes sebagai pengganti data toko.

### 5.2. Buat user database aplikasi

Buka konsol MySQL di VPS:

```bash
sudo mysql
```

Jalankan SQL ini setelah mengganti password:

```sql
CREATE USER 'evarti_app'@'127.0.0.1'
IDENTIFIED BY 'GANTI_PASSWORD_DATABASE';

GRANT SELECT ON evarti_store.* TO 'evarti_app'@'127.0.0.1';
EXIT;
```

Hak `SELECT` cukup untuk endpoint saat ini: membaca produk/kategori dan menghitung voucher. Jika fitur aplikasi nantinya menulis pesanan atau data lain, tambahkan hak yang dibutuhkan saat fitur itu dibuat. Gunakan akun administrasi terpisah untuk impor dan pengelolaan data.

### 5.3. Buat user layanan dan `.env`

```bash
sudo useradd --system --user-group --home-dir /srv/evarti-store --no-create-home --shell /usr/sbin/nologin evarti
sudo install -m 600 -o evarti -g evarti /dev/null /srv/evarti-store/backend/.env
sudoedit /srv/evarti-store/backend/.env
```

Perintah `install` di atas untuk pembuatan awal; jangan jalankan ulang pada `.env` yang sudah berisi konfigurasi karena isinya akan dikosongkan. Jika user `evarti` sudah dibuat sebelumnya, lewati `useradd`.

Isi `.env`:

```dotenv
NODE_ENV=production
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=evarti_app
DB_PASSWORD=GANTI_PASSWORD_DATABASE
DB_NAME=evarti_store
```

Gunakan password yang sama dengan akun MySQL. Nilai sederhana seperti password acak heksadesimal memudahkan penggunaan file ini oleh dotenv dan `systemd`; hindari menyalin karakter kutip, spasi, atau komentar tanpa memahami parsing keduanya. `.env` tidak boleh masuk Git atau folder publik.

Pastikan user layanan bisa membaca kode, dan web server nantinya bisa membaca aset publik:

```bash
sudo chmod 755 /srv /srv/evarti-store /srv/evarti-store/backend
sudo find /srv/evarti-store/frontend -type d -exec chmod 755 {} +
sudo find /srv/evarti-store/frontend -type f -exec chmod 644 {} +
sudo -u evarti test -r /srv/evarti-store/backend/src/app.js
sudo -u evarti test -r /srv/evarti-store/backend/.env
```

Clone dengan permission standar membuat kode dan dependensi dapat dibaca user layanan. Jika pemeriksaan gagal, cek izin direktori induk dengan `namei -l /srv/evarti-store/backend/src/app.js`; berikan akses baca/traverse yang sesuai tanpa membuka `.env` untuk semua user.

## 6. Jalankan backend dengan systemd

Buat unit layanan:

```bash
sudoedit /etc/systemd/system/evarti-backend.service
```

Isi:

```ini
[Unit]
Description=Evarti Store API
Wants=network-online.target
After=network-online.target mysql.service

[Service]
Type=simple
User=evarti
Group=evarti
WorkingDirectory=/srv/evarti-store/backend
EnvironmentFile=/srv/evarti-store/backend/.env
ExecStart=/usr/bin/node /srv/evarti-store/backend/src/app.js
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectHome=true
ProtectSystem=strict

[Install]
WantedBy=multi-user.target
```

`ProtectSystem=strict` membuat filesystem aplikasi hanya dapat dibaca oleh layanan. Ini sesuai backend saat ini yang hanya membaca data. Jika fitur berikutnya memerlukan penulisan file, siapkan direktori data khusus dan `ReadWritePaths` yang terbatas.

Aktifkan dan periksa:

```bash
sudo systemd-analyze verify /etc/systemd/system/evarti-backend.service
sudo systemctl daemon-reload
sudo systemctl enable --now evarti-backend
sudo systemctl status evarti-backend --no-pager
curl --fail-with-body http://127.0.0.1:3000/api/health
curl --fail-with-body http://127.0.0.1:3000/api/health/database
curl --fail-with-body http://127.0.0.1:3000/api/products
sudo ss -lntp
```

Health backend harus menampilkan `status: "healthy"`, dan health database `database: "connected"`. Backend seharusnya mendengarkan **127.0.0.1:3000**, bukan `0.0.0.0:3000` atau `[::]:3000`. Endpoint health pertama tidak mengecek koneksi database; periksa keduanya.

Jika gagal:

```bash
sudo journalctl -u evarti-backend -n 100 --no-pager
```

Selesaikan masalah backend/database sebelum melanjutkan ke reverse proxy.

## 7A. Deploy menggunakan Caddy

Pilih bagian ini **atau 7B**. Caddy dan Nginx tidak boleh berebut port `80`/`443`. Jika sedang memindahkan server yang sudah aktif, siapkan konfigurasi pengganti terlebih dahulu dan jadwalkan pergantian layanan.

### Pasang Caddy

Untuk VPS Ubuntu baru, tambahkan repository resmi Caddy dan pasang paketnya. Paket ini menyediakan layanan `caddy`. [Petunjuk instalasi resmi](https://caddyserver.com/docs/install#debian-ubuntu-raspbian)

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -fsSL https://dl.cloudsmith.io/public/caddy/stable/gpg.key -o /tmp/evarti-caddy.key
sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg /tmp/evarti-caddy.key
curl -fsSL https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt -o /tmp/evarti-caddy.list
sudo install -m 644 /tmp/evarti-caddy.list /etc/apt/sources.list.d/caddy-stable.list
sudo chmod 644 /usr/share/keyrings/caddy-stable-archive-keyring.gpg
sudo apt update
sudo apt install -y caddy
```

### Konfigurasi frontend dan proxy API

Edit `/etc/caddy/Caddyfile`. Jika Caddy sudah melayani website lain, tambahkan blok situs berikut ke konfigurasi yang ada alih-alih mengganti seluruh file.

```bash
sudoedit /etc/caddy/Caddyfile
```

Isi contoh untuk satu situs:

```caddyfile
{
    email admin@example.com
}

presets.example.com {
    encode zstd gzip

    @api path /api /api/*
    handle @api {
        reverse_proxy 127.0.0.1:3000
    }

    handle {
        root * /srv/evarti-store/frontend
        file_server
    }

    log
}
```

Jika global options `{ ... }` sudah ada, gabungkan pengaturan `email` ke blok tersebut. `handle` mempertahankan awalan `/api` yang dibutuhkan Express. Jangan menggantinya dengan `handle_path /api/*`, karena directive itu menghapus prefix. [Pola proxy dan file statis Caddy](https://caddyserver.com/docs/caddyfile/patterns)

Aktifkan setelah konfigurasi lolos validasi:

```bash
sudo -u caddy test -r /srv/evarti-store/frontend/index.html
sudo caddy fmt --overwrite /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
sudo systemctl enable --now caddy
sudo systemctl reload caddy
sudo systemctl status caddy --no-pager
```

### HTTPS Caddy

Caddy mengurus penerbitan/pembaruan sertifikat dan redirect HTTP ke HTTPS otomatis. DNS domain harus mengarah ke VPS, port `80`/`443` dapat dijangkau, dan koneksi keluar ke penyedia sertifikat tersedia. Sertifikat publik tidak akan langsung terbit hanya karena konfigurasi lolos validasi. [Automatic HTTPS](https://caddyserver.com/docs/automatic-https)

```bash
curl -I http://presets.example.com
curl -I https://presets.example.com
curl --fail-with-body https://presets.example.com/api/health
sudo journalctl -u caddy -n 100 --no-pager
```

Kemudian lanjutkan ke bagian 8.

## 7B. Deploy menggunakan Nginx

Pilih bagian ini jika tidak menjalankan Caddy pada port yang sama. Contoh memakai struktur paket Nginx Ubuntu (`sites-available` dan `sites-enabled`).

### Pasang dan konfigurasi HTTP terlebih dahulu

```bash
sudo apt install -y nginx
sudoedit /etc/nginx/sites-available/evarti-store
```

Isi konfigurasi:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name presets.example.com;

    root /srv/evarti-store/frontend;
    index index.html;

    access_log /var/log/nginx/evarti-store.access.log;
    error_log /var/log/nginx/evarti-store.error.log;

    gzip on;
    gzip_vary on;
    gzip_types text/css application/javascript application/json image/svg+xml;

    location = /api {
        return 308 /api/;
    }

    location ^~ /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
```

`proxy_pass` sengaja **tanpa slash setelah `3000`**, sehingga `/api/products` tetap diteruskan sebagai `/api/products`, bukan `/products`. Header alamat klien di contoh ini ditimpa oleh Nginx karena arsitekturnya satu proxy yang menghadap pengunjung langsung. [Dokumentasi proxy_pass](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass)

Proyek ini memakai beberapa file HTML, bukan SPA. Karena itu, request yang tidak ada menghasilkan `404`, tanpa fallback semua URL ke `index.html`.

Aktifkan situs pada pemasangan awal:

```bash
sudo ln -s /etc/nginx/sites-available/evarti-store /etc/nginx/sites-enabled/evarti-store
sudo -u www-data test -r /srv/evarti-store/frontend/index.html
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
curl -I http://presets.example.com
curl --fail-with-body http://presets.example.com/api/health
```

Lewati `ln -s` jika symlink sudah ada. Situs bawaan Nginx tidak harus dihapus karena hostname dicocokkan lewat `server_name`. Jika halaman bawaan masih muncul saat membuka domain, periksa DNS, hostname, dan konfigurasi aktif dengan `sudo nginx -T`. Jika IPv6 tidak tersedia pada OS Anda, hapus baris `listen [::]:80;`.

### Aktifkan HTTPS dengan Certbot

Langkah berikut memakai Certbot dari Snap sesuai panduan resminya. Jika Certbot sudah dipasang melalui APT atau metode lain, gunakan satu metode instalasi yang konsisten; jangan menumpuknya. [Panduan Certbot untuk Nginx](https://certbot.eff.org/instructions?ws=nginx&os=snap)

Pada VPS baru:

```bash
sudo apt install -y snapd
sudo snap install --classic certbot
sudo /snap/bin/certbot --nginx --redirect -d presets.example.com
sudo nginx -t
sudo /snap/bin/certbot renew --dry-run
systemctl list-timers --all
```

Masukkan email dan ikuti instruksi Certbot. Certbot menambahkan konfigurasi TLS dan redirect ke HTTPS. HTTP domain harus sudah dapat diakses dari internet sebelum penerbitan sertifikat; DNS dan firewall harus sesuai. Instalasi Snap memasang penjadwalan pembaruan sertifikat otomatis; cek timer Certbot dan hasil `renew --dry-run`.

Verifikasi:

```bash
curl -I http://presets.example.com
curl -I https://presets.example.com
curl --fail-with-body https://presets.example.com/api/health
sudo tail -n 100 /var/log/nginx/evarti-store.error.log
```

## 8. Pemeriksaan setelah deploy

Jalankan dari komputer di luar VPS untuk memastikan DNS, firewall, dan HTTPS dapat dijangkau pengunjung:

```bash
curl -I http://presets.example.com
curl -I https://presets.example.com
curl --fail-with-body https://presets.example.com/api/health
curl --fail-with-body https://presets.example.com/api/health/database
curl --fail-with-body https://presets.example.com/api/products
curl --fail-with-body https://presets.example.com/api/categories
```

HTTP harus mengarah ke HTTPS. Halaman utama harus `200`, health backend/database berhasil, dan endpoint katalog mengembalikan JSON. Array produk kosong bisa berarti database belum berisi produk `published`, meskipun koneksi sudah berhasil.

Di browser, periksa beranda, katalog, detail produk, pencarian, filter, gambar, keranjang, serta checkout demo. Di DevTools → Network, request API harus menuju `/api/...` di domain toko, bukan `localhost:3000`. Tes Playwright memakai data tiruan, sehingga hasil tes lokal tidak membuktikan database atau reverse proxy produksi sudah benar.

Nilai `product_images.image_path` harus berupa URL HTTPS yang dapat diakses, atau path publik seperti `/assets/images/nama-foto.jpg` yang benar-benar tersedia di folder `frontend`. Backend saat ini tidak menyediakan route statis untuk folder penyimpanan produk.

**Document root wajib `/srv/evarti-store/frontend`**, bukan root repository. `.env`, kode backend, dump database, dan `backend/storage/products` tidak perlu dipublikasikan. File preset berbayar juga tidak ditempatkan di folder publik; alur unduhan terproteksi belum diimplementasikan.

## 9. Update aplikasi dan rollback

Sebelum update, catat commit aktif dan backup database. Contoh backup disimpan di home akun SSH dengan akses terbatas; salin juga ke penyimpanan backup di luar VPS sesuai kebutuhan.

```bash
cd /srv/evarti-store
git rev-parse HEAD
git status --short
(
    umask 077
    mkdir -p "$HOME/evarti-backups"
    sudo mysqldump --single-transaction --no-tablespaces evarti_store > "$HOME/evarti-backups/evarti-store-$(date +%Y%m%d-%H%M%S).sql"
)
```

Pastikan dump berhasil dan simpan `.env` secara privat. Lakukan update dari working tree bersih pada branch deploy; perubahan source di server sebaiknya dibuat dan di-commit melalui repository pengembangan.

```bash
cd /srv/evarti-store
git pull --ff-only
npm ci --omit=dev --prefix backend
node --check backend/src/app.js
node --check frontend/js/storefront.js
sudo systemctl restart evarti-backend
curl --fail-with-body http://127.0.0.1:3000/api/health/database
curl --fail-with-body https://presets.example.com/api/products
```

Jalankan perintah berurutan dan hentikan jika ada kegagalan. Metode update ini bisa menimbulkan jeda singkat saat dependensi diganti/backend dimulai ulang. File frontend langsung disajikan tanpa build; bump versi query CSS/JavaScript di HTML saat aset berubah agar cache browser diperbarui. Caddy/Nginx tidak perlu direload jika hanya isi aplikasi berubah. Jika konfigurasi proxy berubah, validasi terlebih dahulu dengan `caddy validate` atau `nginx -t`, baru reload layanan yang dipakai.

Jika perlu rollback kode, ganti `COMMIT_SEBELUM_UPDATE` dengan hash yang sudah dicatat:

```bash
cd /srv/evarti-store
git switch --detach COMMIT_SEBELUM_UPDATE
npm ci --omit=dev --prefix backend
sudo systemctl restart evarti-backend
curl --fail-with-body http://127.0.0.1:3000/api/health/database
```

Rollback kode tidak memulihkan perubahan skema/data. Proyek ini belum menyediakan migration otomatis. Setelah masalah diperbaiki, kembali ke branch deploy yang sesuai sebelum memakai `git pull` lagi.

## 10. Pemecahan masalah

| Gejala | Pemeriksaan |
| --- | --- |
| `502 Bad Gateway` | Cek `systemctl status evarti-backend`, log backend, dan `curl http://127.0.0.1:3000/api/health`. Pastikan upstream/port sesuai. |
| Health backend berhasil, database gagal | Cek `mysql.service`, isi `.env`, akun MySQL, skema, dan `DB_HOST=127.0.0.1`. Uji login dengan `mysql -h 127.0.0.1 -u evarti_app -p evarti_store`; password diminta interaktif. |
| `/api/products` menghasilkan `404` | Prefix `/api` harus tetap sampai Express. Cek `handle`, bukan `handle_path`, pada Caddy dan `proxy_pass` tanpa trailing slash pada Nginx. |
| Browser menghubungi `localhost` | Pastikan `API_URL = "/api"` pada file yang di-deploy; perbarui versi script dan refresh cache browser. |
| Katalog kosong | Cek isi tabel, `products.status = 'published'`, dan kategori aktif. |
| `403` atau aset tidak terbaca | Cek document root dan izin direktori/file, termasuk direktori induk di `/srv`. |
| Sertifikat gagal terbit | Cek record A/AAAA, port `80`/`443`, firewall VPS/provider, waktu sistem, dan log Caddy/Certbot. |
| Layanan gagal karena port terpakai | Cek `sudo ss -lntp`; pilih Caddy atau Nginx sebagai pemilik port web, lalu hentikan layanan yang sudah tidak dipakai. |
| Backend tidak dapat menulis file | Unit contoh memakai filesystem hanya baca; jika menambah fitur penyimpanan, buat direktori data khusus dan izin layanan yang sesuai. |

Log yang dapat digunakan:

```bash
sudo journalctl -u evarti-backend -f
# Pilih sesuai web server yang dipakai:
sudo journalctl -u caddy -f
sudo tail -f /var/log/nginx/evarti-store.error.log
```

Tekan `Ctrl+C` untuk keluar dari pemantauan log. Tutorial ini belum diverifikasi lewat deployment langsung ke VPS; lakukan pemeriksaan bagian 8 dengan domain dan data Anda.
