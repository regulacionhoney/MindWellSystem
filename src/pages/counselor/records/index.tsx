import { useMemo, useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Pagination } from "@/components/common/pagination";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { Tag } from "@/components/ui/tag";
import { RecordForm } from "@/components/features/record/record-form";
import { recordApi } from "@/services/recordApi";
import { appointmentApi } from "@/services/appointmentApi";
import { getErrorMessage } from "@/services/api";
import { useFetch } from "@/hooks/use-fetch";
import { formatDate, formatDateTime } from "@/lib/format";
import type { CounselingRecord } from "@/types";

export default function CounselorRecordsPage() {
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<CounselingRecord | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, loading, error, refetch } = useFetch(
    () => recordApi.listRecords({ per_page: 10 }),
    [page],
  );

  const { data: appointments } = useFetch(() => appointmentApi.listAppointments({ per_page: 100 }), []);

  const completedAppointments = useMemo(
    () => (appointments?.data ?? []).filter((appointment) => appointment.status === "completed"),
    [appointments],
  );

  const handleCreate = async (values: {
    appointment_id: number;
    student_id: number;
    session_notes: string;
    follow_up_notes?: string;
    follow_up_date?: string;
    is_confidential: boolean;
  }) => {
    setSubmitting(true);
    setActionError(null);
    try {
      await recordApi.createRecord(values);
      setCreateOpen(false);
      refetch();
    } catch (createError) {
      setActionError(getErrorMessage(createError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this counseling record?")) return;
    try {
      await recordApi.deleteRecord(id);
      if (selected?.id === id) setSelected(null);
      refetch();
    } catch (deleteError) {
      setActionError(getErrorMessage(deleteError));
    }
  };

  return (
    <div>
      <PageHeader
        title="Counseling Records"
        subtitle="Session notes and confidential records for students."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Icon name="plus" className="size-4" />
            New Record
          </Button>
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
              icon={<Icon name="file" className="size-10" />}
              title="No counseling records yet"
              description="Records are created after completed sessions."
              action={
                <Button onClick={() => setCreateOpen(true)}>
                  <Icon name="plus" className="size-4" />
                  New Record
                </Button>
              }
            />
          ) : (
            <>
              <ul className="divide-y divide-gray-100">
                {data.data.map((record) => (
                  <li key={record.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {record.student?.name ?? `Student #${record.student_id}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        Session on {formatDateTime(record.appointment?.scheduled_at)}
                      </p>
                      {record.follow_up_date && (
                        <p className="mt-1 text-xs text-amber-700">Follow-up due {formatDate(record.follow_up_date)}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {record.is_confidential && <Tag>Confidential</Tag>}
                      <Button variant="secondary" size="sm" onClick={() => setSelected(record)}>
                        View
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
              <Pagination page={page} lastPage={data.last_page} total={data.total} onPageChange={setPage} />
            </>
          )}
        </CardBody>
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Counseling Record">
        {actionError && <p className="mb-3 text-sm text-red-600">{actionError}</p>}
        <RecordForm appointments={completedAppointments} onSubmit={handleCreate} submitting={submitting} />
        {completedAppointments.length === 0 && (
          <p className="mt-3 text-xs text-amber-700">
            You need a completed appointment before you can add a record.
          </p>
        )}
      </Modal>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Counseling Record">
        {selected && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Student</p>
              <p className="text-sm text-gray-900">{selected.student?.name ?? `Student #${selected.student_id}`}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Session notes</p>
              <p className="text-sm whitespace-pre-wrap text-gray-700">{selected.session_notes}</p>
            </div>
            {selected.follow_up_notes && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Follow-up notes</p>
                <p className="text-sm whitespace-pre-wrap text-gray-700">{selected.follow_up_notes}</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              {selected.follow_up_date && <Tag>Follow-up: {formatDate(selected.follow_up_date)}</Tag>}
              {selected.is_confidential && <Tag>Confidential</Tag>}
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
              <Button variant="danger" size="sm" onClick={() => handleDelete(selected.id)}>
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}