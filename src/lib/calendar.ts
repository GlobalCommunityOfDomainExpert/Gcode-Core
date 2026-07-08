import { Event } from "./event";
import { triggerDownload } from "./download";

function formatIcsDate(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

function escapeIcsText(text: string): string {
  return text.replace(/[,;]/g, (match) => `\\${match}`).replace(/\n/g, "\\n");
}

export function downloadIcs(event: Event): void {
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

  const blob = new Blob([lines.join("\r\n")], {
    type: "text/calendar;charset=utf-8;",
  });
  triggerDownload(blob, `${event.id}.ics`);
}
