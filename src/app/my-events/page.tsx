"use client";

import { useState } from "react";
import { Calendar, CalendarX } from "lucide-react";
import { Badge, ButtonLink, Icon } from "@/components/atoms";
import { EmptyState, Tabs, ToggleGroup } from "@/components/molecules";
import { AuthenticatedShell } from "@/app/_components/authenticated-shell";
import { eventTypeBorderClass, eventTypeTone, formatDateBadge, mockEvents } from "@/lib/mock-events";

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

export default function MyEventsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [range, setRange] = useState("week");

  const upcoming = mockEvents.filter((event) => event.registeredCount > 0);

  return (
    <AuthenticatedShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-display font-extrabold text-text-primary">My Events</h1>
          <p className="text-body text-text-secondary">Registered events, history &amp; purchases</p>
        </div>

        <div className="space-y-4 rounded-md border border-border-light bg-surface-light p-4">
          <Tabs items={tabItems} value={activeTab} onChange={setActiveTab} />

          {activeTab === "upcoming" ? (
            <>
              <ToggleGroup options={rangeOptions} value={range} onChange={setRange} />
              <div className="space-y-3">
                {upcoming.map((event) => {
                  const { day, month } = formatDateBadge(event.date);
                  return (
                    <div
                      key={event.id}
                      className={`flex items-center gap-4 rounded-md border border-border-light border-l-4 bg-surface-light p-4 ${eventTypeBorderClass[event.type]}`}
                    >
                      <div className="w-12 shrink-0 text-center">
                        <p className="text-small font-semibold uppercase text-text-secondary">{month}</p>
                        <p className="text-heading font-extrabold text-text-primary">{day}</p>
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap gap-2">
                          <Badge size="sm" tone={eventTypeTone[event.type]}>
                            {event.type}
                          </Badge>
                          <Badge size="sm" tone="neutral">
                            {event.mode}
                          </Badge>
                          <Badge size="sm" tone={event.price === "Free" ? "success" : "neutral"}>
                            {event.price}
                          </Badge>
                        </div>
                        <p className="truncate text-body font-semibold text-text-primary">{event.title}</p>
                        <p className="flex items-center gap-2 text-small text-text-secondary">
                          <Icon icon={Calendar} size="sm" />
                          {event.time} · {event.registeredCount} registered
                        </p>
                      </div>
                      <ButtonLink href={`/events/${event.id}`} variant="secondary" size="sm" className="shrink-0">
                        View Event →
                      </ButtonLink>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <EmptyState
              icon={CalendarX}
              title="Nothing here yet"
              description="This list will fill up as you attend and pay for events."
            />
          )}
        </div>
      </div>
    </AuthenticatedShell>
  );
}
