"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { TAGLINE_MAX_LENGTH } from "~/lib/types/taglineMaxLength";
import { cn } from "~/lib/utils";
import { type CompleteEvent } from "~/server/api/routers/event";
import { api } from "~/trpc/react";

import Button from "~/components/Button";
import { LogoConfetti } from "~/components/Confetti";

const GUIDELINES_URL =
  "https://docs.google.com/document/d/1Z-c4KaGAWzH2siuGYoocQ7uVI_o8E6gocUXJO3BMLw8/edit";

export default function SubmitDemoPage({ event }: { event: CompleteEvent }) {
  return (
    <>
      <div className="absolute bottom-0 max-h-[calc(100dvh-120px)] w-full max-w-2xl">
        <div className="size-full p-4">
          <SubmitDemoForm event={event} />
        </div>
      </div>

      <div className="z-3 pointer-events-none fixed inset-0">
        <LogoConfetti />
      </div>
    </>
  );
}

export function SubmitDemoForm({ event }: { event: CompleteEvent }) {
  const createMutation = api.submission.create.useMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    values: {
      name: "",
      tagline: "",
      description: "",
      email: "",
      url: "",
      pocName: "",
      demoUrl: "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await createMutation
          .mutateAsync({
            eventId: event.id,
            name: data.name,
            tagline: data.tagline,
            description: data.description,
            email: data.email,
            url: data.url,
            pocName: data.pocName,
            demoUrl: data.demoUrl,
          })
          .then(() => {
            toast.success("Successfully submitted demo!");
            window.location.href = `${window.location.pathname}?success=true`;
          })
          .catch((error) => {
            toast.error(error.message);
          });
      })}
      className="flex w-full flex-col items-center gap-4 font-medium"
    >
      <div>
        <h1 className="text-center font-kallisto text-4xl font-bold tracking-tight">
          Submit Your Demo! 🚀
        </h1>
        <p className="text-md max-w-xl pt-2 text-center font-medium leading-5 text-gray-500">
          We are so excited to see what you&apos;ve been building! Submissions
          close the Saturday before the event at 11:59pm. For more info, see our{" "}
          <a
            href={event.url}
            className="text-green-500 underline"
            target="_blank"
          >
            event page
          </a>
          ! Demos will be timed at two minutes. Please read our{" "}
          <a
            href={GUIDELINES_URL}
            className="text-green-500 underline"
            target="_blank"
          >
            demo guidelines
          </a>
          !
        </p>
      </div>
      <div className="flex w-full flex-col gap-4 md:flex-row">
        <label className="flex w-full flex-col gap-1">
          <span className="text-lg font-semibold">Demo / Startup Name</span>
          <input
            type="text"
            placeholder="The AI Collective"
            {...register("name", {
              required: "Startup / demo name is required",
            })}
            className={cn(
              "z-10 rounded-xl border-2 bg-white/60 p-2 text-lg backdrop-blur",
              errors.name ? "border-red-500" : "border-gray-200",
            )}
          />
          {errors.name && (
            <span className="text-red-500">{errors.name.message}</span>
          )}
        </label>
        <label className="flex w-full flex-col gap-1">
          <span className="text-lg font-semibold">Demo / Startup Website</span>
          <input
            type="url"
            placeholder="https://aicollective.com"
            {...register("url", {
              required: "Startup / demo website is required",
            })}
            className={cn(
              "z-10 rounded-xl border-2 bg-white/60 p-2 text-lg backdrop-blur",
              errors.url ? "border-red-500" : "border-gray-200",
            )}
          />
          {errors.url && (
            <span className="text-red-500">{errors.url.message}</span>
          )}
        </label>
      </div>
      <div className="flex w-full flex-col gap-4 md:flex-row">
        <label className="flex w-full flex-col gap-1">
          <span className="text-lg font-semibold">Your Name</span>
          <input
            type="text"
            placeholder="Ada Lovelace"
            {...register("pocName", {
              required: "Point of contact name is required",
            })}
            className={`z-10 rounded-xl border-2 p-2 text-lg backdrop-blur ${errors.pocName ? "border-red-500" : "border-gray-200 bg-white/60"}`}
          />
          {errors.pocName && (
            <span className="text-red-500">{errors.pocName.message}</span>
          )}
        </label>
        <label className="flex w-full flex-col gap-1">
          <span className="text-lg font-semibold">Your Email</span>
          <input
            type="email"
            placeholder="ada@aicollective.com"
            {...register("email", {
              required: "Point of contact email is required",
            })}
            className={cn(
              "z-10 rounded-xl border-2 bg-white/60 p-2 text-lg backdrop-blur",
              errors.email ? "border-red-500" : "border-gray-200",
            )}
          />
          {errors.email && (
            <span className="text-red-500">{errors.email.message}</span>
          )}
        </label>
      </div>
      <label className="flex w-full flex-col gap-1">
        <div className="flex w-full flex-row items-center justify-start gap-1 font-semibold">
          <span className="text-lg">Tagline 👋</span>
          {watch("tagline")?.length >= 100 && (
            <span
              className={cn(
                "text-sm italic",
                watch("tagline")?.length >= TAGLINE_MAX_LENGTH
                  ? "text-red-500"
                  : "text-gray-400",
              )}
            >
              {`(${watch("tagline").length} / ${TAGLINE_MAX_LENGTH})`}
            </span>
          )}
        </div>
        <span className="italic text-gray-400">
          Please describe your startup / demo in 120 characters or less!
        </span>
        <textarea
          placeholder="Building a global community of the brightest minds in AI to discuss, exchange, and innovate."
          {...register("tagline", {
            required: "Tagline is required",
            maxLength: {
              value: TAGLINE_MAX_LENGTH,
              message: `Tagline must be ${TAGLINE_MAX_LENGTH} characters or less`,
            },
          })}
          className={cn(
            "z-10 max-h-32 min-h-10 rounded-xl border-2 bg-white/60 p-2 text-lg backdrop-blur",
            errors.tagline ? "border-red-500" : "border-gray-200",
          )}
          rows={2}
        />
        {errors.tagline && (
          <span className="text-red-500">{errors.tagline.message}</span>
        )}
      </label>
      <label className="flex w-full flex-col gap-1">
        <span className="text-lg font-semibold">Demo Description 🧑‍💻</span>
        <span className="italic text-gray-400">
          What does your startup do? What do you plan to demo to the community
          during your two minutes? What feedback would you like from the
          community?
        </span>
        <textarea
          placeholder="Tell us more!"
          {...register("description", {
            required: "Demo description is required",
          })}
          className={cn(
            "z-30 max-h-96 min-h-24 rounded-xl border-2 bg-white/60 p-2 text-lg backdrop-blur",
            errors.description ? "border-red-500" : "border-gray-200",
          )}
          rows={3}
        />
        {errors.description && (
          <span className="text-red-500">{errors.description.message}</span>
        )}
      </label>
      <label className="flex w-full flex-col gap-1">
        <div className="flex w-full flex-row items-center justify-start gap-1 font-semibold">
          <span className="text-lg ">Demo Link 🔗</span>
          <span className="text-sm italic text-gray-400">(optional)</span>
        </div>
        <span className="italic text-gray-400">
          Have a link which could help us get a better picture of what you plan
          to demo? Drop it here!
        </span>
        <input
          type="url"
          placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          {...register("demoUrl")}
          className="z-10 rounded-xl border-2 border-gray-200 bg-white/60 p-2 text-lg backdrop-blur"
        />
      </label>
      <Button pending={createMutation.isPending}>Submit Demo</Button>
    </form>
  );
}
