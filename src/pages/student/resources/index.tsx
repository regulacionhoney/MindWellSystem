import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Pagination } from "@/components/common/pagination";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useFetch } from "@/hooks/use-fetch";
import { resourceApi } from "@/services/resourceApi";
import { formatDateTime } from "@/lib/format";
import { RESOURCE_CATEGORIES } from "@/types";
import type { ResourceCategory, WellnessResource } from "@/types";

type Filter = ResourceCategory | "all";

export default function StudentResourcesPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selected, setSelected] = useState<WellnessResource | null>(null);

  const { data, loading, error } = useFetch(
    () => resourceApi.publicList({ category: filter, search: debouncedSearch || undefined, per_page: 9 }),
    [page, filter, debouncedSearch],
  );

  return (
    <div>
      <PageHeader title="Wellness Resources" subtitle="Articles and guides to support your mental well-being." />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
            <Icon name="search" className="size-4" />
          </span>
          <Input
            className="pl-9"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              window.setTimeout(() => setDebouncedSearch(e.target.value.trim()), 400);
            }}
          />
        </div>
        <Select
          className="sm:w-56"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value as Filter);
            setPage(1);
          }}
        >
          <option value="all">All categories</option>
          {RESOURCE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category[0]?.toUpperCase().concat(category.slice(1))}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="size-8 text-emerald-700" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : !data || data.data.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<Icon name="book" className="size-10" />}
              title="No resources found"
              description="Try adjusting your search or check back later."
            />
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.data.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} onOpen={() => setSelected(resource)} />
            ))}
          </div>
          <Pagination className="mt-6" page={page} lastPage={data.last_page} total={data.total} onPageChange={setPage} />
        </>
      )}

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.title ?? "Resource"}
      >
        {selected && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <StatusBadge value={selected.category} />
              <span className="text-xs text-gray-400">{formatDateTime(selected.created_at)}</span>
            </div>
            {selected.image_url && (
              <img
                src={selected.image_url}
                alt={selected.title}
                className="mb-4 h-44 w-full rounded-md object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <p className="text-sm whitespace-pre-wrap text-gray-700">{selected.content}</p>
            {selected.author && <p className="mt-4 text-xs text-gray-400">By {selected.author}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}

function ResourceCard({ resource, onOpen }: { resource: WellnessResource; onOpen: () => void }) {
  return (
    <Card className="flex flex-col">
      {resource.image_url && (
        <img
          src={resource.image_url}
          alt={resource.title}
          className="h-36 w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      <CardHeader className="flex-1">
        <CardTitle className="line-clamp-2">{resource.title}</CardTitle>
        <div className="mt-2 flex items-center justify-between">
          <StatusBadge value={resource.category} />
          <Button variant="tertiary" size="sm" onClick={onOpen}>
            Read
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}