import type { Metadata } from "next";
import { Suspense } from "react";
import { Section, SectionHeader } from "@/components/Section";
import { BookingForm } from "@/components/BookingForm";
import { OpenStatusPlate } from "@/components/OpenStatus";
import { LinkPlate } from "@/components/Actions";

export const metadata: Metadata = {
  title: "Janji Temu",
  description:
    "Buat janji temu di Santi Vet Care Denpasar. Isi keterangan hewan Anda dan pilih waktu kunjungan; keterangannya langsung terkirim ke WhatsApp klinik.",
  alternates: { canonical: "/janji-temu" },
};

export default function AppointmentPage() {
  return (
    <>
      <Section className="pt-12 pb-8 sm:pt-16">
        <div className="shell">
          <SectionHeader
            as="h1"
            label="Janji temu"
            headline="Buat janji temu"
            description="Isi keterangan hewan Anda, centang keluhan yang Anda amati, lalu pilih tanggal dan waktu. Semua isian dikirim ke WhatsApp klinik dalam satu pesan, supaya klinik tidak perlu bertanya ulang."
            loose
            cta={<LinkPlate href="/layanan" weight="outline">Lihat daftar layanan</LinkPlate>}
          />
          <div className="mt-8">
            <OpenStatusPlate size="sm" />
          </div>
        </div>
      </Section>

      <Section className="!pt-0 pb-20">
        <div className="shell max-w-[52rem]">
          {/* useSearchParams inside the form needs a Suspense boundary so the
              page can still be statically prerendered. */}
          <Suspense
            fallback={
              <p className="plate bg-paper-2 p-6 text-[0.9375rem] text-ink-2">
                Memuat formulir…
              </p>
            }
          >
            <BookingForm />
          </Suspense>
        </div>
      </Section>
    </>
  );
}
