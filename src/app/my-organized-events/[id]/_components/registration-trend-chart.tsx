import { Attendee } from "@/lib/attendees";

export interface RegistrationTrendChartProps {
  attendees: Attendee[];
}

// Ordinal ramp on the brand primary hue (hsl(206 42% L%)), monotone light→dark,
// oldest day lightest through today at the base --color-primary lightness (18%).
const barLightness = [78, 68, 58, 48, 38, 28, 18];

function formatDayLabel(date: Date, isToday: boolean): string {
  if (isToday) return "Today";
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export function RegistrationTrendChart({
  attendees,
}: RegistrationTrendChartProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - index));
    return date;
  });

  const counts = days.map((day) => {
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    return attendees.filter((attendee) => {
      const registeredAt = new Date(attendee.registeredAt);
      return registeredAt >= day && registeredAt < nextDay;
    }).length;
  });

  const maxCount = Math.max(1, ...counts);

  return (
    <div>
      <p className="text-small text-text-secondary mb-3 flex items-center gap-2 font-bold tracking-widest uppercase">
        Registration Trend <span className="bg-border-light h-px flex-1" />
      </p>
      <div
        className="flex h-24 items-end gap-1.5"
        role="img"
        aria-label="Daily registrations over the last 7 days"
      >
        {days.map((day, index) => {
          const count = counts[index];
          const isToday = index === days.length - 1;
          const heightPercent = Math.max(8, (count / maxCount) * 100);
          return (
            <div
              key={day.toISOString()}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <div className="flex w-full flex-1 items-end justify-center">
                <div
                  className="w-full max-w-6 rounded-t-sm"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: `hsl(206 42% ${barLightness[index]}%)`,
                  }}
                  title={`${formatDayLabel(day, isToday)}: ${count} registration${count === 1 ? "" : "s"}`}
                />
              </div>
              <span className="text-small text-text-secondary">
                {formatDayLabel(day, isToday)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
