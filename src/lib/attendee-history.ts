export interface PastEventEntry {
  id: string;
  title: string;
  type: string;
  date: string;
  mode: "Online" | "In-Person" | "Hybrid";
  certificateEarned: boolean;
}

export const mockPastEvents: PastEventEntry[] = [
  {
    id: "past-1",
    title: "GCODE Winter Hackathon 2025",
    type: "Hackathon",
    date: "12 Dec 2025",
    mode: "Online",
    certificateEarned: true,
  },
  {
    id: "past-2",
    title: "Founders AMA: Raising a Seed Round",
    type: "Expert AMA",
    date: "28 Nov 2025",
    mode: "Online",
    certificateEarned: false,
  },
  {
    id: "past-3",
    title: "GCODE Community Meetup · Bangalore",
    type: "Community Meetup",
    date: "15 Oct 2025",
    mode: "In-Person",
    certificateEarned: false,
  },
];

export interface Purchase {
  id: string;
  eventTitle: string;
  amount: number;
  purchasedAt: string;
  status: "paid";
}

export const mockPurchases: Purchase[] = [
  {
    id: "purchase-1",
    eventTitle: "Fundraising readiness: what investors check first",
    amount: 299,
    purchasedAt: "28 Jun 2026",
    status: "paid",
  },
  {
    id: "purchase-2",
    eventTitle: "National Tech Symposium 2026 — IIT Delhi",
    amount: 200,
    purchasedAt: "20 Jun 2026",
    status: "paid",
  },
];

export interface RefundRequest {
  id: string;
  eventTitle: string;
  amount: number;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
}

export const mockRefundRequests: RefundRequest[] = [
  {
    id: "refund-1",
    eventTitle: "National Tech Symposium 2026 — IIT Delhi",
    amount: 200,
    requestedAt: "22 Jun 2026",
    status: "pending",
  },
];
