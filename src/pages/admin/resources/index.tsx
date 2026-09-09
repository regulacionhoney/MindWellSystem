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
import { Tag } from "@/components/ui/tag";
import { ResourceForm } from "@/components/features/resource/resource-form";
import { resourceApi } from "@/services/resourceApi";
import { getErrorMessage } from "@/services/api";
import { useFetch } from "@/hooks/use-fetch";
import { formatDateTime } from "@/lib/format";
import type { WellnessResource } from "@/types";

type ResourceValues = Parameters<typeof resourceApi.createResource>[0];

export default function AdminResourcesPage() {
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<WellnessResource | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, loading, error, refetch } = useFetch(
    () => resourceApi.manageList({ per_page: 10 }),
    [page],
  );

  const closeModal = () => {
    setCreateOpen(false);
    setEditing(null);
    setActionError(null);
  };

  const handleSubmit = async (values: ResourceValues) => {
    setSubmitting(true);
    setActionError(null);
    try {
      if (editing) {
        await resourceApi.updateResource(editing.id, values);
      } else {
        await resourceApi.createResource(values);
      }
      closeModal();
      refetch();
    } catch (submitError) {
      setActionError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (resource: WellnessResource) => {
    if (!window.confirm(`Delete "${resource.title}"?`)) return;
    setActionError(null);
    try {
      await resourceApi.deleteResource(resource.id);
      refetch();
    } catch (deleteError) {
      setActionError(getErrorMessage(deleteError));
    }
  };

  const handlePublish = async (resource: WellnessResource) => {
    setBusyId(resource.id);
    setActionError(null);
    try {
      await resourceApi.updateResource(resource.id, { is_published: !resource.is_published });
      refetch();
    } catch (publishError) {
      setActionError(getErrorMessage(publishError));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Resources"
        subtitle="Create and manage wellness resources for students."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Icon name="plus" className="size-4" />
            New Resource
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
              icon={<Icon name="book" className="size-10" />}
              title="No resources yet"
              description="Create wellness resources to share with students."
              action={
                <Button onClick={() => setCreateOpen(true)}>
                  <Icon name="plus" className="size-4" />
                  New Resource
                </Button>
              }
            />
          ) : (
            <>
              <ul className="divide-y divide-gray-100">
                {data.data.map((resource) => (
                  <li key={resource.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{resource.title}</p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(resource.updated_at)}
                        {resource.author ? ` · By ${resource.author}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge value={resource.category} />
                      <Tag className={resource.is_published ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-500"}>
                        {resource.is_published ? "Published" : "Draft"}
                      </Tag>
                      <Button variant="secondary" size="sm" onClick={() => setEditing(resource)}>
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={busyId === resource.id}
                        onClick={() => handlePublish(resource)}
                      >
                        {resource.is_published ? "Unpublish" : "Publish"}
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(resource)}>
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

      <Modal open={createOpen || Boolean(editing)} onClose={closeModal} title={editing ? "Edit Resource" : "New Resource"}>
        {actionError && <p className="mb-3 text-sm text-red-600">{actionError}</p>}
        <ResourceForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel={editing ? "Save changes" : "Create resource"}
        />
      </Modal>
    </div>
  );
}