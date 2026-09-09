import type { Metadata } from "next";
import { AdminBoard } from "@/components/AdminBoard";

/* Excluded from the sitemap and marked noindex. This is a demonstration
   surface, not a page anyone should find in search results. */
export const metadata: Metadata = {
  title: "Admin (Demo)",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: "/admin" },
};

export default function AdminPage() {
  return <AdminBoard />;
}
