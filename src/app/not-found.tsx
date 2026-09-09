import { Section, SectionHeader } from "@/components/Section";
import { LinkPlate } from "@/components/Actions";
import { CLINIC } from "@/data/clinic";

export default function NotFound() {
  return (
    <Section className="pt-16">
      <div className="shell">
        <SectionHeader
          as="h1"
          label="404"
          headline="Halaman ini tidak ditemukan"
          description={`Tautannya mungkin sudah berubah. Kalau Anda sedang mencari cara menghubungi ${CLINIC.name}, gunakan tombol di bawah.`}
          loose
          cta={
            <>
              <LinkPlate href="/" weight="primary">Kembali ke beranda</LinkPlate>
              <LinkPlate href="/kontak" weight="outline">Halaman kontak</LinkPlate>
            </>
          }
        />
      </div>
    </Section>
  );
}
