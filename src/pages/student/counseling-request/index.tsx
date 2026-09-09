import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Pagination } from "@/components/common/pagination";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { RequestForm } from "@/components/features/counseling-request/request-form";
import { counselingApi } from "@/services/counselingApi";
import { getErrorMessage } from "@/services/api";
import { useFetch } from "@/hooks/use-fetch";
import { formatDateTime } from "@/lib/format";
import type { CounselingRequest } from "@/types";

export default function StudentCounselingRequestPage() {
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, loading, error, refetch } = useFetch(
    () => counselingApi.listRequests({ per_page: 10 }),
    [page],
  );

  const handleCreate = async (values: {
    category: string;
    description: string;
    urgency: "low" | "medium" | "high" | "urgent";
  }) => {
    setSubmitting(true);
    setActionError(null);
    try {
      await counselingApi.createRequest(values);
      setCreateOpen(false);
      if (page !== 1) setPage(1);
      else refetch();
    } catch (createError) {
      setActionError(getErrorMessage(createError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this counseling request?")) return;
    try {
      await counselingApi.deleteRequest(id);
      refetch();
    } catch (deleteError) {
      setActionError(getErrorMessage(deleteError));
    }
  };

  return (
    <div>
      <PageHeader
        title="Students Counseling Requests"
        subtitle="Submit a request and a counselor will reach out to you."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Icon name="plus" className="size-4" />
            New Request
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
              icon={<Icon name="clipboard" className="size-10" />}
              title="No counseling requests yet"
              description="When you are ready, submit a request to start a conversation with a counselor."
              action={
                <Button onClick={() => setCreateOpen(true)}>
                  <Icon name="plus" className="size-4" />
                  New Request
                </Button>
              }
            />
          ) : (
            <>
              <ul className="divide-y divide-gray-100">
                {data.data.map((request) => (
                  <RequestRow key={request.id} request={request} onDelete={() => handleDelete(request.id)} />
                ))}
              </ul>
              <Pagination page={page} lastPage={data.last_page} total={data.total} onPageChange={setPage} />
            </>
          )}
        </CardBody>
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Counseling Request">
        {actionError && <p className="mb-3 text-sm text-red-600">{actionError}</p>}
        <RequestForm onSubmit={handleCreate} submitting={submitting} />
      </Modal>
    </div>
  );
}

function RequestRow({ request, onDelete }: { request: CounselingRequest; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <li className="py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">{request.category}</p>
          <p className="text-xs text-gray-500">{formatDateTime(request.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge value={request.urgency} />
          <StatusBadge value={request.status} />
        </div>
      </div>
      {expanded && (
        <div className="mt-3 rounded-md bg-gray-50 p-3">
          <p className="text-sm whitespace-pre-wrap text-gray-700">{request.description}</p>
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setExpanded(false)}>
              Close
            </Button>
            <Button variant="danger" size="sm" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>
      )}
      {!expanded && (
        <Button variant="tertiary" size="sm" className="mt-2" onClick={() => setExpanded(true)}>
          View details
        </Button>
      )}
    </li>
  );
}