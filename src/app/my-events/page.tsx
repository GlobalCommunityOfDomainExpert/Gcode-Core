"use client";

import { useState } from "react";
import { ArrowRight, Calendar, CalendarX } from "lucide-react";
import { Badge, ButtonLink, Icon } from "@/components/atoms";
import { EmptyState, Tabs, ToggleGroup } from "@/components/molecules";
import { AuthenticatedShell } from "@/app/_components/authenticated-shell";
import {
  eventTypeBorderClass,
  eventTypeTone,
  formatDateBadge,
  mockEvents,
} from "@/lib/mock-events";

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
          <h1 className="text-display text-text-primary font-extrabold">
            My Events
          </h1>
          <p className="text-body text-text-secondary">
            Registered events, history &amp; purchases
          </p>
        </div>

        <div className="border-border-light bg-surface-light space-y-4 rounded-md border p-4">
          <Tabs items={tabItems} value={activeTab} onChange={setActiveTab} />

          {activeTab === "upcoming" ? (
            <>
              <ToggleGroup
                options={rangeOptions}
                value={range}
                onChange={setRange}
              />
              <div className="space-y-3">
                {upcoming.map((event) => {
                  const { day, month } = formatDateBadge(event.date);
                  return (
                    <div
                      key={event.id}
                      className={`border-border-light bg-surface-light flex items-center gap-4 rounded-md border border-l-4 p-4 ${eventTypeBorderClass[event.type]}`}
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
                        <div className="flex flex-wrap gap-2">
                          <Badge size="sm" tone={eventTypeTone[event.type]}>
                            {event.type}
                          </Badge>
                          <Badge size="sm" tone="neutral">
                            {event.mode}
                          </Badge>
                          <Badge
                            size="sm"
                            tone={
                              event.price === "Free" ? "success" : "neutral"
                            }
                          >
                            {event.price}
                          </Badge>
                        </div>
                        <p className="text-body text-text-primary truncate font-semibold">
                          {event.title}
                        </p>
                        <p className="text-small text-text-secondary flex items-center gap-2">
                          <Icon icon={Calendar} size="sm" />
                          {event.time} · {event.registeredCount} registered
                        </p>
                      </div>
                      <ButtonLink
                        href={`/events/${event.id}`}
                        variant="secondary"
                        size="sm"
                        className="shrink-0"
                      >
                        View Event <Icon size="sm" icon={ArrowRight} />
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
