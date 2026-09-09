import { useMemo, useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Tag } from "@/components/ui/tag";
import { recordApi } from "@/services/recordApi";
import { useFetch } from "@/hooks/use-fetch";
import { formatDate, todaysDateValue } from "@/lib/format";

export default function CounselorFollowUpsPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data, loading, error } = useFetch(() => recordApi.listRecords({ per_page: 100 }), []);

  const followUps = useMemo(() => {
    const today = new Date(todaysDateValue()).getTime();
    return (data?.data ?? [])
      .filter((record) => record.follow_up_date)
      .map((record) => ({
        record,
        date: record.follow_up_date as string,
        isOverdue: new Date(record.follow_up_date as string).getTime() < today,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  return (
    <div>
      <PageHeader
        title="Follow-Ups"
        subtitle="Students with scheduled follow-up dates from your session records."
      />

      <Card>
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner className="size-7 text-emerald-700" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : followUps.length === 0 ? (
            <EmptyState
              icon={<Icon name="follow-up" className="size-10" />}
              title="No follow-ups scheduled"
              description="Set a follow-up date when writing a counseling record and it will appear here."
            />
          ) : (
            <ul className="divide-y divide-gray-100">
              {followUps.map(({ record, date, isOverdue }) => (
                <li key={record.id} className="py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {record.student?.name ?? `Student #${record.student_id}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        Recorded on {formatDate(record.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className={isOverdue ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800"}>
                        {isOverdue ? "Overdue" : "Due"} {formatDate(date)}
                      </Tag>
                      <Button variant="secondary" size="sm" onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}>
                        {expandedId === record.id ? "Hide" : "View notes"}
                      </Button>
                    </div>
                  </div>
                  {expandedId === record.id && (
                    <div className="mt-3 space-y-2 rounded-md bg-gray-50 p-3">
                      {record.follow_up_notes && (
                        <p className="text-sm whitespace-pre-wrap text-gray-700">{record.follow_up_notes}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        <StatusBadge value={record.appointment?.status ?? "unknown"} className="mr-1" />
                        Session: {formatDate(record.appointment?.scheduled_at)}
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}