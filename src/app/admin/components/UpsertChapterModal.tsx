"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import type { Chapter } from "~/lib/types/chapter";

interface UpsertChapterModalProps {
  chapter?: Chapter;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function UpsertChapterModal({
  chapter,
  onSuccess,
  open: controlledOpen,
  onOpenChange,
}: UpsertChapterModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Use controlled open state if provided, otherwise use internal state
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [formData, setFormData] = useState({
    name: chapter?.name ?? "",
    slug: chapter?.slug ?? "",
    emoji: chapter?.emoji ?? "🌍",
    city: chapter?.city ?? "",
    country: chapter?.country ?? "",
    timezone: chapter?.timezone ?? "",
    email: chapter?.email ?? "",
    leadName: chapter?.leadName ?? "",
    leadEmail: chapter?.leadEmail ?? "",
    description: chapter?.description ?? "",
  });

  const utils = api.useUtils();
  const { mutate: upsertChapter } = api.chapter.upsert.useMutation({
    onSuccess: () => {
      utils.chapter.all.invalidate();
      utils.event.allAdmin.invalidate();
      setOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error:", error.message);
      alert(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    upsertChapter(
      {
        id: chapter?.id,
        data: {
          name: formData.name,
          slug: formData.slug,
          emoji: formData.emoji,
          city: formData.city,
          country: formData.country,
          timezone: formData.timezone || undefined,
          email: formData.email || undefined,
          leadName: formData.leadName || undefined,
          leadEmail: formData.leadEmail || undefined,
          description: formData.description || undefined,
        },
      },
      {
        onSettled: () => setLoading(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={chapter ? "outline" : "default"}>
          {chapter ? "Edit" : "Add Chapter"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{chapter ? "Edit Chapter" : "Create Chapter"}</DialogTitle>
          <DialogDescription>
            {chapter
              ? "Update chapter details"
              : "Add a new chapter for organizing events"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="San Francisco"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                  slug: e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, ""),
                }))
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emoji">Emoji *</Label>
              <Input
                id="emoji"
                placeholder="🌉"
                value={formData.emoji}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, emoji: e.target.value }))
                }
                maxLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                placeholder="sf"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="San Francisco"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                placeholder="United States"
                value={formData.country}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, country: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              placeholder="America/Los_Angeles"
              value={formData.timezone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, timezone: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="sf@aicollective.com"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leadName">Lead Name</Label>
            <Input
              id="leadName"
              placeholder="John Doe"
              value={formData.leadName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, leadName: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="About this chapter..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : chapter ? "Update Chapter" : "Create Chapter"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}