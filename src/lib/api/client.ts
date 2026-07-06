const DEFAULT_BASE_URL =
  "https://g39bc7cd4ecbbbb-gcdev01.adb.ap-hyderabad-1.oraclecloudapps.com/ords/wksp_gcode2/v1";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_BASE_URL;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
}

// ORDS returns HTTP 200 with `{ error: "..." }` for not-found/invalid requests
// rather than a 4xx status, so both must be checked.
export async function apiRequest<T>(
  path: string,
  { method = "GET", body, query }: RequestOptions = {},
): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (
    !res.ok ||
    (data && typeof data === "object" && "error" in (data as object))
  ) {
    throw new ApiError(
      (data as { error?: string } | null)?.error ??
        `Request failed: ${res.status}`,
      res.status,
    );
  }

  return data as T;
}
