/** Bound actual streamed bytes, including requests without an honest length header. */
export async function readBookingBody(request: Request): Promise<{ ok: true; body: unknown } | { ok: false; status: 400 | 408 | 413 }> {
  const limit = 8_000;
  if (Number(request.headers.get("content-length")) > limit) return { ok: false, status: 413 };
  if (!request.body) return { ok: false, status: 400 };
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("body_timeout")), 5_000); });
  try {
    while (true) {
      const { done, value } = await Promise.race([reader.read(), deadline]);
      if (done) break;
      size += value.byteLength;
      if (size > limit) { void reader.cancel().catch(() => {}); return { ok: false, status: 413 }; }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return { ok: true, body: JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) };
  } catch (error) {
    void reader.cancel().catch(() => {});
    return { ok: false, status: error instanceof Error && error.message === "body_timeout" ? 408 : 400 };
  } finally {
    clearTimeout(timer);
    reader.releaseLock();
  }
}
