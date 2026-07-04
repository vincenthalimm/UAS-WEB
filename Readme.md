# 📚 User Management Web Application

Aplikasi web berbasis **Node.js** yang menyediakan sistem autentikasi dan manajemen pengguna menggunakan **Socket.IO**, **middleware Authentication & Authorization**, serta **MySQL** sebagai database.

## ✨ Fitur

* Registrasi (Sign Up)
* Login pengguna
* Dashboard setelah aplikasi dijalankan
* Authentication menggunakan middleware
* Authorization berdasarkan role pengguna
* Halaman Admin khusus akun administrator
* Manajemen pengguna oleh Admin
* Integrasi Socket.IO
* Penyimpanan data menggunakan MySQL

---

## 🛠️ Teknologi yang Digunakan

* Node.js
* Express.js
* MySQL
* Socket.IO
* Authentication Middleware
* Authorization Middleware

---

## 🚀 Menjalankan Aplikasi

### 1. Install dependency

```bash
npm install
```

### 2. Jalankan aplikasi

```bash
npm run dev
```

### 3. Buka browser

Setelah server berhasil dijalankan, buka:

```
http://localhost:3000
```

---

## 📖 Alur Penggunaan

### 1. Dashboard

Saat aplikasi pertama kali dibuka, pengguna akan diarahkan ke halaman **Dashboard**.

### 2. Akses Data

Apabila pengguna memilih menu **Tambah Data** atau **Data** tanpa memiliki akun atau belum login, sistem akan secara otomatis mengarahkan pengguna ke halaman **Login**.

### 3. Registrasi

Jika belum memiliki akun, pilih menu **Sign Up** dan lengkapi data yang diminta.

### 4. Login

Setelah berhasil melakukan registrasi, pengguna dapat login menggunakan akun yang telah dibuat.

---

## 👤 Hak Akses Pengguna

### User

Pengguna biasa dapat:

* Login ke sistem
* Mengakses Dashboard
* Mengelola data sesuai hak akses yang diberikan

Pengguna **tidak memiliki akses** ke halaman Admin.

---

### Admin

Admin memiliki seluruh hak akses pengguna ditambah dengan:

* Mengakses halaman Admin
* Melihat daftar pengguna
* Menghapus akun pengguna dari aplikasi

---

## ⚠️ Mekanisme Penghapusan User

Ketika Admin menghapus akun pengguna melalui halaman Admin:

* Data pengguna pada aplikasi akan dihapus sehingga pengguna tidak dapat lagi login menggunakan akun tersebut.
* Namun, data asli pengguna **tetap tersimpan di database MySQL**.

Data yang masih tersimpan di database digunakan sebagai penanda bahwa email dan foto profil (profile picture) tersebut telah diblokir sehingga tidak dapat digunakan kembali untuk melakukan registrasi.

Jika pengguna ingin menggunakan aplikasi kembali, maka pengguna harus melakukan registrasi menggunakan **email yang berbeda**.

---

## 🔒 Sistem Keamanan

Aplikasi ini menerapkan beberapa mekanisme keamanan, yaitu:

* Authentication Middleware untuk memverifikasi identitas pengguna.
* Authorization Middleware untuk membatasi akses berdasarkan role (Admin dan User).
* Socket.IO digunakan untuk komunikasi real-time antara client dan server.

---

## 📂 Struktur Hak Akses

| Fitur         | User | Admin |
| ------------- | ---- | ----- |
| Dashboard     | ✅    | ✅     |
| Login         | ✅    | ✅     |
| Registrasi    | ✅    | ✅     |
| Halaman Admin | ❌    | ✅     |
| Hapus User    | ❌    | ✅     |

---

## 💾 Database

Database menggunakan **MySQL** sebagai media penyimpanan data pengguna.

Data pengguna yang telah dihapus oleh Admin masih tersimpan pada database sebagai mekanisme pemblokiran akun, sehingga email maupun profile picture yang pernah digunakan tidak dapat digunakan kembali untuk registrasi.

---

## 📌 Catatan

* Jalankan aplikasi menggunakan `npm run dev`.
* Pastikan MySQL telah aktif sebelum menjalankan aplikasi.
* Pastikan konfigurasi database telah sesuai dengan file konfigurasi proyek.
* Halaman Admin hanya dapat diakses menggunakan akun yang memiliki role **Admin**.

# 🔄 Cara Kerja Sistem

## 1. Menjalankan Aplikasi

Jalankan aplikasi menggunakan perintah berikut:

```bash
npm install
npm run dev
```

Server akan berjalan pada:

```
http://localhost:3000
```

Saat aplikasi dibuka, pengguna akan otomatis diarahkan ke halaman **Login**.

---

## 2. Registrasi (Sign Up)

Pengguna yang belum memiliki akun harus melakukan registrasi terlebih dahulu melalui halaman **Sign Up**.

Pada proses registrasi, sistem akan:

* Memastikan seluruh data telah diisi.
* Memastikan password dan konfirmasi password sama.
* Memastikan panjang password minimal 6 karakter.
* Memastikan email belum pernah digunakan.

Apabila registrasi berhasil, pengguna akan diarahkan kembali ke halaman Login.

> Akun pertama yang didaftarkan akan otomatis memiliki role **Admin**, sedangkan akun berikutnya akan menjadi **User**.

---

## 3. Login

Setelah login berhasil:

* Sistem membuat JSON Web Token (JWT).
* JWT disimpan pada Cookie browser.
* Session login disimpan pada database.
* Pengguna kemudian diarahkan ke halaman Dashboard.

Setiap halaman yang bersifat privat akan memveriksa JWT dan session pengguna sebelum memberikan akses.

---

## 4. Authentication

Seluruh halaman berikut hanya dapat diakses setelah login:

* Dashboard
* Tambah Data
* Data
* Edit Data
* Admin

Apabila pengguna belum login atau session telah berakhir, sistem akan otomatis mengarahkan pengguna kembali ke halaman Login.

---

## 5. Authorization

Sistem menerapkan Role-Based Access Control (RBAC).

### User

User hanya dapat:

* Melihat Dashboard
* Menambah data transaksi
* Mengedit data transaksi
* Menghapus data transaksi
* Logout

User **tidak dapat** membuka halaman Admin.

### Admin

Selain seluruh fitur User, Admin juga dapat:

* Membuka halaman Admin
* Melihat seluruh akun pengguna
* Menghapus akun pengguna
* Melakukan reset seluruh data transaksi

---

## 6. Manajemen Data Keuangan

Pengguna dapat melakukan operasi CRUD terhadap data transaksi, yaitu:

* Menambah transaksi pemasukan
* Menambah transaksi pengeluaran
* Mengubah data transaksi
* Menghapus transaksi

Dashboard secara otomatis menghitung:

* Total Saldo
* Total Pemasukan
* Total Pengeluaran

---

## 7. Komunikasi Realtime Menggunakan Socket.IO

Aplikasi menggunakan Socket.IO untuk memberikan pembaruan data secara realtime.

Ketika pengguna:

* Menambah data
* Mengedit data
* Menghapus data
* Mereset data

client akan mengirim event ke server sehingga pengguna lain yang sedang membuka aplikasi dapat memperoleh notifikasi bahwa data telah berubah tanpa perlu melakukan refresh halaman secara manual.

---

## 8. Keamanan Sistem

Aplikasi menerapkan beberapa mekanisme keamanan, antara lain:

* Authentication menggunakan JSON Web Token (JWT).
* Penyimpanan session aktif pada database.
* Middleware Authentication untuk memverifikasi pengguna.
* Middleware Authorization untuk membatasi akses berdasarkan role.
* Cookie HTTP Only untuk menyimpan token autentikasi.

Dengan mekanisme tersebut, hanya pengguna yang telah login dan memiliki hak akses yang sesuai yang dapat menggunakan fitur-fitur tertentu pada aplikasi.
