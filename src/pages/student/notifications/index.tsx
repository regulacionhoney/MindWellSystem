import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Pagination } from "@/components/common/pagination";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { notificationApi } from "@/services/notificationApi";
import { getErrorMessage } from "@/services/api";
import { useFetch } from "@/hooks/use-fetch";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { AppNotification } from "@/types";

export default function StudentNotificationsPage() {
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, loading, error, refetch } = useFetch(
    () => notificationApi.listNotifications({ per_page: 10 }),
    [page],
  );

  const handleMarkRead = async (notification: AppNotification) => {
    if (notification.is_read) return;
    try {
      await notificationApi.markAsRead(notification.id);
      refetch();
    } catch (markError) {
      setActionError(getErrorMessage(markError));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      refetch();
    } catch (markError) {
      setActionError(getErrorMessage(markError));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationApi.deleteNotification(id);
      refetch();
    } catch (deleteError) {
      setActionError(getErrorMessage(deleteError));
    }
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Updates about your counseling requests and appointments."
        actions={
          <Button variant="secondary" onClick={handleMarkAllRead}>
            Mark all as read
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
              icon={<Icon name="bell" className="size-10" />}
              title="No notifications"
              description="You are all caught up."
            />
          ) : (
            <>
              <ul className="divide-y divide-gray-100">
                {data.data.map((notification) => (
                  <li
                    key={notification.id}
                    className={cn(
                      "flex items-start justify-between gap-3 py-4",
                      !notification.is_read && "rounded-md bg-emerald-50/60 px-3",
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                        {!notification.is_read && (
                          <span className="size-2 shrink-0 rounded-full bg-emerald-600" aria-label="Unread" />
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-gray-600">{notification.message}</p>
                      <p className="mt-1 text-xs text-gray-400">{timeAgo(notification.created_at)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {!notification.is_read && (
                        <Button variant="tertiary" size="sm" onClick={() => handleMarkRead(notification)}>
                          Mark read
                        </Button>
                      )}
                      <Button
                        variant="tertiary"
                        size="sm"
                        aria-label="Delete notification"
                        onClick={() => handleDelete(notification.id)}
                      >
                        <Icon name="x" className="size-4" />
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