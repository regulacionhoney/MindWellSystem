import { Link } from "react-router";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { useAuth } from "@/context/AuthContext";
import { useFetch } from "@/hooks/use-fetch";
import { dashboardApi } from "@/services/dashboardApi";
import { formatDateTime } from "@/lib/format";
import type { CounselorDashboard } from "@/types";

export default function CounselorDashboardPage() {
  const { user } = useAuth();
  const { data, loading, error } = useFetch<CounselorDashboard>(() => dashboardApi.getDashboard().then((d) => d as CounselorDashboard), []);

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
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name ?? "Counselor"}</h1>
        <p className="mt-1 text-sm text-gray-500">Here is what needs your attention today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending requests" value={data.pending_requests.length} icon={<Icon name="clipboard" />} tone="text-amber-600" />
        <StatCard label="Total appointments" value={data.total_appointments} icon={<Icon name="calendar" />} tone="text-blue-600" />
        <StatCard label="Counseling records" value={data.total_records} icon={<Icon name="file" />} tone="text-violet-600" />
        <StatCard label="Unread messages" value={data.unread_messages} icon={<Icon name="message" />} tone="text-red-600" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Upcoming appointments</CardTitle>
            <Link to="/counselor/appointments" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
              View all
            </Link>
          </CardHeader>
          <CardBody>
            {data.upcoming_appointments.length === 0 ? (
              <EmptyState
                title="No upcoming appointments"
                description="Scheduled sessions with students will appear here."
                action={
                  <Link to="/counselor/appointments" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
                    Schedule appointment
                  </Link>
                }
              />
            ) : (
              <ul className="divide-y divide-gray-100">
                {data.upcoming_appointments.map((appointment) => (
                  <li key={appointment.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {appointment.student?.name ?? `Student #${appointment.student_id}`}
                      </p>
                      <p className="text-xs text-gray-500">{formatDateTime(appointment.scheduled_at)} · {appointment.duration_minutes} min</p>
                    </div>
                    <StatusBadge value={appointment.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Pending counseling requests</CardTitle>
            <Link to="/counselor/requests" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
              Review
            </Link>
          </CardHeader>
          <CardBody>
            {data.pending_requests.length === 0 ? (
              <EmptyState title="No pending requests" description="All requests have been reviewed." />
            ) : (
              <ul className="divide-y divide-gray-100">
                {data.pending_requests.map((request) => (
                  <li key={request.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{request.category}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(request.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge value={request.urgency} />
                      <StatusBadge value={request.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}