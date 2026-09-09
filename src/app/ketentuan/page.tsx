import type { Metadata } from "next";
import { CLINIC } from "@/data/clinic";
import { Section, SectionHeader } from "@/components/Section";
import { Prose } from "@/components/Prose";
import { LinkPlate } from "@/components/Actions";

export const metadata: Metadata = {
  title: "Ketentuan Layanan",
  description:
    "Ketentuan penggunaan situs Santi Vet Care, termasuk status permintaan janji temu dan batasan isi situs.",
  alternates: { canonical: "/ketentuan" },
};

export default function TermsPage() {
  return (
    <Section className="pt-12 sm:pt-16">
      <div className="shell">
        <SectionHeader
          as="h1"
          label="Legal"
          headline="Ketentuan Layanan"
          description="Halaman ini menjelaskan ketentuan penggunaan situs ini dan batas dari apa yang situs ini lakukan."
          loose
          cta={<LinkPlate href="/privasi" weight="outline">Kebijakan Privasi</LinkPlate>}
        />

        <div className="mt-12">
          <Prose>
            <p className="!text-ink-3 !text-sm">
              Terakhir diperbarui: 8 September 2026.
            </p>

            <h2>Tentang situs ini</h2>
            <p>
              Situs ini adalah informasi umum mengenai {CLINIC.name} dan sarana
              untuk menghubungi klinik. Dengan menggunakan situs ini, Anda
              menyetujui ketentuan di halaman ini.
            </p>

            <h2>Situs ini bukan sarana konsultasi medis</h2>
            <p>
              Situs ini tidak memuat saran medis, dosis, jadwal pemberian obat
              atau vaksin, maupun panduan penanganan gejala, dan tidak dapat
              digunakan sebagai pengganti pemeriksaan langsung oleh dokter
              hewan. Daftar keluhan pada formulir janji temu hanya berfungsi
              mengumpulkan keterangan untuk diteruskan ke klinik; daftar
              tersebut bukan alat diagnosis dan tidak menghasilkan penilaian apa
              pun atas kondisi hewan Anda.
            </p>

            <h2>Permintaan janji temu</h2>
            <p>
              Mengirim formulir janji temu berarti mengirim permintaan, bukan
              memesan tempat. Permintaan tersebut sampai kepada klinik melalui
              pesan WhatsApp yang Anda kirim sendiri. Janji temu baru berlaku
              setelah dikonfirmasi oleh pihak klinik.
            </p>
            <p>
              Slot waktu yang tampak tersedia di situs ini dihitung dari jam
              praktek dan dari catatan yang tersimpan di peramban Anda sendiri.
              Karena itu, ketersediaan yang ditampilkan belum tentu sama dengan
              ketersediaan sebenarnya di klinik pada saat yang sama.
            </p>

            <h2>Biaya, pembatalan, dan tindakan medis</h2>
            <p>
              Situs ini tidak menampilkan biaya dan tidak memproses pembayaran
              apa pun. Tidak ada data kartu atau pembayaran yang dikumpulkan di
              situs ini; pembayaran diselesaikan di klinik.
            </p>
            <p>
              Ketentuan mengenai biaya layanan, kebijakan pembatalan dan
              keterlambatan, serta persetujuan tindakan medis ditetapkan dan
              disampaikan oleh pihak klinik, dan belum dimuat di halaman ini.
              Bagian ini akan dilengkapi oleh pihak klinik.
            </p>

            <h2>Ketepatan informasi</h2>
            <p>
              Alamat, nomor telepon, dan jam praktek yang tercantum di situs ini
              dapat berubah. Untuk hal yang menentukan keberangkatan Anda,
              terutama jam praktek pada hari tertentu, sebaiknya dipastikan
              lebih dulu ke klinik.
            </p>

            <h2>Tautan ke luar</h2>
            <p>
              Situs ini memuat tautan ke WhatsApp, Google Maps, dan Instagram.
              Layanan tersebut memiliki ketentuannya sendiri, yang berada di
              luar kendali situs ini.
            </p>

            <h2>Hak cipta</h2>
            <p>
              Nama, logo, dan isi yang berkaitan dengan {CLINIC.name} adalah
              milik pihak klinik.
            </p>

            <h2>Perubahan ketentuan</h2>
            <p>
              Ketentuan ini dapat diperbarui sewaktu-waktu. Tanggal pembaruan
              terakhir tercantum di bagian atas halaman ini.
            </p>

            <h2>Pertanyaan</h2>
            <p>
              Pertanyaan mengenai ketentuan ini dapat disampaikan kepada{" "}
              {CLINIC.name} melalui {CLINIC.phoneDisplay}.
            </p>
          </Prose>
        </div>
      </div>
    </Section>
  );
}
