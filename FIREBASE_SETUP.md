# Panduan Setup Firebase - Web Pembelian Google AI Pro

Dokumen ini menjelaskan langkah-langkah lengkap untuk menyiapkan Firebase pada project ini, mulai dari pembuatan project di Firebase Console hingga proses deployment Cloud Functions dan Firestore Rules.

---

## Langkah 1: Buat Project Firebase baru

1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Klik **Add project** (Tambah project).
3. Masukkan nama project (contoh: `pembelian-googlepro`) dan klik **Continue**.
4. Aktifkan atau nonaktifkan Google Analytics sesuai kebutuhan Anda, lalu klik **Create project**.
5. Tunggu proses pembuatan selesai, lalu klik **Continue**.

---

## Langkah 2: Tambahkan Web App & Dapatkan Konfigurasi

1. Pada halaman Dashboard Project Firebase Anda, klik ikon **Web (`</>`)** di bagian tengah atas untuk menambahkan aplikasi web.
2. Masukkan nama aplikasi (contoh: `AI Pro Store`) dan klik **Register app** (jangan centang Firebase Hosting untuk saat ini).
3. Salin objek konfigurasi `firebaseConfig` yang muncul. Formatnya terlihat seperti ini:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "project-id.firebaseapp.com",
     projectId: "project-id",
     storageBucket: "project-id.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:123456:web:abcd"
   };
   ```
4. Buka file `.env` di root directory project Anda (`d:\projects\web-pembelian-googlepro\.env`) dan ganti nilai placeholder dengan konfigurasi yang baru saja Anda salin:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=project-id
   VITE_FIREBASE_STORAGE_BUCKET=project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
   VITE_FIREBASE_APP_ID=1:123456:web:abcd
   ```

---

## Langkah 3: Aktifkan Firebase Authentication

1. Di menu navigasi sebelah kiri Firebase Console, klik **Build** -> **Authentication**.
2. Klik **Get started**.
3. Di tab **Sign-in method**, aktifkan penyedia autentikasi berikut:
   - **Email/Password**: Aktifkan opsi **Email/Password** (opsi Passwordless/Email link biarkan nonaktif), klik **Save**.
   - **Google**: Klik **Add new provider**, pilih **Google**, masukkan email support Anda, klik **Save**.

---

## Langkah 4: Siapkan Cloud Firestore Database

1. Di menu navigasi sebelah kiri, klik **Build** -> **Firestore Database**.
2. Klik **Create database**.
3. Pilih lokasi database. **Sangat direkomendasikan** menggunakan **`asia-southeast1` (Singapore)** agar lokasinya berdekatan dengan Cloud Functions kita. Klik **Next**.
4. Pilih **Start in test mode** atau **Production mode**, lalu klik **Create**.
   *(Catatan: Aturan keamanan/rules akan kita timpa secara otomatis lewat deploy CLI dari file lokal `firestore.rules`)*.

---

## Langkah 5: Upgrade ke Blaze Plan (Wajib untuk Cloud Functions V2)

1. Cloud Functions v2 Firebase memerlukan Node.js 18/20 runtime dan Google Cloud Build, yang mengharuskan project berada di **Blaze Plan (Pay-as-you-go)**.
2. Di bagian kiri bawah Firebase Console, klik tombol **Upgrade** di samping logo plan project Anda.
3. Pilih **Blaze Plan** dan ikuti instruksi pengisian billing (kartu kredit/debit virtual seperti Jenius, Jago, dll. bisa digunakan).
   *(Tenang, penggunaan skala kecil untuk development tetap gratis karena ada kuota free tier bulanan dari Google Cloud yang sangat besar)*.

---

## Langkah 6: Install dan Login Firebase CLI

1. Buka terminal atau command prompt di komputer Anda.
2. Pastikan Node.js sudah terinstall, lalu install Firebase Tools secara global jika belum punya:
   ```bash
   npm install -g firebase-tools
   ```
3. Login ke akun Google Anda yang terhubung dengan Firebase:
   ```bash
   firebase login
   ```
   *Terminal akan membuka browser untuk verifikasi login. Izinkan akses.*

---

## Langkah 7: Hubungkan Project Lokal dengan Firebase Console

1. Di terminal komputer Anda, masuk ke root folder project:
   ```bash
   cd d:\projects\web-pembelian-googlepro
   ```
2. Hubungkan project lokal ke project yang baru saja dibuat di Firebase Console:
   ```bash
   firebase use --add
   ```
3. Pilih project ID yang sesuai dari daftar yang muncul, dan beri nama alias (misal: `default` atau `production`).

---

## Langkah 8: Deploy Firestore Rules, Indexes, dan Cloud Functions

1. Install dependensi untuk Cloud Functions lokal terlebih dahulu:
   ```bash
   cd functions
   npm install
   cd ..
   ```
2. Jalankan deployment untuk semuanya (Firestore Rules, Indexes, dan Functions):
   ```bash
   firebase deploy
   ```
   *Atau jika ingin men-deploy satu per satu:*
   - Men-deploy aturan database: `firebase deploy --only firestore:rules`
   - Men-deploy indeks database: `firebase deploy --only firestore:indexes`
   - Men-deploy Cloud Functions: `firebase deploy --only functions`

3. Setelah proses deploy selesai, Anda akan mendapatkan URL Webhook HTTP untuk **webhookReceiver** di log output, formatnya seperti:
   `https://webhookreceiver-asia-southeast1-<project-id>.cloudfunctions.net/webhookReceiver`
   
   Salin URL ini dan masukkan ke dashboard Pixel API Anda (jika diperlukan untuk instant update status task).

---

## Langkah 9: Jalankan Project React Secara Lokal

1. Kembali ke folder root (`web-pembelian-googlepro`):
   ```bash
   npm run dev
   ```
2. Buka browser di [http://localhost:5174/](http://localhost:5174/) (atau port yang tertera).
3. Anda sekarang bisa melakukan Registrasi, Login, cek saldo real-time (via Cloud Functions), dan mengirimkan tugas (submit task) Google AI Pro!
