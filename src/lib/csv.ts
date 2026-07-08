import { triggerDownload } from "./download";

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: string[][],
): void {
  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, filename);
}
