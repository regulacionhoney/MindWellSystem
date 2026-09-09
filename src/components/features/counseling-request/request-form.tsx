import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { TextArea } from "@/components/ui/textarea";
import { URGENCIES } from "@/types";
import type { CounselingRequest } from "@/types";

const CATEGORY_OPTIONS = [
  "Academics",
  "Anxiety & Stress",
  "Relationships",
  "Career Guidance",
  "Grief & Loss",
  "Personal Growth",
  "Other",
];

type RequestFormValues = {
  category: string;
  description: string;
  urgency: (typeof URGENCIES)[number];
};

type RequestFormProps = {
  initial?: CounselingRequest | null;
  onSubmit: (values: RequestFormValues) => Promise<void>;
  submitting?: boolean;
  submitLabel?: string;
};

export function RequestForm({ initial, onSubmit, submitting = false, submitLabel = "Submit Request" }: RequestFormProps) {
  const [category, setCategory] = useState(initial?.category ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [urgency, setUrgency] = useState<RequestFormValues["urgency"]>(initial?.urgency ?? "medium");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!category.trim()) next.category = "Category is required.";
    if (!description.trim()) next.description = "Describe what you need support with.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    await onSubmit({ category, description: description.trim(), urgency });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="category">Category</Label>
        <Select id="category" value={category} error={errors.category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select a category</option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="urgency">Urgency</Label>
        <Select id="urgency" value={urgency} onChange={(e) => setUrgency(e.target.value as RequestFormValues["urgency"])}>
          {URGENCIES.map((option) => (
            <option key={option} value={option}>
              {option[0]?.toUpperCase().concat(option.slice(1))}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="description">What would you like to talk about?</Label>
        <TextArea
          id="description"
          rows={5}
          value={description}
          error={errors.description}
          placeholder="Share what is going on — this stays between you and your counselor."
          onChange={(e) => setDescription(e.target.value)}
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