import "server-only";
import { QUO_VERSION, QuoError, object, type Scope } from "./model";

export type CallPage = { data: unknown[]; nextCursor: string | null };
export type ListOptions = Scope & { apiKey: string; from: string; to: string; after?: string | null };
export async function listCalls(
  options: ListOptions,
  request: typeof fetch = fetch,
  sleep: (ms: number) => Promise<void> = ms => new Promise(resolve => setTimeout(resolve, ms)),
): Promise<CallPage> {
  const url = new URL("/calls", "https://api.quo.com");
  url.searchParams.set("phoneNumberId", options.phoneNumberId);
  url.searchParams.set("direction", "incoming");
  url.searchParams.set("createdAt[gte]", options.from);
  url.searchParams.set("createdAt[lte]", options.to);
  url.searchParams.set("include", "voicemail");
  url.searchParams.set("limit", "50");
  if (options.after) url.searchParams.set("after", options.after);
  for (let attempt = 0; attempt < 3; attempt++) {
    let response: Response;
    try {
      response = await request(url, {
        headers: { Authorization: options.apiKey, "Quo-Api-Version": QUO_VERSION, Accept: "application/json" },
        cache: "no-store", redirect: "error", signal: AbortSignal.timeout(5000),
      });
    } catch {
      if (attempt === 2) throw new QuoError("quo_network_error");
      await sleep(250 * (attempt + 1));
      continue;
    }
    if (response.status === 429 || response.status >= 500) {
      const retry = response.headers.get("retry-after");
      const delay = retry ? (/^\d+$/.test(retry) ? Number(retry) * 1000 : Date.parse(retry) - Date.now()) : 250 * (attempt + 1);
      await response.body?.cancel();
      if (attempt === 2 || !Number.isFinite(delay) || delay > 2000) throw new QuoError(response.status === 429 ? "quo_rate_limited" : "quo_unavailable");
      await sleep(Math.max(0, delay));
      continue;
    }
    if (!response.ok) {
      await response.body?.cancel();
      throw new QuoError([401, 403].includes(response.status) ? "quo_unauthorized" : "quo_request_failed");
    }
    let raw: string;
    try { raw = await response.text(); }
    catch {
      // Fetch can resolve headers before the connection fails reading the body.
      if (attempt === 2) throw new QuoError("quo_network_error");
      await sleep(250 * (attempt + 1));
      continue;
    }
    try {
      const body = object(JSON.parse(raw));
      if (!Array.isArray(body.data) || body.data.length > 50 || !(body.nextCursor === null || (typeof body.nextCursor === "string" && body.nextCursor.length > 0 && body.nextCursor.length <= 2048))) throw new Error();
      return { data: body.data, nextCursor: body.nextCursor };
    } catch { throw new QuoError("invalid_api_response"); }
  }
  throw new QuoError("quo_unavailable");
}
