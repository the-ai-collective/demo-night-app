"use client";

import { useWorkspaceContext } from "../contexts/WorkspaceContext";
import { type Attendee } from "@prisma/client";
import { CircleUserRoundIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { getBrandingClient } from "~/lib/branding";
import { ATTENDEE_TYPES, type AttendeeType } from "~/lib/types/attendeeTypes";
import { cn } from "~/lib/utils";

import Button from "~/components/Button";
import { useModal } from "~/components/modal/provider";

export function UpdateAttendeeButton({
  attendee,
  setAttendee,
}: {
  attendee: Attendee | null;
  setAttendee: (attendee: Attendee) => void;
}) {
  const { currentEvent } = useWorkspaceContext();
  const { isPitchNight } = getBrandingClient(currentEvent?.isPitchNight);
  const modal = useModal();
  return (
    <CircleUserRoundIcon
      className="cursor-pointer hover:opacity-50 focus:outline-none"
      size={28}
      color="black"
      onClick={() =>
        modal?.show(
          <UpdateAttendeeModal
            attendee={attendee}
            setAttendee={setAttendee}
            isPitchNight={isPitchNight}
          />,
        )
      }
    />
  );
}

export function UpdateAttendeeModal({
  attendee,
  setAttendee,
  isPitchNight,
}: {
  attendee: Attendee | null;
  setAttendee: (attendee: Attendee) => void;
  isPitchNight: boolean;
}) {
  const modal = useModal();

  return (
    <UpdateAttendeeForm
      attendee={attendee}
      setAttendee={setAttendee}
      onSubmit={() => modal?.hide()}
      isPreDemo={false}
      isPitchNight={isPitchNight}
    />
  );
}

export function UpdateAttendeeForm({
  attendee,
  setAttendee,
  onSubmit,
  isPreDemo = true,
  isPitchNight,
}: {
  attendee: Attendee | null;
  setAttendee: (attendee: Attendee) => void;
  onSubmit?: () => void;
  isPreDemo?: boolean;
  isPitchNight: boolean;
}) {
  const { register, handleSubmit, watch } = useForm({
    values: {
      name: attendee?.name ?? "",
      email: attendee?.email ?? "",
      linkedin: attendee?.linkedin ?? "",
      type: selectedType(attendee),
      // customType: attendeePreselectTypes.includes(attendee?.type ?? "")
      //   ? ""
      //   : attendee?.type ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        if (!attendee) {
          toast.error("Failed to update profile. Hang with us!");
          return;
        }
        setAttendee({
          id: attendee.id,
          name: data.name,
          email: data.email,
          linkedin: data.linkedin,
          type: data.type,
        });
        const message = isPreDemo
          ? `Profile updated! Hang tight – ${isPitchNight ? "pitches" : "demos"} starting soon 😎`
          : "Sweet! Presenters will see your updated profile 😎";
        toast.success(message);
        onSubmit?.();
      })}
      className="flex w-full flex-col items-center gap-4 font-medium"
    >
      <div>
        <h1 className="text-center font-kallisto text-4xl font-bold tracking-tight">
          {isPreDemo ? "Welcome! 😄" : "Update Profile 🧑‍💼"}
        </h1>
        <p className="text-md max-w-[330px] pt-2 text-center font-medium leading-5 text-gray-500">
          {isPreDemo
            ? "We're glad you're here! Tell us more about yourself – don't worry, we'll only share your contact info with presenters you choose to connect with!"
            : "Tell us more about yourself! Don't worry, we'll only share your contact info with presenters you choose to connect with!"}
        </p>
      </div>
      <label className="flex w-full flex-col gap-1">
        <span className="text-lg font-semibold">Name</span>
        <input
          type="text"
          placeholder="Ada Lovelace"
          {...register("name")}
          className="z-30 rounded-lg border-2 border-gray-200 bg-white/60 p-2 text-lg backdrop-blur"
        />
      </label>
      <label className="flex w-full flex-col gap-1">
        <span className="text-lg font-semibold">Email</span>
        <input
          type="email"
          placeholder="ada@aicollective.com"
          {...register("email")}
          className="z-10 rounded-lg border-2 border-gray-200 bg-white/60 p-2 text-lg backdrop-blur"
        />
      </label>
      <label className="flex w-full flex-col gap-1">
        <span className="text-lg font-semibold">LinkedIn</span>
        <input
          type="url"
          placeholder="https://www.linkedin.com/in/ada-lovelace"
          {...register("linkedin")}
          className="z-10 rounded-lg border-2 border-gray-200 bg-white/60 p-2 text-lg backdrop-blur"
        />
      </label>
      <label className="flex w-full flex-col gap-1 pb-2">
        <span className="text-lg font-semibold">I consider myself a...</span>
        <select
          {...register("type")}
          className={cn(
            "z-30 appearance-none rounded-lg border-2 border-gray-200 bg-white/60 p-2 text-lg backdrop-blur",
            watch("type") === "" && "text-gray-400",
          )}
        >
          <option value="">Select one...</option>
          {ATTENDEE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {/* {watch("type") === "Other" && (
          <input
            type="text"
            {...register("customType")}
            className="rounded-lg border border-gray-200 p-2"
          />
        )} */}
      </label>
      <Button isPitchNight={isPitchNight}>Update Profile</Button>
    </form>
  );
}

function selectedType(attendee: Attendee | null) {
  if (!attendee?.type) return "";
  return ATTENDEE_TYPES.includes(attendee.type as AttendeeType)
    ? attendee.type
    : "Other";
}
