import { SubmissionStatus } from "@prisma/client";

import { statusTitle } from "~/lib/types/submissionStatus";

export function statusColor(status: SubmissionStatus): string {
  switch (status) {
    case SubmissionStatus.PENDING:
      return "bg-gray-200";
    case SubmissionStatus.WAITLISTED:
      return "bg-green-200";
    case SubmissionStatus.AWAITING_CONFIRMATION:
      return "bg-green-300";
    case SubmissionStatus.CONFIRMED:
      return "bg-green-400";
    case SubmissionStatus.CANCELLED:
    case SubmissionStatus.REJECTED:
      return "bg-red-200";
    default:
      return "bg-gray-200";
  }
}

export default function SubmissionStatusBadge({
  status,
}: {
  status: SubmissionStatus;
}) {
  if (!status) return null;
  const color = statusColor(status);
  return (
    <span
      className={`whitespace-nowrap rounded-sm px-2 py-0.5 text-xs font-semibold ${color} text-${color.replace("bg-", "")}-800`}
    >
      {statusTitle(status)}
    </span>
  );
}
