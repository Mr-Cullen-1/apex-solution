import { readQuoConfig, requiredSecret } from "@/features/quo/config";
import { handleWebhook } from "@/features/quo/webhook";
import { persistCall } from "@/features/quo/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const scope = readQuoConfig(), key = requiredSecret("QUO_WEBHOOK_KEY");
    return await handleWebhook(request, { scope, key, persist: persistCall, log: code => console.info(JSON.stringify({ component: "quo_webhook", code })) });
  } catch {
    console.error(JSON.stringify({ component: "quo_webhook", code: "not_configured" }));
    return Response.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
}
