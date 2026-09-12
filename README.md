# Temu Kopling

Antarmuka mobilitas berbahasa Indonesia untuk customer dan rider. Dibangun dari repository kosong menggunakan React 19, TypeScript, Vite, dan React Router.

## Pengembangan

Gunakan Node.js 22.12.0 (`nvm install && nvm use`), kemudian:

```sh
npm ci
npm run dev
```

Vite melayani aplikasi pada port 5173. Untuk hasil produksi:

```sh
npm run build
npm run preview
```

Server produksi perlu meneruskan route yang bukan berkas statis ke `index.html` agar tautan seperti `/app/history` dapat dibuka langsung. `public/_redirects` menyediakan aturan untuk Netlify; `vercel.json` menyediakan aturan untuk Vercel.

## Mencoba alur

- **Customer**: pilih “Coba demo customer” pada halaman masuk, pilih jemput/tujuan, layanan, dan pembayaran, lalu pesan. Panel perjalanan menyediakan tombol simulasi penerimaan, kedatangan, keberangkatan, selesai, dan rating.
- **Rider**: ganti peran melalui menu akun atau pilih “Coba demo rider”. Aktifkan status online, terima atau tolak permintaan, dan lanjutkan perjalanan sampai selesai. Pendapatan dan riwayat mengikuti perjalanan yang diselesaikan.
- **Akun**: ubah profil, preferensi, dan tandai notifikasi dibaca. “Reset data demo” pada profil mengembalikan contoh awal.

## Batas demo

Ini adalah frontend interaktif, **belum layanan transportasi produksi**. Tidak ada backend, verifikasi identitas/kata sandi, pelacakan GPS, komunikasi rider, pembayaran, atau pencairan uang nyata. Form masuk hanya memvalidasi input untuk demo; kata sandi tidak disimpan atau dikirim.

Profil, perjalanan, dan preferensi disimpan di browser melalui `localStorage` (`temu-kopling-demo-v1`). Data diperiksa dengan Zod saat dimuat, dan data rusak dipulihkan ke contoh awal. Gunakan data contoh. Dua peran berbagi state di satu browser; sinkronisasi antar perangkat/tab belum tersedia.

Peta SVG dan tarif bersifat ilustratif. Pilihan lokasi terbatas pada contoh Yogyakarta; ETA bukan hasil routing nyata. Gambar skuter merupakan ilustrasi generatif. Notifikasi menggunakan aktivitas lokal; preferensi tersimpan sebagai persiapan integrasi layanan notifikasi.

Untuk produksi diperlukan API autentikasi dan otorisasi server, database, dispatch realtime, layanan peta/routing, verifikasi rider/kendaraan, komunikasi, serta penyedia pembayaran. Validasi frontend tidak menggantikan validasi server.

## Struktur

| Lokasi                   | Tanggung jawab                                                        |
| ------------------------ | --------------------------------------------------------------------- |
| `src/App.tsx`            | Routing, lazy loading, dan error boundary                             |
| `src/lib/model.ts`       | Schema, data contoh, harga estimasi, reducer, dan transisi perjalanan |
| `src/lib/Provider.tsx`   | Persistence lokal dan toast                                           |
| `src/components/`        | UI reusable, navigasi peran, peta, dan panel perjalanan               |
| `src/pages/Public.tsx`   | Landing dan login/register demo                                       |
| `src/pages/Customer.tsx` | Booking dan perjalanan customer                                       |
| `src/pages/Rider.tsx`    | Operasional rider dan pendapatan                                      |
| `src/pages/Shared.tsx`   | Riwayat, notifikasi, dan profil                                       |
| `src/styles.css`         | Token desain, layout, komponen, dan breakpoint                        |

Palet hijau hutan dengan aksen sage, font Plus Jakarta Sans lokal, ikon Lucide, sidebar desktop, drawer/bottom navigation mobile, focus ring, dialog native, skeleton, dan reduced motion. Breakpoint utama: 767px, 1023px, 1190px, dan 1500px.

## Validasi

```sh
npm run lint
npm run typecheck
npm run format:check
npm test
npm run build
```

`npm test` memakai Node test runner + tsx untuk memverifikasi state perjalanan, booking, dispatch, rating, persistence, dan pemisahan peran/notifikasi. GitHub Actions menjalankan pemeriksaan yang sama. Gunakan `npm run format` setelah mengubah source.
