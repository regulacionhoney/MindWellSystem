import { useMemo, useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Pagination } from "@/components/common/pagination";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { AppointmentForm } from "@/components/features/appointment/appointment-form";
import { appointmentApi } from "@/services/appointmentApi";
import { counselingApi } from "@/services/counselingApi";
import { getErrorMessage } from "@/services/api";
import { useFetch } from "@/hooks/use-fetch";
import { formatDateTime } from "@/lib/format";
import { APPOINTMENT_STATUSES } from "@/types";
import type { AppointmentStatus } from "@/types";

type Filter = AppointmentStatus | "all";

export default function CounselorAppointmentsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<Filter>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, loading, error, refetch } = useFetch(
    () => appointmentApi.listAppointments({ status: filter, per_page: 10 }),
    [page, filter],
  );

  const { data: approvedRequests } = useFetch(
    () => counselingApi.listRequests({ status: "approved", per_page: 100 }),
    [],
  );

  const students = useMemo(() => {
    const map = new Map<number, string>();
    for (const request of approvedRequests?.data ?? []) {
      if (request.user) map.set(request.user.id, request.user.name);
    }
    return Array.from(map, ([id, name]) => ({ id, label: name }));
  }, [approvedRequests]);

  const requestOptions = useMemo(
    () =>
      (approvedRequests?.data ?? []).map((request) => ({
        id: request.id,
        label: `${request.category} — ${request.user?.name ?? `Student #${request.user_id}`}`,
      })),
    [approvedRequests],
  );

  const handleCreate = async (values: {
    student_id: number;
    request_id?: number;
    scheduled_at: string;
    duration_minutes: number;
    notes?: string;
  }) => {
    setSubmitting(true);
    setActionError(null);
    try {
      await appointmentApi.createAppointment(values);
      setCreateOpen(false);
      refetch();
    } catch (createError) {
      setActionError(getErrorMessage(createError));
    } finally {
      setSubmitting(false);
    }
  };

  const runAction = async (id: number, action: (appointmentId: number) => Promise<unknown>) => {
    setBusyId(id);
    setActionError(null);
    try {
      await action(id);
      refetch();
    } catch (updateError) {
      setActionError(getErrorMessage(updateError));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle="Manage sessions with students."
        actions={
          <>
            <Select value={filter} onChange={(e) => { setFilter(e.target.value as Filter); setPage(1); }}>
              <option value="all">All statuses</option>
              {APPOINTMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status[0]?.toUpperCase().concat(status.slice(1))}
                </option>
              ))}
            </Select>
            <Button onClick={() => setCreateOpen(true)}>
              <Icon name="plus" className="size-4" />
              Schedule
            </Button>
          </>
        }
      />

      {actionError && <p className="mb-4 text-sm text-red-600">{actionError}</p>}

      <Card className="shadow-md ring-1 ring-gray-100">
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
              title="No appointments found"
              description="Schedule a session with a student who has an approved request."
              action={
                <Button onClick={() => setCreateOpen(true)}>
                  <Icon name="plus" className="size-4" />
                  Schedule appointment
                </Button>
              }
            />
          ) : (
            <>
              <ul className="space-y-3">
                {data.data.map((appointment) => (
                  <li
                    key={appointment.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {appointment.student?.name ?? `Student #${appointment.student_id}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(appointment.scheduled_at)} · {appointment.duration_minutes} minutes
                      </p>
                      {appointment.notes && <p className="mt-1 text-xs text-gray-500">{appointment.notes}</p>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge value={appointment.status} />
                      {appointment.status === "pending" && (
                        <Button size="sm" loading={busyId === appointment.id} onClick={() => runAction(appointment.id, appointmentApi.confirmAppointment)}>
                          Confirm
                        </Button>
                      )}
                      {appointment.status === "confirmed" && (
                        <>
                          <Button size="sm" loading={busyId === appointment.id} onClick={() => runAction(appointment.id, appointmentApi.completeAppointment)}>
                            Complete
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => runAction(appointment.id, appointmentApi.cancelAppointment)}>
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <Pagination page={page} lastPage={data.last_page} total={data.total} onPageChange={setPage} />
            </>
          )}
        </CardBody>
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Schedule Appointment">
        {actionError && <p className="mb-3 text-sm text-red-600">{actionError}</p>}
        <AppointmentForm
          students={students}
          requests={requestOptions}
          onSubmit={handleCreate}
          submitting={submitting}
        />
      </Modal>
    </div>
  );
}