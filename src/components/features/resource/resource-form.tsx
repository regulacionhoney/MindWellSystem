import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { TextArea } from "@/components/ui/textarea";
import { RESOURCE_CATEGORIES } from "@/types";
import type { ResourceCategory, WellnessResource } from "@/types";

type ResourceFormValues = {
  title: string;
  content: string;
  category: ResourceCategory;
  author?: string;
  image_url?: string;
  is_published: boolean;
};

type ResourceFormProps = {
  initial?: WellnessResource | null;
  onSubmit: (values: ResourceFormValues) => Promise<void>;
  submitting?: boolean;
  submitLabel?: string;
};

export function ResourceForm({
  initial,
  onSubmit,
  submitting = false,
  submitLabel = "Save Resource",
}: ResourceFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<ResourceCategory>(initial?.category ?? "self-care");
  const [content, setContent] = useState(initial?.content ?? "");
  const [author, setAuthor] = useState(initial?.author ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [published, setPublished] = useState(initial?.is_published ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "Title is required.";
    if (!content.trim()) next.content = "Content is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    await onSubmit({
      title: title.trim(),
      category,
      content: content.trim(),
      author: author.trim() || undefined,
      image_url: imageUrl.trim() || undefined,
      is_published: published,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} error={errors.title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ResourceCategory)}
          >
            {RESOURCE_CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option[0]?.toUpperCase().concat(option.slice(1))}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="author">Author (optional)</Label>
          <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} />
        </div>
      </div>

      <div>
        <Label htmlFor="content">Content</Label>
        <TextArea
          id="content"
          rows={7}
          value={content}
          error={errors.content}
          placeholder="Write the resource content. You can use plain paragraphs."
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="image_url">Image URL (optional)</Label>
        <Input id="image_url" value={imageUrl} placeholder="https://..." onChange={(e) => setImageUrl(e.target.value)} />
      </div>

      <div>
        <Checkbox
          id="is_published"
          label="Publish to students"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
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