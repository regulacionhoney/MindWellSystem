import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { TextArea } from "@/components/ui/textarea";
import { formatDateTime, todaysDateValue } from "@/lib/format";
import type { Appointment, CounselingRecord } from "@/types";

type RecordFormValues = {
  appointment_id: number;
  student_id: number;
  session_notes: string;
  follow_up_notes?: string;
  follow_up_date?: string;
  is_confidential: boolean;
};

type RecordFormProps = {
  appointments: Appointment[];
  initial?: CounselingRecord | null;
  onSubmit: (values: RecordFormValues) => Promise<void>;
  submitting?: boolean;
  submitLabel?: string;
};

export function RecordForm({
  appointments,
  initial,
  onSubmit,
  submitting = false,
  submitLabel = "Save Record",
}: RecordFormProps) {
  const [appointmentId, setAppointmentId] = useState<number | undefined>(initial?.appointment_id ?? undefined);
  const [studentId, setStudentId] = useState<number | undefined>(initial?.student_id ?? undefined);
  const [sessionNotes, setSessionNotes] = useState(initial?.session_notes ?? "");
  const [followUpNotes, setFollowUpNotes] = useState(initial?.follow_up_notes ?? "");
  const [followUpDate, setFollowUpDate] = useState(initial?.follow_up_date ?? "");
  const [confidential, setConfidential] = useState(initial?.is_confidential ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedAppointment = appointments.find((a) => a.id === appointmentId);

  const handleAppointmentChange = (value: string) => {
    const id = value ? Number(value) : undefined;
    setAppointmentId(id);
    const appointment = appointments.find((a) => a.id === id);
    if (appointment?.student_id) {
      setStudentId(appointment.student_id);
    }
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!appointmentId) next.appointment_id = "Select an appointment.";
    if (!studentId) next.student_id = "Student is required.";
    if (!sessionNotes.trim()) next.session_notes = "Session notes are required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate() || !appointmentId || !studentId) return;
    await onSubmit({
      appointment_id: appointmentId,
      student_id: studentId,
      session_notes: sessionNotes.trim(),
      follow_up_notes: followUpNotes.trim() || undefined,
      follow_up_date: followUpDate || undefined,
      is_confidential: confidential,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="appointment_id">Appointment</Label>
        <Select
          id="appointment_id"
          value={appointmentId ?? ""}
          error={errors.appointment_id}
          onChange={(e) => handleAppointmentChange(e.target.value)}
        >
          <option value="">Select an appointment</option>
          {appointments.map((appointment) => (
            <option key={appointment.id} value={appointment.id}>
              {appointment.student?.name ?? `Student #${appointment.student_id}`} —{" "}
              {formatDateTime(appointment.scheduled_at)}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="student_id">Student</Label>
        <Input id="student_id" value={selectedAppointment?.student?.name ?? `Student #${studentId ?? ""}`} readOnly />
      </div>

      <div>
        <Label htmlFor="session_notes">Session notes</Label>
        <TextArea
          id="session_notes"
          rows={5}
          value={sessionNotes}
          error={errors.session_notes}
          placeholder="Summary of the session, observations, and progress."
          onChange={(e) => setSessionNotes(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="follow_up_notes">Follow-up notes (optional)</Label>
        <TextArea
          id="follow_up_notes"
          rows={3}
          value={followUpNotes}
          placeholder="Recommendations and next steps."
          onChange={(e) => setFollowUpNotes(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="follow_up_date">Follow-up date (optional)</Label>
        <Input
          id="follow_up_date"
          type="date"
          min={todaysDateValue()}
          value={followUpDate}
          onChange={(e) => setFollowUpDate(e.target.value)}
        />
      </div>

      <div>
        <Checkbox
          id="is_confidential"
          label="Keep this record confidential"
          checked={confidential}
          onChange={(e) => setConfidential(e.target.checked)}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}