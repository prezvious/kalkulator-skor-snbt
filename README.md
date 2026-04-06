# Kalkulator Skor SNBT 📊

**Hitung prediksi skor UTBK-mu dengan mudah dan cepat!**

Kalkulator ini membantu kamu menghitung estimasi skor SNBT (Seleksi Nasional Berdasarkan Tes) berdasarkan jumlah jawaban benar di setiap subtes. Dengan tampilan yang modern dan user-friendly, kamu bisa langsung melihat hasil perhitungan lengkap dengan visualisasi grafik!

## ✨ Fitur Utama

### 🎯 Kalkulasi Skor Otomatis
- Hitung skor untuk 7 subtes: PPU, PU, PBM, PK, LBI, PM, dan LBE
- Sistem scoring mengikuti standar UTBK yang sebenarnya
- Tampilkan skor per subtes beserta nilai maksimumnya

### 📊 Visualisasi Data
- Grafik interaktif untuk melihat perbandingan skor
- Dua mode visualisasi: Bar Chart dan Radar Chart
- Progress bar untuk melihat pencapaian skor keseluruhan

### 🌓 Dark/Light Mode
- Toggle tema gelap dan terang
- Menyimpan preferensi tema secara otomatis
- Mendukung preferensi sistem operasi

### 💾 **Fitur Offline (BARU!)**
Nah, ini fitur keren yang baru aja ditambahkan:

- **Aplikasi Web Progresif (PWA)**: Kamu bisa install aplikasi ini langsung ke perangkatmu, baik itu HP, tablet, atau desktop. Jadi nggak perlu buka browser terus-menerus!
  
- **Mode Offline Penuh**: Setelah pertama kali membuka aplikasi, semua file penting (HTML, CSS, JavaScript) akan disimpan di cache browser. Artinya, kamu bisa tetap pakai kalkulator ini meskipun:
  - Lagi di tempat tanpa sinyal
  - Kuota habis
  - Sengaja matiin WiFi/data
  
- **Auto Save Preferensi**: Tema yang kamu pilih (dark/light) bakal tersimpan otomatis. Jadi setiap kali buka aplikasi, tampilannya tetap sesuai selera kamu.

- **Cepat dan Ringan**: Karena file-file udah di-cache, loading aplikasi jadi super cepat bahkan ketika online!

## 🚀 Cara Menggunakan (Online & Offline)

### Pertama Kali Pakai (Perlu Internet)
1. Buka aplikasi lewat browser (Chrome, Firefox, Safari, Edge, dll)
2. Tunggu sebentar sampai semua resource ter-load
3. Aplikasi akan otomatis menyimpan file-file penting di background

### Mode Offline (Setelah Pertama Kali Load)
Sekarang kamu bisa pakai tanpa internet! Caranya:

**Di Desktop/Laptop:**
- Cukup buka lagi halaman yang sama, bahkan tanpa koneksi internet
- Atau ketik `file:///` diikuti path ke folder aplikasi di browser kamu

**Di HP/Mobile:**
1. Buka menu browser (titik tiga di Chrome atau menu di Safari)
2. Pilih "Add to Home Screen" atau "Install App"
3. Aplikasi akan muncul di home screen seperti app biasa
4. Tap iconnya buat buka - nggak perlu internet lagi!

### Cara Hitung Skor
1. Masukkan jumlah jawaban benar untuk setiap subtes (sesuai batas maksimal soal)
2. Klik tombol **"Hitung Skor Sekarang"**
3. Lihat hasil perhitungan dengan detail:
   - Skor per subtes
   - Rata-rata skor keseluruhan
   - Progress bar pencapaian
   - Visualisasi grafik
4. Gunakan tombol **Reset** untuk mengulang perhitungan

## 📁 Struktur File

```
├── index.html          # Halaman utama aplikasi
├── style.css           # Styling dan tema (dark/light)
├── script.js           # Logika kalkulasi dan interaksi
├── sw.js               # Service Worker untuk offline mode (BARU!)
├── manifest.json       # Konfigurasi PWA (BARU!)
└── README.md           # Dokumentasi ini
```

## 🛠️ Teknologi yang Digunakan

- **HTML5** - Struktur halaman
- **CSS3** - Styling dengan CSS Variables untuk theming
- **JavaScript (Vanilla)** - Logika aplikasi tanpa framework
- **Chart.js** - Library untuk visualisasi grafik
- **Font Awesome** - Icon library
- **Google Fonts (Inter)** - Tipografi modern
- **Service Worker API** - Untuk fitur offline (BARU!)
- **Web App Manifest** - Untuk instalasi PWA (BARU!)

## 💡 Tips Penggunaan

1. **Input Valid**: Pastikan input sesuai dengan jumlah soal maksimal di setiap subtes
2. **Gunakan Visualisasi**: Coba kedua mode chart (Bar dan Radar) untuk perspektif berbeda
3. **Simpan Hasil**: Screenshot hasil perhitungan untuk referensi atau berbagi dengan teman
4. **Install PWA**: Untuk pengalaman terbaik, install aplikasi ke home screen perangkatmu
5. **Offline Ready**: Setelah pertama kali load, kamu bisa pakai kapan saja tanpa khawatir sinyal!

## 🌐 Browser Support

Aplikasi ini bekerja optimal di browser modern:
- Chrome/Edge (versi terbaru)
- Firefox
- Safari
- Opera

**Catatan**: Fitur offline (Service Worker) membutuhkan browser yang mendukung PWA. Untuk fitur instalasi ke home screen, gunakan Chrome, Edge, atau Safari.

## 📝 Catatan Penting

- Kalkulator ini memberikan **estimasi/prediksi** skor, bukan hasil resmi
- Skor aktual dapat bervariasi tergantung pada kebijakan panitia UTBK tahun berjalan
- Untuk hasil pertama kali, diperlukan koneksi internet untuk memuat resource eksternal (Font Awesome, Google Fonts, Chart.js)
- Setelah resource ter-cache, aplikasi dapat berfungsi penuh tanpa internet

## 🎓 Tentang SNBT

SNBT (Seleksi Nasional Berdasarkan Tes) adalah jalur seleksi untuk masuk PTN (Perguruan Tinggi Negeri) yang menggunakan tes tertulis berbasis komputer. Tes ini mengukur berbagai kemampuan kognitif yang dibutuhkan untuk sukses di bangku kuliah.

## 📄 License

Dibuat untuk membantu pejuang PTN Indonesia. Semoga bermanfaat!

---

**Happy Calculating & Good Luck with your UTBK! 🎉**

*Jangan lupa share ke teman-teman seperjuangan kamu ya!*
