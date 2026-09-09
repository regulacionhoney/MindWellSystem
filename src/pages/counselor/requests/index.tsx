import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Pagination } from "@/components/common/pagination";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { counselingApi } from "@/services/counselingApi";
import { getErrorMessage } from "@/services/api";
import { useFetch } from "@/hooks/use-fetch";
import { formatDateTime } from "@/lib/format";
import type { CounselingRequest, CounselingRequestStatus } from "@/types";

export default function CounselorRequestsPage() {
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const { data, loading, error, refetch } = useFetch(
    () => counselingApi.listRequests({ per_page: 10 }),
    [page],
  );
  const handlePageChange = (next: number) => setPage(next);

  const handleReview = async (request: CounselingRequest, status: CounselingRequestStatus) => {
    setBusyId(request.id);
    setActionError(null);
    try {
      await counselingApi.reviewRequest(request.id, status);
      refetch();
      if (status === "approved") setExpandedId(null);
    } catch (reviewError) {
      setActionError(getErrorMessage(reviewError));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Counseling Requests"
        subtitle="Review incoming requests from students and respond."
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
              title="No requests to review"
              description="New counseling requests will show up here."
            />
          ) : (
            <>
              <ul className="divide-y divide-gray-100">
                {data.data.map((request) => (
                  <li key={request.id} className="py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{request.category}</p>
                        <p className="text-xs text-gray-500">
                          {request.user?.name ?? `Student #${request.user_id}`} · {formatDateTime(request.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge value={request.urgency} />
                        <StatusBadge value={request.status} />
                        <Button variant="secondary" size="sm" onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}>
                          {expandedId === request.id ? "Hide" : "Review"}
                        </Button>
                      </div>
                    </div>

                    {expandedId === request.id && (
                      <div className="mt-3 rounded-md bg-gray-50 p-3">
                        <p className="text-sm whitespace-pre-wrap text-gray-700">{request.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            loading={busyId === request.id}
                            onClick={() => handleReview(request, "approved")}
                          >
                            Approve
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => handleReview(request, "reviewed")}>
                            Mark reviewed
                          </Button>
                          {request.status !== "closed" && (
                            <Button variant="danger" size="sm" onClick={() => handleReview(request, "closed")}>
                              Close
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
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