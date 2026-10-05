import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GGPS School | Performance & Rubrics",
  description:
    "Track student development, teacher assessments, rubrics, learning outcomes, and automated report cards with GGPS School ERP.",
};

export default function PerformanceRubricsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
