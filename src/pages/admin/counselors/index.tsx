import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Pagination } from "@/components/common/pagination";
import { StatusBadge } from "@/components/common/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { adminApi } from "@/services/adminApi";
import { getErrorMessage } from "@/services/api";
import { useFetch } from "@/hooks/use-fetch";
import { formatDate } from "@/lib/format";

export default function AdminCounselorsPage() {
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, loading, error, refetch } = useFetch(
    () => adminApi.listUsers({ role: "counselor", per_page: 10 }),
    [page],
  );

  const handleToggleActive = async (id: number) => {
    setBusyId(id);
    setActionError(null);
    try {
      await adminApi.toggleActive(id);
      refetch();
    } catch (toggleError) {
      setActionError(getErrorMessage(toggleError));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete counselor ${name}? This cannot be undone.`)) return;
    setActionError(null);
    try {
      await adminApi.deleteUser(id);
      refetch();
    } catch (deleteError) {
      setActionError(getErrorMessage(deleteError));
    }
  };

  return (
    <div>
      <PageHeader
        title="Counselors"
        subtitle="Manage the counseling team."
        actions={
          <span className="text-xs text-gray-400">
            {"Add counselors from the Users page by updating a user's role."}
          </span>
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
              icon={<Icon name="users" className="size-10" />}
              title="No counselors yet"
              description="Promote a user to the counselor role from the Users page."
            />
          ) : (
            <>
              <ul className="divide-y divide-gray-100">
                {data.data.map((counselor) => (
                  <li key={counselor.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={counselor.name} src={counselor.avatar} size="md" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{counselor.name}</p>
                        <p className="truncate text-xs text-gray-500">{counselor.email}</p>
                        <p className="text-xs text-gray-400">Joined {formatDate(counselor.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge value={counselor.is_active ? "active" : "inactive"} />
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={busyId === counselor.id}
                        onClick={() => handleToggleActive(counselor.id)}
                      >
                        {counselor.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(counselor.id, counselor.name)}>
                        Delete
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
    </div>
  );
}