/* ===========================================================================
 * SANTI VET CARE — SATU FILE UNTUK SEMUA ISI SITUS
 * ===========================================================================
 *
 * File ini sengaja dibuat supaya bisa diedit tanpa perlu bisa coding.
 * Aturannya cuma dua:
 *
 *   1. Yang diapit tanda kutip "seperti ini" adalah teks. Ganti isi di
 *      antara tanda kutipnya saja, jangan hapus tanda kutipnya.
 *   2. `true` artinya TAMPILKAN / AKTIF. `false` artinya SEMBUNYIKAN / MATI.
 *      Tulis persis huruf kecil semua, tanpa tanda kutip.
 *
 * Setiap kali selesai mengedit, simpan file ini. Situs akan ikut berubah.
 *
 * ---------------------------------------------------------------------------
 * ⚠️  YANG PALING PENTING
 * ---------------------------------------------------------------------------
 * Ini situs klinik hewan. Orang mengambil keputusan medis berdasarkan apa yang
 * tertulis di sini. Kalau ragu antara menulis sesuatu atau mengosongkannya,
 * KOSONGKAN. Setiap baris yang ditandai `// ❓ BELUM DIKONFIRMASI` sengaja
 * dimatikan sampai pihak klinik memastikannya sendiri.
 * ========================================================================= */

/* ---------------------------------------------------------------------------
 * 1. IDENTITAS & KONTAK
 * ---------------------------------------------------------------------------
 * Sumber semua data di blok ini: Google Business Profile milik Santi Vet Care
 * dan bio Instagram @santivetcare, diperiksa 8 September 2026.
 * Tidak ada satu pun yang diambil dari direktori pihak ketiga.
 * ------------------------------------------------------------------------- */
export const CLINIC = {
  name: "Santi Vet Care",

  // Diambil dari logo resmi klinik di Instagram.
  tagline: "Praktek Dokter Hewan Bersama",

  // Nomor yang sama dipakai untuk telepon dan WhatsApp.
  // `phoneDisplay` yang dibaca orang, `phoneE164` yang dipakai tombol.
  phoneDisplay: "0812-3707-2009",
  phoneE164: "+6281237072009",
  whatsappE164: "6281237072009", // tanpa tanda + , format wa.me

  instagramHandle: "santivetcare",
  instagramUrl: "https://www.instagram.com/santivetcare/",

  address: {
    street: "Jl. Sari Dana IV No. 20",
    area: "Ubung Kaja, Kec. Denpasar Utara",
    city: "Kota Denpasar",
    province: "Bali",
    postalCode: "80116",
    country: "ID",
  },

  // Koordinat dari URL halaman Google Maps klinik.
  coords: { lat: -8.6271081, lng: 115.1915156 },
  plusCode: "95FR+5J Ubung Kaja, Kota Denpasar, Bali",

  mapsPlaceUrl:
    "https://www.google.com/maps/place/Santi+Vet+Care/@-8.6271081,115.1915156,17z",
  mapsDirectionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=-8.6271081,115.1915156&destination_place_id=Santi+Vet+Care",

  // Patokan jalan untuk halaman Lokasi. Isi dengan patokan yang benar-benar
  // dikenal warga sekitar. Kosongkan array-nya (jadi []) kalau belum yakin.
  // ❓ BELUM DIKONFIRMASI — daftar di bawah ini masih kosong dengan sengaja.
  landmarks: [] as string[],

  timezone: "Asia/Makassar", // WITA
  timezoneLabel: "WITA",
} as const;

/* ---------------------------------------------------------------------------
 * 2. JAM OPERASIONAL
 * ---------------------------------------------------------------------------
 * Dipakai untuk dua hal sekaligus:
 *   - indikator "Buka sekarang / Sedang tutup" di setiap halaman
 *   - daftar jam yang bisa dipilih di form janji temu
 *
 * Format: 0 = Minggu, 1 = Senin, ... 6 = Sabtu.
 * `null` berarti TUTUP seharian.
 * Jam ditulis 24 jam, "HH:MM".
 *
 * ⚠️ KALAU BELUM YAKIN, ganti seluruh nilai `HOURS` di bawah menjadi `null`
 *    (tulis: export const HOURS: WeekHours | null = null;).
 *    Indikator buka/tutup akan hilang total dari situs, dan form janji temu
 *    akan mengarahkan orang ke WhatsApp. Itu jauh lebih baik daripada
 *    menampilkan jam yang salah.
 *
 * ⚠️ KONFLIK YANG BELUM SELESAI — mohon dipastikan pihak klinik:
 *    Google Business Profile : Senin–Sabtu 09.00–17.00, Minggu TUTUP
 *    Bio Instagram           : Senin–Sabtu 09.00–20.00, Minggu BUKA
 *    Yang dipakai di bawah ini adalah versi Google Business Profile, karena
 *    salah ke arah "lebih cepat tutup" jauh lebih aman daripada sebaliknya.
 * ------------------------------------------------------------------------- */
export type Interval = { open: string; close: string };
export type WeekHours = Record<0 | 1 | 2 | 3 | 4 | 5 | 6, Interval[] | null>;

export const HOURS: WeekHours | null = {
  0: null, // Minggu — tutup
  1: [{ open: "09:00", close: "17:00" }], // Senin
  2: [{ open: "09:00", close: "17:00" }], // Selasa
  3: [{ open: "09:00", close: "17:00" }], // Rabu
  4: [{ open: "09:00", close: "17:00" }], // Kamis
  5: [{ open: "09:00", close: "17:00" }], // Jumat
  6: [{ open: "09:00", close: "17:00" }], // Sabtu
};

/* Tanggal libur khusus (misalnya hari raya). Format "YYYY-MM-DD".
 * Tanggal yang ada di sini dianggap tutup seharian. */
export const CLOSED_DATES: string[] = [];

/* ---------------------------------------------------------------------------
 * 3. SAKLAR FITUR
 * ---------------------------------------------------------------------------
 * Ubah `false` jadi `true` hanya kalau pihak klinik sudah memastikannya.
 * ------------------------------------------------------------------------- */
export type Features = {
  emergency: boolean;
  emergencyPhoneE164: string;
  emergencyWhatsappE164: string;
  emergencyNote: string;
  facilitiesConfirmed: boolean;
  facilities: string[];
  otherSpeciesConfirmed: boolean;
  showTeamSlots: boolean;
};

export const FEATURES: Features = {
  /* ❓ BELUM DIKONFIRMASI — JANGAN NYALAKAN SEBELUM PASTI.
   *
   * Menyalakan ini akan memunculkan jalur layanan darurat di beranda, halaman
   * janji temu, halaman kontak, dan tombol melayang.
   *
   * Orang datang jam 2 pagi karena membaca ini. Kalau kliniknya ternyata
   * tutup, kerugiannya ditanggung hewannya. Biarkan `false` sampai pihak
   * klinik menyatakan sendiri bahwa mereka benar-benar melayani panggilan
   * darurat di luar jam praktek. */
  emergency: false,

  /* Nomor & jam yang dipakai jalur darurat. Hanya terbaca kalau
   * `emergency` di atas bernilai true. Kosongkan kalau sama dengan
   * nomor utama. */
  emergencyPhoneE164: "",
  emergencyWhatsappE164: "",
  emergencyNote: "", // contoh: "Di luar jam praktek, hubungi lebih dulu."

  /* ❓ BELUM DIKONFIRMASI — daftar fasilitas.
   * Selama `facilitiesConfirmed` masih false, situs tidak akan mengklaim
   * fasilitas apa pun (USG, rontgen, laboratorium, ruang operasi, kandang
   * rawat inap, dan lain-lain). Isi `facilities` dulu, baru ubah ke true. */
  facilitiesConfirmed: false,
  facilities: [] as string[],

  /* ❓ BELUM DIKONFIRMASI — jenis hewan selain anjing dan kucing.
   * Selama masih false, situs menampilkan pertanyaan yang diarahkan ke
   * WhatsApp, bukan daftar hewan yang dikarang. */
  otherSpeciesConfirmed: false,

  /* Tampilkan blok "peran tim" di halaman Kontak. Kartu ini sengaja tanpa
   * nama dan tanpa gelar, dan ditandai sebagai slot yang menunggu diisi. */
  showTeamSlots: true,
};

/* ---------------------------------------------------------------------------
 * 4. JENIS HEWAN
 * ---------------------------------------------------------------------------
 * `enabled: true` hanya untuk hewan yang pasti ditangani.
 * Anjing dan kucing dinyalakan sesuai arahan klien. Sisanya menunggu
 * konfirmasi klinik — jangan menyalakan berdasarkan tebakan.
 * ------------------------------------------------------------------------- */
export type Species = {
  id: string;
  label: string;
  enabled: boolean;
};

export const SPECIES: Species[] = [
  { id: "anjing", label: "Anjing", enabled: true },
  { id: "kucing", label: "Kucing", enabled: true },

  // ❓ BELUM DIKONFIRMASI — biarkan false sampai klinik memastikan.
  { id: "kelinci", label: "Kelinci", enabled: false },
  { id: "burung", label: "Burung", enabled: false },
  { id: "reptil", label: "Reptil", enabled: false },
  { id: "hewan-kecil-lain", label: "Hewan kecil lain", enabled: false },
];

/* ---------------------------------------------------------------------------
 * 5. LAYANAN
 * ---------------------------------------------------------------------------
 * `enabled: false` = layanan tidak muncul di mana pun. Bukan diredupkan,
 * bukan ditandai "segera hadir" — benar-benar hilang dari situs.
 *
 * Yang masih false di bawah ini bukan berarti klinik tidak melayaninya.
 * Artinya kami belum punya pernyataan dari klinik, jadi situs diam.
 * Ubah satu kata `false` menjadi `true` untuk menampilkannya.
 *
 * `species` membatasi layanan ini berlaku untuk hewan apa saja. Kosongkan
 * array-nya ([]) kalau berlaku untuk semua jenis hewan yang aktif.
 *
 * ⚠️ `blurb` boleh menjelaskan APA yang dikerjakan dan KAPAN orang biasanya
 *    membutuhkannya. Tidak boleh menjadi petunjuk medis, dosis, jadwal, atau
 *    janji hasil.
 * ------------------------------------------------------------------------- */
export type Service = {
  id: string;
  label: string;
  group: "Pemeriksaan" | "Pencegahan" | "Tindakan" | "Perawatan" | "Penginapan";
  blurb: string;
  when: string;
  species: string[];
  enabled: boolean;
  art: string; // nama file grafis di /public/art, dibuat otomatis
};

export const SERVICES: Service[] = [
  {
    id: "pemeriksaan-umum",
    label: "Pemeriksaan Umum",
    group: "Pemeriksaan",
    blurb:
      "Pemeriksaan kondisi hewan oleh dokter hewan, dilanjutkan pembahasan langkah berikutnya bersama pemiliknya.",
    when: "Biasanya dipilih saat ada perubahan pada hewan yang belum jelas penyebabnya, atau untuk kontrol berkala.",
    species: [],
    enabled: true,
    art: "svc-pemeriksaan-umum",
  },
  {
    id: "konsultasi",
    label: "Konsultasi",
    group: "Pemeriksaan",
    blurb:
      "Waktu bicara dengan dokter hewan untuk membahas kondisi, riwayat, dan rencana perawatan hewan Anda.",
    when: "Biasanya dipilih sebelum mengambil keputusan perawatan, atau untuk menindaklanjuti pemeriksaan sebelumnya.",
    species: [],
    enabled: true,
    art: "svc-konsultasi",
  },
  {
    id: "vaksinasi",
    label: "Vaksinasi",
    group: "Pencegahan",
    blurb:
      "Pemberian vaksin sesuai penilaian dokter hewan terhadap kondisi dan riwayat hewan Anda.",
    when: "Jenis dan waktunya ditentukan dokter hewan saat pemeriksaan. Bawa catatan vaksin sebelumnya bila ada.",
    species: [],
    enabled: true,
    art: "svc-vaksinasi",
  },

  /* ---- Di bawah ini menunggu konfirmasi klinik ----------------------------
   * Semuanya menyiratkan fasilitas atau layanan yang belum pernah dinyatakan
   * sendiri oleh Santi Vet Care. Ubah `enabled` menjadi `true` satu per satu
   * setelah dipastikan. */

  {
    id: "sterilisasi",
    label: "Sterilisasi",
    group: "Tindakan",
    blurb:
      "Tindakan sterilisasi pada hewan, dengan pemeriksaan dan persiapan sebelum tindakan.",
    when: "Biasanya direncanakan jauh hari, bukan mendadak. Waktu yang tepat dibicarakan lebih dulu dengan dokter hewan.",
    species: [],
    enabled: false, // ❓ BELUM DIKONFIRMASI — menyiratkan ruang tindakan
    art: "svc-sterilisasi",
  },
  {
    id: "bedah",
    label: "Bedah",
    group: "Tindakan",
    blurb: "Tindakan bedah sesuai penilaian dan kesiapan dokter hewan.",
    when: "Selalu didahului pemeriksaan dan pembahasan dengan pemilik hewan.",
    species: [],
    enabled: false, // ❓ BELUM DIKONFIRMASI — menyiratkan ruang operasi
    art: "svc-bedah",
  },
  {
    id: "grooming",
    label: "Grooming",
    group: "Perawatan",
    blurb: "Perawatan kebersihan hewan: mandi, perawatan bulu, dan kuku.",
    when: "Biasanya dijadwalkan berkala, terpisah dari kunjungan pemeriksaan.",
    species: [],
    enabled: false, // ❓ BELUM DIKONFIRMASI
    art: "svc-grooming",
  },
  {
    id: "rawat-inap",
    label: "Rawat Inap",
    group: "Penginapan",
    blurb: "Hewan menginap di klinik untuk pemantauan oleh tim klinik.",
    when: "Diputuskan dokter hewan setelah pemeriksaan, bukan dipesan sendiri dari awal.",
    species: [],
    enabled: false, // ❓ BELUM DIKONFIRMASI — menyiratkan kandang rawat inap
    art: "svc-rawat-inap",
  },
  {
    id: "penitipan",
    label: "Penitipan",
    group: "Penginapan",
    blurb: "Hewan dititipkan selama pemiliknya bepergian.",
    when: "Biasanya dipesan jauh hari sebelum tanggal keberangkatan.",
    species: [],
    enabled: false, // ❓ BELUM DIKONFIRMASI
    art: "svc-penitipan",
  },
];

/* ---------------------------------------------------------------------------
 * 6. DAFTAR GEJALA UNTUK FORM JANJI TEMU
 * ---------------------------------------------------------------------------
 * ⚠️ INI BUKAN ALAT DIAGNOSIS.
 *
 * Daftar ini cuma dipakai supaya pemilik hewan tidak perlu merangkai kalimat
 * saat sedang panik, dan supaya klinik menerima keterangan yang lebih rapi.
 *
 * Tidak boleh ada pemetaan gejala ke penyakit, ke tingkat kegawatan, ke saran
 * tindakan, atau ke urutan prioritas. Dikumpulkan, lalu diteruskan apa adanya.
 * ------------------------------------------------------------------------- */
export const SYMPTOMS: { id: string; label: string }[] = [
  { id: "tidak-mau-makan", label: "Tidak mau makan" },
  { id: "muntah", label: "Muntah" },
  { id: "diare", label: "Diare" },
  { id: "lemas", label: "Lemas" },
  { id: "gatal-berlebihan", label: "Gatal berlebihan" },
  { id: "luka", label: "Luka" },
  { id: "pincang", label: "Pincang" },
];

/* ---------------------------------------------------------------------------
 * 7. PENGATURAN JANJI TEMU
 * ------------------------------------------------------------------------- */
export const BOOKING = {
  /* Panjang satu slot dalam menit. Jam praktek dipotong menjadi slot-slot
   * sepanjang ini. */
  slotMinutes: 30,

  /* Jarak minimal pemesanan, dalam menit. Slot yang jaraknya kurang dari ini
   * dari waktu sekarang tidak bisa dipilih — supaya klinik punya waktu
   * bersiap. 120 = dua jam. */
  minLeadMinutes: 120,

  /* Paling jauh berapa hari ke depan orang boleh memesan. */
  maxAdvanceDays: 45,

  /* Berapa banyak janji temu yang boleh masuk dalam satu slot yang sama. */
  capacityPerSlot: 1,
} as const;

/* ---------------------------------------------------------------------------
 * 8. PERAN DI KLINIK (KARTU TANPA NAMA)
 * ---------------------------------------------------------------------------
 * ⚠️ JANGAN menambahkan nama dokter, gelar, nomor STRV/SIP, atau sertifikasi
 *    di sini sampai pihak klinik memberikannya sendiri secara tertulis.
 *    Kartu di bawah ini sengaja hanya menyebut peran.
 * ------------------------------------------------------------------------- */
export const TEAM_SLOTS: { role: string; note: string }[] = [
  {
    role: "Dokter Hewan",
    note: "Nama dan nomor registrasi menunggu konfirmasi klinik.",
  },
  {
    role: "Paramedis Veteriner",
    note: "Nama menunggu konfirmasi klinik.",
  },
  {
    role: "Resepsionis",
    note: "Nama menunggu konfirmasi klinik.",
  },
];

/* ---------------------------------------------------------------------------
 * 9. ALAMAT SITUS
 * ---------------------------------------------------------------------------
 * Dipakai untuk metadata, sitemap, robots, dan structured data.
 * Ganti kalau domainnya pindah.
 * ------------------------------------------------------------------------- */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://santi-vet-care.onyxcreative.asia";

/* ------------------------------------------------------------------ helpers */

export const ENABLED_SERVICES = SERVICES.filter((s) => s.enabled);
export const ENABLED_SPECIES = SPECIES.filter((s) => s.enabled);

export const DAY_NAMES_ID = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
] as const;

export function fullAddress(): string {
  const a = CLINIC.address;
  return `${a.street}, ${a.area}, ${a.city}, ${a.province} ${a.postalCode}`;
}

/** Layanan yang berlaku untuk satu jenis hewan. Layanan dengan `species`
 *  kosong berlaku untuk semua jenis hewan yang aktif. */
export function servicesForSpecies(speciesId: string | null): Service[] {
  if (!speciesId) return ENABLED_SERVICES;
  return ENABLED_SERVICES.filter(
    (s) => s.species.length === 0 || s.species.includes(speciesId),
  );
}
