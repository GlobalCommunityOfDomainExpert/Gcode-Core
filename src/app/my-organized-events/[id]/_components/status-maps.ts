import { BadgeTone } from "@/components/atoms";
import { AttendanceStatus } from "@/lib/attendees";
import { CommunityRequestStatus } from "@/lib/community-requests";

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

export const communityStatusTone: Record<CommunityRequestStatus, BadgeTone> = {
  interested: "primary",
  helping: "success",
  passed: "neutral",
};

export const communityStatusLabel: Record<CommunityRequestStatus, string> = {
  interested: "Interested",
  helping: "Helping",
  passed: "Passed",
};

export const ticketTypeTone: Record<"Free" | "Paid", BadgeTone> = {
  Free: "success",
  Paid: "primary",
};
