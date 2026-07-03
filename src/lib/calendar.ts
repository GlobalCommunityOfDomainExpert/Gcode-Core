import { MockEvent } from "./mock-events";

function formatIcsDate(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

function escapeIcsText(text: string): string {
  return text.replace(/[,;]/g, (match) => `\\${match}`).replace(/\n/g, "\\n");
}

export function downloadIcs(event: MockEvent): void {
  const start = new Date(event.date);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const description = `${event.time} · ${event.mode}\\n${event.description.join(" ")}`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GCODE//Events//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@gcode.in`,
    `DTSTAMP:${formatIcsDate(new Date())}T000000Z`,
    `DTSTART;VALUE=DATE:${formatIcsDate(start)}`,
    `DTEND;VALUE=DATE:${formatIcsDate(end)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.id}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
