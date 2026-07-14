import { BadgeTone } from "@/components/atoms";
import { AttendanceStatus, SubmissionStatus } from "@/lib/attendees";

export const attendanceStatusTone: Record<AttendanceStatus, BadgeTone> = {
  registered: "primary",
  attended: "success",
  missed: "warning",
  cancelled: "danger",
};

export const attendanceStatusLabel: Record<AttendanceStatus, string> = {
  registered: "Registered",
  attended: "Attended",
  missed: "Missed",
  cancelled: "Cancelled",
};

export const ticketTypeTone: Record<"Free" | "Paid", BadgeTone> = {
  Free: "success",
  Paid: "primary",
};

export const submissionStatusTone: Record<SubmissionStatus, BadgeTone> = {
  submitted: "success",
  pending: "warning",
  disqualified: "danger",
};

export const submissionStatusLabel: Record<SubmissionStatus, string> = {
  submitted: "Submitted",
  pending: "Pending",
  disqualified: "Disqualified",
};
