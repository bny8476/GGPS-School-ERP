import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GGPS School | ERP Feature Suite & Solutions",
  description: "Explore the core features of GGPS School ERP: Intelligent Operations, Holistic Performance & Rubrics, and Secure & Connected Portals.",
};

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
