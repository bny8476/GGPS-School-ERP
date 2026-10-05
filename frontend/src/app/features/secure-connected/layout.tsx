import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GGPS School | Secure & Connected School ERP",
  description:
    "Connect administrators, teachers, and parents with secure role-based access and real-time communication.",
};

export default function SecureConnectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
