import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GGPS School | Intelligent School Operations",
  description:
    "Automate admissions, scheduling, staff management, payroll, facilities, and school operations with GGPS School ERP.",
};

export default function IntelligentOperationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
