import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { StatCard } from "@/components/common/stat-card";
import { useAuth } from "@/context/AuthContext";
import { useFetch } from "@/hooks/use-fetch";
import { adminApi } from "@/services/adminApi";
import { formatDateTime } from "@/lib/format";

export default function AdminReportsPage() {
  const { user } = useAuth();
  const { data, loading, error } = useFetch(() => adminApi.stats(), []);

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
          <p className="text-sm text-red-600">{error ?? "Unable to load reports."}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Platform statistics as of {formatDateTime(new Date().toISOString())}.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total users" value={data.total_users} icon={<Icon name="users" />} />
          <StatCard label="Students" value={data.total_students} icon={<Icon name="user" />} />
          <StatCard label="Counselors" value={data.total_counselors} icon={<Icon name="users" />} tone="text-blue-600" />
          <StatCard label="Admins" value={data.total_admins} icon={<Icon name="user" />} tone="text-violet-600" />
        </CardBody>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Counseling</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total requests" value={data.total_counseling_requests} icon={<Icon name="clipboard" />} />
          <StatCard label="Pending requests" value={data.pending_counseling_requests} icon={<Icon name="warning" />} tone="text-amber-600" />
          <StatCard label="Total appointments" value={data.total_appointments} icon={<Icon name="calendar" />} tone="text-blue-600" />
          <StatCard label="Upcoming" value={data.upcoming_appointments} icon={<Icon name="calendar-plus" />} tone="text-violet-600" />
        </CardBody>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Records & Content</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Records" value={data.total_counseling_records} icon={<Icon name="file" />} tone="text-emerald-600" />
          <StatCard label="Resources" value={data.total_wellness_resources} icon={<Icon name="book" />} tone="text-emerald-600" />
          <StatCard label="Published" value={data.published_wellness_resources} icon={<Icon name="check" />} tone="text-emerald-600" />
          <StatCard label="Messages" value={data.total_messages} icon={<Icon name="message" />} tone="text-red-600" />
        </CardBody>
      </Card>

      <p className="text-xs text-gray-400">
        Generated report for {user?.name}. Export features are not yet available.
      </p>
    </div>
  );
}