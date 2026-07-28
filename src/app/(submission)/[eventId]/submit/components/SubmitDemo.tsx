"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { getBrandingClient } from "~/lib/branding";
import { type EventConfig } from "~/lib/types/eventConfig";
import {
  type SubmissionFormValues,
  submissionFormSchema,
} from "~/lib/types/submission";
import { TAGLINE_MAX_LENGTH } from "~/lib/types/taglineMaxLength";
import { cn } from "~/lib/utils";
import { type CompleteEvent } from "~/server/api/routers/event";
import { api } from "~/trpc/react";

import Button from "~/components/Button";
import { LogoConfetti } from "~/components/Confetti";

const DEMO_GUIDELINES_URL =
  "https://theaicollective.notion.site/demo-night-guidelines";
const PITCH_GUIDELINES_URL =
  "https://theaicollective.notion.site/pitch-night-guidelines";

export default function SubmitDemoPage({ event }: { event: CompleteEvent }) {
  return (
    <>
      {/*
       * Sized to exactly the space under the fixed header so the whole form
       * lands in one viewport. The scroll is a fallback for phones and short
       * windows only — nothing should be hidden below the fold on a laptop.
       */}
      <div className="absolute inset-x-0 bottom-0 top-14 mx-auto flex w-full max-w-2xl flex-col overflow-y-auto px-4">
        <SubmitDemoForm event={event} />
      </div>

      <div className="z-3 pointer-events-none fixed inset-0">
        <LogoConfetti />
      </div>
    </>
  );
}

/**
 * Wraps a field so every one reads the same way: label, optional why-text
 * explaining what we do with the answer, the control, then an inline error
 * underneath. Fields whose label already says everything (name, email, links)
 * skip `why` — the form has to fit on one screen.
 */
function Field({
  label,
  why,
  error,
  optional,
  accessory,
  children,
}: {
  label: string;
  why?: string;
  error?: string;
  optional?: boolean;
  accessory?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="flex w-full flex-col gap-1">
      <div className="flex flex-row flex-wrap items-center justify-start gap-x-2 font-semibold">
        <span className="text-lg">{label}</span>
        {optional && (
          <span className="text-sm italic text-gray-400">(optional)</span>
        )}
        {accessory}
      </div>
      {why && (
        <span className="text-base italic leading-tight text-gray-400">
          {why}
        </span>
      )}
      {children}
      {error && <span className="text-sm text-red-500">{error}</span>}
    </label>
  );
}

function inputClassName(hasError: boolean, extra?: string) {
  return cn(
    // Held on a 24px line rather than text-lg's default 28px, so the type can
    // grow without adding ~4px to every row on the form.
    "z-10 rounded-lg border-2 bg-white/60 px-3 py-2.5 text-lg leading-6 backdrop-blur",
    hasError ? "border-red-500" : "border-gray-200",
    extra,
  );
}

export function SubmitDemoForm({ event }: { event: CompleteEvent }) {
  const branding = getBrandingClient(
    (event.config as EventConfig | null)?.isPitchNight ?? false,
  );
  const isPitchNight = branding.isPitchNight;
  const noun = isPitchNight ? "pitch" : "demo";
  const createMutation = api.submission.create.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionFormSchema),
    // Validate once a field has been visited, then live as it's corrected, so
    // errors land under the field instead of arriving all at once on submit.
    mode: "onTouched",
    defaultValues: {
      name: "",
      url: "",
      pocName: "",
      email: "",
      pocLinkedin: "",
      companyLinkedin: "",
      tagline: "",
      description: "",
      demoUrl: "",
    },
  });

  const tagline = watch("tagline") ?? "";

  return (
    <form
      // Suppress native validation bubbles so the inline errors below each
      // field are the only thing a submitter ever sees.
      noValidate
      onSubmit={handleSubmit(async (data) => {
        await createMutation
          .mutateAsync({ eventId: event.id, ...data })
          .then(() => {
            toast.success(`Successfully submitted ${noun}!`);
            window.location.href = `${window.location.pathname}?success=true`;
          })
          .catch((error) => {
            toast.error(error.message);
          });
      })}
      // `mt-auto` drops the form to the bottom of the space under the header,
      // so the submit button lands just above the fold and any slack sits above
      // the title. The auto margin collapses to 0 once the form outgrows the
      // viewport, which keeps the top of the form reachable on short screens.
      className="mt-auto flex w-full flex-col items-center gap-3.5 py-4 font-medium"
    >
      <div>
        <h1 className="text-center font-kallisto text-4xl font-bold tracking-tight">
          {isPitchNight ? "Submit Your Pitch! 🚀" : "Submit Your Demo! 🚀"}
        </h1>
        <p className="max-w-xl pt-1 text-center text-base font-medium leading-[21px] text-gray-500">
          We are so excited to see what you&apos;ve been building! Submissions
          close the{" "}
          {/* Hard breaks compose the three lines we want on desktop; on narrow
              screens they'd strand words, so the text wraps on its own there. */}
          <br className="hidden md:inline" />
          Saturday before the event at 11:59pm. For more info, see our{" "}
          <a
            href={event.url}
            className="text-blue-500 underline"
            target="_blank"
          >
            event page
          </a>
          !{" "}
          <br className="hidden md:inline" />
          {isPitchNight
            ? "Pitches will be timed at five minutes."
            : "Demos will be timed at three minutes."}{" "}
          Please read our{" "}
          <a
            href={isPitchNight ? PITCH_GUIDELINES_URL : DEMO_GUIDELINES_URL}
            className="text-blue-500 underline"
            target="_blank"
          >
            {noun} guidelines
          </a>
          !
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 md:flex-row md:gap-4">
        <Field
          label={isPitchNight ? "Startup Name" : "Demo / Startup Name"}
          error={errors.name?.message}
        >
          <input
            type="text"
            placeholder="The AI Collective"
            {...register("name")}
            className={inputClassName(!!errors.name)}
          />
        </Field>
        <Field
          label={isPitchNight ? "Startup Website" : "Demo / Startup Website"}
          error={errors.url?.message}
        >
          <input
            type="text"
            inputMode="url"
            placeholder="https://aicollective.com"
            {...register("url")}
            className={inputClassName(!!errors.url)}
          />
        </Field>
      </div>

      <div className="flex w-full flex-col gap-3 md:flex-row md:gap-4">
        <Field label="Your Name" error={errors.pocName?.message}>
          <input
            type="text"
            placeholder="Ada Lovelace"
            {...register("pocName")}
            className={inputClassName(!!errors.pocName)}
          />
        </Field>
        <Field label="Your Email" error={errors.email?.message}>
          <input
            type="text"
            inputMode="email"
            placeholder="ada@aicollective.com"
            {...register("email")}
            className={inputClassName(!!errors.email)}
          />
        </Field>
      </div>

      <div className="flex w-full flex-col gap-3 md:flex-row md:gap-4">
        <Field label="Your LinkedIn" error={errors.pocLinkedin?.message}>
          <input
            type="text"
            inputMode="url"
            placeholder="https://linkedin.com/in/adalovelace"
            {...register("pocLinkedin")}
            className={inputClassName(!!errors.pocLinkedin)}
          />
        </Field>
        <Field
          label="Company LinkedIn"
          optional
          error={errors.companyLinkedin?.message}
        >
          <input
            type="text"
            inputMode="url"
            placeholder="https://linkedin.com/company/aicollective"
            {...register("companyLinkedin")}
            className={inputClassName(!!errors.companyLinkedin)}
          />
        </Field>
      </div>

      <Field
        label="Tagline 👋"
        why={
          isPitchNight
            ? `Please describe your startup in ${TAGLINE_MAX_LENGTH} characters or less!`
            : `Please describe your startup / demo in ${TAGLINE_MAX_LENGTH} characters or less!`
        }
        error={errors.tagline?.message}
        accessory={
          tagline.length >= 100 && (
            <span
              className={cn(
                "text-[13px] italic",
                tagline.length >= TAGLINE_MAX_LENGTH
                  ? "text-red-500"
                  : "text-gray-400",
              )}
            >
              {`(${tagline.length} / ${TAGLINE_MAX_LENGTH})`}
            </span>
          )
        }
      >
        <textarea
          placeholder="Building the human layer for the AI era"
          {...register("tagline")}
          className={inputClassName(!!errors.tagline, "max-h-24 min-h-10")}
          rows={2}
        />
      </Field>

      <Field
        label={isPitchNight ? "Pitch Description 🧑‍💻" : "Demo Description 🧑‍💻"}
        why={
          isPitchNight
            ? "What does your startup do? What will you pitch during your five minutes? What feedback would you like from investors and the community?"
            : "What does your startup do? What do you plan to demo to the community during your three minutes? What feedback would you like from the community?"
        }
        error={errors.description?.message}
      >
        <textarea
          placeholder="Tell us more!"
          {...register("description")}
          className={inputClassName(
            !!errors.description,
            "z-30 max-h-40 min-h-20",
          )}
          rows={3}
        />
      </Field>

      <Field
        label={isPitchNight ? "Additional Resources 🔗" : "Demo Video 🔗"}
        why={
          isPitchNight
            ? "Have a link that showcases your startup? (e.g., pitch deck, demo video, website)"
            : "Have a link which could help us get a better picture of your demo? Drop it here!"
        }
        error={errors.demoUrl?.message}
      >
        <input
          type="text"
          inputMode="url"
          placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          {...register("demoUrl")}
          className={inputClassName(!!errors.demoUrl)}
        />
      </Field>

      <Button
        pending={createMutation.isPending}
        isPitchNight={isPitchNight}
        className="h-12"
      >
        {isPitchNight ? "Submit Pitch" : "Submit Demo"}
      </Button>
    </form>
  );
}
