import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Pagination } from "@/components/common/pagination";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { appointmentApi } from "@/services/appointmentApi";
import { getErrorMessage } from "@/services/api";
import { useFetch } from "@/hooks/use-fetch";
import { formatDateTime } from "@/lib/format";
import { APPOINTMENT_STATUSES } from "@/types";
import type { AppointmentStatus } from "@/types";

type Filter = AppointmentStatus | "all";

export default function StudentAppointmentsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<Filter>("all");
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const { data, loading, error, refetch } = useFetch(
    () => appointmentApi.listAppointments({ status: filter, per_page: 10 }),
    [page, filter],
  );
  const handlePageChange = (next: number) => setPage(next);

  const handleConfirm = async (id: number) => {
    setBusyId(id);
    setActionError(null);
    try {
      await appointmentApi.confirmAppointment(id);
      refetch();
    } catch (confirmError) {
      setActionError(getErrorMessage(confirmError));
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm("Cancel this event?")) return;
    try {
      await appointmentApi.cancelAppointment(id);
      refetch();
    } catch (cancelError) {
      setActionError(getErrorMessage(cancelError));
    }
  };

  return (
    <div>
      <PageHeader
        title="My Events"
        subtitle="Track your scheduled events."
        actions={
          <Select value={filter} onChange={(e) => { setFilter(e.target.value as Filter); setPage(1); }}>
            <option value="all">All statuses</option>
            {APPOINTMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status[0]?.toUpperCase().concat(status.slice(1))}
              </option>
            ))}
          </Select>
        }
      />

      {actionError && <p className="mb-4 text-sm text-red-600">{actionError}</p>}

      <Card>
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner className="size-7 text-emerald-700" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : !data || data.data.length === 0 ? (
            <EmptyState
              icon={<Icon name="calendar" className="size-10" />}
              title="No events found"
              description="Events appear here once a counselor schedules a session with you."
            />
          ) : (
            <>
              <ul className="divide-y divide-gray-100">
                {data.data.map((appointment) => (
                  <li key={appointment.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {appointment.counselor?.name ?? "Counselor"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(appointment.scheduled_at)} · {appointment.duration_minutes} minutes
                      </p>
                      {appointment.notes && <p className="mt-1 text-xs text-gray-500">{appointment.notes}</p>}
                      {appointment.request && (
                        <p className="mt-1 text-xs text-gray-400">Linked: {appointment.request.category}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge value={appointment.status} />
                      {appointment.status === "pending" && (
                        <>
                          <Button size="sm" loading={busyId === appointment.id} onClick={() => handleConfirm(appointment.id)}>
                            Confirm
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => handleCancel(appointment.id)}>
                            Cancel
                          </Button>
                        </>
                      )}
                      {appointment.status === "confirmed" && (
                        <Button variant="secondary" size="sm" onClick={() => handleCancel(appointment.id)}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <Pagination page={page} lastPage={data.last_page} total={data.total} onPageChange={handlePageChange} />
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}