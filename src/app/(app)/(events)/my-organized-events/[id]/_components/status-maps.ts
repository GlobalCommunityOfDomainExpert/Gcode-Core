import { BadgeTone } from "@/components/atoms";
import { AttendanceStatus, SubmissionStatus } from "@/lib/attendees";
import { RoundDecision } from "@/lib/rounds";
import { EventPanelist } from "@/lib/event";

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

export const roundDecisionTone: Record<RoundDecision["status"], BadgeTone> = {
  SHORTLISTED: "success",
  REJECTED: "danger",
};

export const roundDecisionLabel: Record<RoundDecision["status"], string> = {
  SHORTLISTED: "Shortlisted",
  REJECTED: "Rejected",
};

export const panelistStatusTone: Record<EventPanelist["status"], BadgeTone> = {
  INVITED: "warning",
  ACCEPTED: "success",
  DECLINED: "danger",
};

export const panelistStatusLabel: Record<EventPanelist["status"], string> = {
  INVITED: "Invited",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
};
