import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function DashboardAdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
