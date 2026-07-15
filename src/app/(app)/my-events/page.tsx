"use client";

import { useState } from "react";
import { ArrowRight, Calendar, CalendarX, IndianRupee } from "lucide-react";
import { Badge, BadgeTone, ButtonLink, Icon } from "@/components/atoms";
import {
  EmptyState,
  EventBadgeRow,
  Tabs,
  ToggleGroup,
} from "@/components/molecules";
import {
  mockPurchases,
  mockRefundRequests,
  RefundRequest,
} from "@/lib/attendee-history";
import {
  eventTypeBorderClass,
  eventTypeTone,
  formatDateBadge,
} from "@/lib/event";
import { useMyTickets } from "@/hooks/use-my-tickets";

const tabItems = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "purchases", label: "Purchase History" },
  { value: "refunds", label: "Refund Requests" },
];

const rangeOptions = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Upcoming" },
];

const refundStatusTone: Record<RefundRequest["status"], BadgeTone> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

function isWithinDays(date: Date, today: Date, days: number): boolean {
  const diffMs = date.getTime() - today.getTime();
  return diffMs >= 0 && diffMs <= days * 86_400_000;
}

function isSameMonth(date: Date, today: Date): boolean {
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth()
  );
}

export default function MyEventsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [range, setRange] = useState("all");
  const { tickets } = useMyTickets();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = tickets
    .filter((ticket) => new Date(ticket.date) >= today)
    .filter((ticket) => {
      const eventDate = new Date(ticket.date);
      if (range === "week") return isWithinDays(eventDate, today, 7);
      if (range === "month") return isSameMonth(eventDate, today);
      return true;
    });

  const past = tickets.filter((ticket) => new Date(ticket.date) < today);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-text-primary font-extrabold">
          My Events
        </h1>
        <p className="text-body text-text-secondary">
          Registered events, history &amp; purchases
        </p>
      </div>

      <div className="border-border-light bg-surface-light space-y-4 rounded-md border p-4">
        <Tabs items={tabItems} value={activeTab} onChange={setActiveTab} />

        {activeTab === "upcoming" && (
          <>
            <ToggleGroup
              options={rangeOptions}
              value={range}
              onChange={setRange}
            />
            {upcoming.length === 0 ? (
              <EmptyState
                icon={CalendarX}
                title="Nothing in this range"
                description="Try a wider date range, or browse events to register for more."
              />
            ) : (
              <div className="space-y-3">
                {upcoming.map((ticket) => {
                  const { day, month } = formatDateBadge(ticket.date);
                  return (
                    <div
                      key={ticket.participantId}
                      className={`border-border-light bg-surface-light flex items-center gap-4 rounded-md border border-l-4 p-4 ${eventTypeBorderClass(ticket.type)}`}
                    >
                      <div className="w-12 shrink-0 text-center">
                        <p className="text-small text-text-secondary font-semibold uppercase">
                          {month}
                        </p>
                        <p className="text-heading text-text-primary font-extrabold">
                          {day}
                        </p>
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <EventBadgeRow
                          type={ticket.type}
                          mode={ticket.mode}
                          price={ticket.price}
                          typeTone={eventTypeTone(ticket.type)}
                        />
                        <p className="text-body text-text-primary truncate font-semibold">
                          {ticket.title}
                        </p>
                        <p className="text-small text-text-secondary flex items-center gap-2">
                          <Icon icon={Calendar} size="sm" />
                          {ticket.time} · {ticket.quantity} ticket
                          {ticket.quantity === 1 ? "" : "s"}
                          {ticket.amountPaid
                            ? ` · ₹${ticket.amountPaid} paid`
                            : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col gap-2">
                        <ButtonLink
                          href={`/events/${ticket.eventId}/registered?pid=${ticket.participantId}`}
                          variant="primary"
                          size="sm"
                        >
                          View Ticket
                        </ButtonLink>
                        <ButtonLink
                          href={`/events/${ticket.eventId}`}
                          variant="secondary"
                          size="sm"
                        >
                          View Event <Icon size="sm" icon={ArrowRight} />
                        </ButtonLink>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === "past" &&
          (past.length === 0 ? (
            <EmptyState
              icon={CalendarX}
              title="Nothing here yet"
              description="Events you've attended will show up here."
            />
          ) : (
            <div className="space-y-3">
              {past.map((ticket) => (
                <div
                  key={ticket.participantId}
                  className="border-border-light bg-surface-light flex items-center gap-4 rounded-md border p-4"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap gap-2">
                      <Badge size="sm" tone="neutral">
                        {ticket.type}
                      </Badge>
                      <Badge size="sm" tone="neutral">
                        {ticket.mode}
                      </Badge>
                    </div>
                    <p className="text-body text-text-primary truncate font-semibold">
                      {ticket.title}
                    </p>
                    <p className="text-small text-text-secondary flex items-center gap-2">
                      <Icon icon={Calendar} size="sm" />
                      {ticket.date} · {ticket.quantity} ticket
                      {ticket.quantity === 1 ? "" : "s"}
                      {ticket.amountPaid
                        ? ` · ₹${ticket.amountPaid} paid`
                        : ""}
                    </p>
                  </div>
                  <ButtonLink
                    href={`/events/${ticket.eventId}/registered?pid=${ticket.participantId}`}
                    variant="secondary"
                    size="sm"
                    className="shrink-0"
                  >
                    View Ticket
                  </ButtonLink>
                </div>
              ))}
            </div>
          ))}

        {activeTab === "purchases" &&
          (mockPurchases.length === 0 ? (
            <EmptyState
              icon={CalendarX}
              title="Nothing here yet"
              description="This list will fill up as you pay for events."
            />
          ) : (
            <div className="space-y-3">
              {mockPurchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="border-border-light bg-surface-light flex items-center justify-between gap-4 rounded-md border p-4"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-body text-text-primary truncate font-semibold">
                      {purchase.eventTitle}
                    </p>
                    <p className="text-small text-text-secondary flex items-center gap-2">
                      <Icon icon={Calendar} size="sm" />
                      {purchase.purchasedAt}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-body text-text-primary flex items-center font-semibold">
                      <Icon icon={IndianRupee} size="sm" />
                      {purchase.amount}
                    </span>
                    <Badge variant="muted" tone="success" size="sm">
                      Paid
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ))}

        {activeTab === "refunds" &&
          (mockRefundRequests.length === 0 ? (
            <EmptyState
              icon={CalendarX}
              title="Nothing here yet"
              description="Refund requests you submit will show up here."
            />
          ) : (
            <div className="space-y-3">
              {mockRefundRequests.map((refund) => (
                <div
                  key={refund.id}
                  className="border-border-light bg-surface-light flex items-center justify-between gap-4 rounded-md border p-4"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-body text-text-primary truncate font-semibold">
                      {refund.eventTitle}
                    </p>
                    <p className="text-small text-text-secondary flex items-center gap-2">
                      <Icon icon={Calendar} size="sm" />
                      Requested {refund.requestedAt}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-body text-text-primary flex items-center font-semibold">
                      <Icon icon={IndianRupee} size="sm" />
                      {refund.amount}
                    </span>
                    <Badge
                      variant="muted"
                      tone={refundStatusTone[refund.status]}
                      size="sm"
                    >
                      {refund.status[0].toUpperCase() + refund.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
