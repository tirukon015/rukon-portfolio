import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  verifyAdminSession,
  ADMIN_COOKIE_NAME,
  listAccessRequests,
  getAccessAuditLogs,
} from "@/lib/access/service";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";

export const metadata: Metadata = {
  title: "Access Management | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminAccessRequestsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = verifyAdminSession(token);

  if (!isAuthenticated) {
    return <AdminLoginForm />;
  }

  const requests = listAccessRequests();
  const logs = getAccessAuditLogs();

  return <AdminDashboardView initialRequests={requests} initialLogs={logs} />;
}
