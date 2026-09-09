import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { TextArea } from "@/components/ui/textarea";
import { toDateTimeLocalValue } from "@/lib/format";
import type { Appointment } from "@/types";

export type StudentOption = { id: number; label: string };
export type RequestOption = { id: number; label: string };

type AppointmentFormValues = {
  student_id: number;
  request_id?: number;
  scheduled_at: string;
  duration_minutes: number;
  notes?: string;
};

type AppointmentFormProps = {
  students: StudentOption[];
  requests?: RequestOption[];
  initial?: Appointment | null;
  onSubmit: (values: AppointmentFormValues) => Promise<void>;
  submitting?: boolean;
  submitLabel?: string;
};

export function AppointmentForm({
  students,
  requests = [],
  initial,
  onSubmit,
  submitting = false,
  submitLabel = "Schedule Appointment",
}: AppointmentFormProps) {
  const [studentId, setStudentId] = useState<number | undefined>(initial?.student_id ?? undefined);
  const [requestId, setRequestId] = useState<number | undefined>(initial?.request_id ?? undefined);
  const [scheduledAt, setScheduledAt] = useState(initial ? toDateTimeLocalValue(initial.scheduled_at) : "");
  const [duration, setDuration] = useState(initial?.duration_minutes ?? 60);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!studentId) next.student_id = "Select a student.";
    if (!scheduledAt) next.scheduled_at = "Pick a date and time.";
    if (!duration || duration < 15 || duration > 240) next.duration_minutes = "Duration must be 15–240 minutes.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate() || !studentId) return;
    await onSubmit({
      student_id: studentId,
      request_id: requestId || undefined,
      scheduled_at: new Date(scheduledAt).toISOString(),
      duration_minutes: Number(duration),
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="student_id">Student</Label>
        <Select
          id="student_id"
          value={studentId ?? ""}
          error={errors.student_id}
          onChange={(e) => setStudentId(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">Select a student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.label}
            </option>
          ))}
        </Select>
      </div>

      {requests.length > 0 && (
        <div>
          <Label htmlFor="request_id">Linked counseling request (optional)</Label>
          <Select
            id="request_id"
            value={requestId ?? ""}
            onChange={(e) => setRequestId(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">No linked request</option>
            {requests.map((request) => (
              <option key={request.id} value={request.id}>
                {request.label}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="scheduled_at">Date &amp; time</Label>
          <Input
            id="scheduled_at"
            type="datetime-local"
            value={scheduledAt}
            error={errors.scheduled_at}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="duration_minutes">Duration (minutes)</Label>
          <Input
            id="duration_minutes"
            type="number"
            min={15}
            max={240}
            step={15}
            value={duration}
            error={errors.duration_minutes}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <TextArea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      {students.length === 0 && (
        <p className="text-xs text-amber-700">
          No approved counseling requests yet. Students appear here once their request is approved.
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="submit" loading={submitting} disabled={students.length === 0}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}