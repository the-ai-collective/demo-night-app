"use client";

import { type Demo } from "@prisma/client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { TAGLINE_MAX_LENGTH } from "~/lib/types/taglineMaxLength";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

import Button from "~/components/Button";
import { LogoConfetti } from "~/components/Confetti";

export function UpdateDemoPage({
  demo,
  secret,
}: {
  demo: Demo;
  secret: string;
}) {
  return (
    <>
      <div className="absolute bottom-0 max-h-[calc(100dvh-120px)] w-full max-w-xl">
        <div className="size-full p-4">
          <UpdateDemoForm demo={demo} secret={secret} />
        </div>
      </div>

      <div className="z-3 pointer-events-none fixed inset-0">
        <LogoConfetti />
      </div>
    </>
  );
}

export function UpdateDemoForm({
  demo,
  secret,
}: {
  demo: Demo;
  secret: string;
}) {
  const updateDemoMutation = api.demo.update.useMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    values: {
      name: demo?.name ?? "",
      description: demo?.description ?? "",
      email: demo?.email ?? "",
      url: demo?.url ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        updateDemoMutation.mutate({
          id: demo.id,
          secret,
          name: data.name,
          description: data.description,
          email: data.email,
          url: data.url,
        });
        toast.success("Successfully updated demo!");
      })}
      className="flex w-full flex-col items-center gap-4 font-medium"
    >
      <div>
        <h1 className="text-center font-kallisto text-4xl font-bold tracking-tight">
          Get Ready! 🧑‍💻
        </h1>
        <p className="text-md max-w-[330px] pt-2 text-center font-medium leading-5 text-gray-500">
          It&apos;s almost time to demo! Let&apos;s make sure everything is in
          order so the audience can leave feedback and connect with you!
        </p>
      </div>
      <label className="flex w-full flex-col gap-1">
        <span className="text-lg font-semibold">Startup Name</span>
        <input
          type="text"
          placeholder="The AI Collective"
          {...register("name", { required: "Startup name is required" })}
          className={cn(
            "z-30 rounded-xl border-2 bg-white/60 p-2 text-lg backdrop-blur",
            errors.name ? "border-red-500" : "border-gray-200",
          )}
        />
        {errors.name && (
          <span className="text-sm text-red-500">{errors.name.message}</span>
        )}
      </label>
      <label className="flex w-full flex-col gap-1">
        <span className="text-lg font-semibold">Startup Website (Optional)</span>
        <input
          type="url"
          placeholder="https://aicollective.com"
          {...register("url")}
          className={cn(
            "z-10 rounded-xl border-2 bg-white/60 p-2 text-lg backdrop-blur",
            errors.url ? "border-red-500" : "border-gray-200",
          )}
        />
        {errors.url && (
          <span className="text-sm text-red-500">{errors.url.message}</span>
        )}
      </label>
      <label className="flex w-full flex-col gap-1">
        <span className="text-lg font-semibold">Email 📧 (Optional)</span>
        <span className="italic text-gray-400">
          This is made public so attendees can connect with you after the event!
        </span>
        <input
          type="email"
          placeholder="hello@aicollective.com"
          {...register("email")}
          className={cn(
            "z-10 rounded-xl border-2 bg-white/60 p-2 text-lg backdrop-blur",
            errors.email ? "border-red-500" : "border-gray-200",
          )}
        />
        {errors.email && (
          <span className="text-sm text-red-500">{errors.email.message}</span>
        )}
      </label>
      <label className="flex w-full flex-col gap-1">
        <div className="flex w-full flex-row items-center justify-start gap-2">
          <span className="text-lg font-semibold">Tagline 👋 (Optional)</span>
          {(watch("description")?.length ?? 0) >= 100 && (
            <span
              className={cn(
                "text-sm font-semibold italic",
                (watch("description")?.length ?? 0) >= TAGLINE_MAX_LENGTH
                  ? "text-red-500"
                  : "text-gray-400",
              )}
            >
              {`(${watch("description")?.length ?? 0} / ${TAGLINE_MAX_LENGTH})`}
            </span>
          )}
        </div>
        <span className="italic text-gray-400">
          Please describe your startup / demo in 120 characters or less!
        </span>
        <textarea
          placeholder="Building a community of the brightest minds in AI to discuss, exchange, and innovate."
          {...register("description", {
            maxLength: {
              value: TAGLINE_MAX_LENGTH,
              message: `Tagline must be ${TAGLINE_MAX_LENGTH} characters or less`,
            },
          })}
          className={cn(
            "z-30 max-h-32 min-h-10 rounded-xl border-2 bg-white/60 p-2 text-lg backdrop-blur",
            errors.description ? "border-red-500" : "border-gray-200",
          )}
          rows={2}
        />
        {errors.description && (
          <span className="text-sm text-red-500">
            {errors.description.message}
          </span>
        )}
      </label>
      <Button pending={updateDemoMutation.isPending}>Update Demo</Button>
    </form>
  );
}
