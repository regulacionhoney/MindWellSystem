import { Card, CardBody } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { StatCard } from "@/components/common/stat-card";
import { useFetch } from "@/hooks/use-fetch";
import { dashboardApi } from "@/services/dashboardApi";
import type { AdminDashboard } from "@/types";

export default function AdminDashboardPage() {
  const { data, loading, error } = useFetch<AdminDashboard>(() => dashboardApi.getDashboard().then((d) => d as AdminDashboard), []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="size-8 text-emerald-700" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-red-600">{error ?? "Unable to load dashboard."}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="mt-1 text-sm text-gray-500">A summary of MindWell activity across the platform.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total users" value={data.total_users} icon={<Icon name="users" />} />
        <StatCard label="Counseling requests" value={data.total_counseling_requests} icon={<Icon name="clipboard" />} tone="text-amber-600" />
        <StatCard label="Pending requests" value={data.pending_counseling_requests} icon={<Icon name="warning" />} tone="text-red-600" />
        <StatCard label="Total appointments" value={data.total_appointments} icon={<Icon name="calendar" />} tone="text-blue-600" />
        <StatCard label="Upcoming appointments" value={data.upcoming_appointments} icon={<Icon name="calendar-plus" />} tone="text-violet-600" />
        <StatCard label="Wellness resources" value={data.total_wellness_resources} icon={<Icon name="book" />} tone="text-emerald-600" />
      </div>
    </div>
  );
}