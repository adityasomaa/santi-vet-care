import type { Metadata } from "next";
import { CLINIC, SITE_URL } from "@/data/clinic";
import { Section, SectionHeader } from "@/components/Section";
import { Prose } from "@/components/Prose";
import { LinkPlate } from "@/components/Actions";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Kebijakan privasi situs Santi Vet Care: data apa yang dikumpulkan, ke mana perginya, dan apa yang disimpan di peramban Anda.",
  alternates: { canonical: "/privasi" },
};

export default function PrivacyPage() {
  return (
    <Section className="pt-12 sm:pt-16">
      <div className="shell">
        <SectionHeader
          as="h1"
          label="Legal"
          headline="Kebijakan Privasi"
          description="Halaman ini menjelaskan data apa yang diproses situs ini dan ke mana data itu pergi."
          loose
          cta={<LinkPlate href="/ketentuan" weight="outline">Ketentuan Layanan</LinkPlate>}
        />

        <div className="mt-12">
          <Prose>
            <p className="!text-ink-3 !text-sm">
              Terakhir diperbarui: 8 September 2026.
            </p>

            <h2>Ringkasnya</h2>
            <p>
              Situs ini tidak memiliki basis data. Isian formulir janji temu
              tidak dikirim ke server kami untuk disimpan; isian tersebut
              dirangkai menjadi pesan WhatsApp yang Anda kirim sendiri ke
              klinik, dan salinannya disimpan di peramban Anda sendiri apabila
              Anda mengizinkannya.
            </p>

            <h2>Data yang Anda isi sendiri</h2>
            <p>
              Formulir janji temu menanyakan nama pemilik, nomor WhatsApp, jenis
              dan nama hewan, perkiraan umur, jenis layanan, keluhan yang Anda
              centang, keterangan tambahan, serta tanggal dan waktu kunjungan.
            </p>
            <p>Isian tersebut digunakan untuk dua hal:</p>
            <ul>
              <li>
                Menyusun pesan WhatsApp berisi seluruh isian, yang Anda kirim
                sendiri ke nomor klinik. Setelah pesan terkirim, isinya berada
                di akun WhatsApp Anda dan akun WhatsApp klinik, dan tunduk pada
                kebijakan privasi WhatsApp.
              </li>
              <li>
                Menyimpan catatan janji temu di peramban Anda, apabila Anda
                mengaktifkan penyimpanan preferensi. Catatan ini tidak pernah
                meninggalkan perangkat Anda.
              </li>
            </ul>
            <p>
              Isian juga dikirim sekali ke alamat {SITE_URL}/api/bookings untuk
              diperiksa kelengkapannya. Pemeriksaan itu tidak menyimpan apa pun;
              hasilnya hanya berupa keterangan valid atau tidak valid.
            </p>

            <h2>Penyimpanan di peramban Anda</h2>
            <p>
              Situs ini tidak memasang cookie pelacak. Yang digunakan adalah
              penyimpanan lokal peramban, dengan tiga kategori:
            </p>
            <ul>
              <li>
                <strong>Diperlukan.</strong> Menyimpan pilihan Anda pada kotak
                persetujuan. Tanpa ini, kotak tersebut akan muncul terus.
              </li>
              <li>
                <strong>Preferensi.</strong> Menyimpan janji temu yang Anda buat
                di peramban ini, sehingga slot yang sudah dipesan tetap terkunci
                setelah halaman dimuat ulang. Dapat Anda tolak; situs tetap
                berfungsi penuh.
              </li>
              <li>
                <strong>Analitik.</strong> Mengizinkan pemuatan skrip analitik.
                Saat ini belum ada penyedia analitik yang dipasang di situs ini.
              </li>
            </ul>
            <p>
              Anda dapat mengubah pilihan tersebut kapan saja dengan menghapus
              data situs ini di pengaturan peramban Anda, yang akan memunculkan
              kembali kotak persetujuan.
            </p>

            <h2>Layanan pihak ketiga</h2>
            <ul>
              <li>
                <strong>WhatsApp.</strong> Tombol WhatsApp membuka aplikasi atau
                situs WhatsApp. Percakapan Anda dengan klinik tunduk pada
                kebijakan privasi WhatsApp.
              </li>
              <li>
                <strong>Google Maps.</strong> Halaman Lokasi memuat peta dari
                Google. Memuat peta tersebut berarti peramban Anda menghubungi
                server Google, yang dapat mencatat alamat IP Anda sesuai
                kebijakan privasi Google.
              </li>
              <li>
                <strong>Vercel.</strong> Situs ini di-hosting di Vercel, yang
                mencatat permintaan server sebagaimana lazimnya layanan hosting.
              </li>
            </ul>
            <p>
              Huruf yang dipakai situs ini disimpan di server situs ini sendiri,
              bukan ditarik dari jaringan pihak ketiga.
            </p>

            <h2>Anak-anak</h2>
            <p>
              Situs ini tidak ditujukan untuk anak-anak dan tidak mengumpulkan
              data dari mereka secara sengaja.
            </p>

            <h2>Pertanyaan</h2>
            <p>
              Pertanyaan mengenai kebijakan ini dapat disampaikan kepada{" "}
              {CLINIC.name} melalui {CLINIC.phoneDisplay}.
            </p>
          </Prose>
        </div>
      </div>
    </Section>
  );
}
