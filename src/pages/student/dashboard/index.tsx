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
import type { StudentDashboard } from "@/types";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const { data, loading, error } = useFetch<StudentDashboard>(() => dashboardApi.getDashboard().then((d) => d as StudentDashboard), []);

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
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name.split(" ")[0] ?? "Student"}</h1>
        <p className="mt-1 text-sm text-gray-500">Here is a quick look at your wellness journey.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Unread notifications"
          value={data.unread_notifications}
          icon={<Icon name="bell" />}
        />
        <StatCard
          label="Upcoming events"
          value={data.upcoming_appointments.length}
          icon={<Icon name="calendar" />}
          tone="text-blue-600"
        />
        <StatCard
          label="Total requests"
          value={data.counseling_requests.length}
          icon={<Icon name="clipboard" />}
          tone="text-amber-600"
        />
        <StatCard
          label="Published resources"
          value={data.recommended_resources.length}
          icon={<Icon name="book" />}
          tone="text-violet-600"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Upcoming events</CardTitle>
            <Link to="/student/appointments" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
              View all
            </Link>
          </CardHeader>
          <CardBody>
            {data.upcoming_appointments.length === 0 ? (
              <EmptyState
                title="No upcoming events"
                description="Once a counselor schedules an event, it will appear here."
                action={
                  <Link to="/student/counseling-request" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
                    Request counseling
                  </Link>
                }
              />
            ) : (
              <ul className="divide-y divide-gray-100">
                {data.upcoming_appointments.map((appointment) => (
                  <li key={appointment.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {appointment.counselor?.name ?? "Counselor"}
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
          <CardHeader>
            <CardTitle>Recommended resources</CardTitle>
          </CardHeader>
          <CardBody>
            {data.recommended_resources.length === 0 ? (
              <p className="text-sm text-gray-500">No resources yet.</p>
            ) : (
              <ul className="space-y-3">
                {data.recommended_resources.map((resource) => (
                  <li key={resource.id} className="rounded-md border border-gray-100 p-3">
                    <p className="text-sm font-medium text-gray-900">{resource.title}</p>
                    <p className="text-xs capitalize text-gray-500">{resource.category}</p>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/student/resources" className="mt-3 block text-sm font-medium text-emerald-700 hover:text-emerald-800">
              Browse all resources
            </Link>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Recent counseling requests</CardTitle>
          <Link to="/student/counseling-request" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
            View all
          </Link>
        </CardHeader>
        <CardBody>
          {data.counseling_requests.length === 0 ? (
            <EmptyState
              title="No counseling requests yet"
              description="Reaching out is the first step. Create a request whenever you are ready."
              action={
                <Link to="/student/counseling-request" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
                  Create a request
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.counseling_requests.map((request) => (
                <li key={request.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{request.category}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(request.created_at)}</p>
                  </div>
                  <StatusBadge value={request.status} />
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}