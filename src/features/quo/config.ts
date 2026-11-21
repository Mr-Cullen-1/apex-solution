import "server-only";
import { identifier, QuoError } from "./model";
import { validSigningKey } from "./signature";

export function readQuoConfig() {
  if (process.env.QUO_CALL_TRACKING_ENABLED !== "true") throw new QuoError("disabled");
  try {
    return { orgId: identifier(process.env.QUO_ORG_ID), phoneNumberId: identifier(process.env.QUO_PHONE_NUMBER_ID) };
  } catch { throw new QuoError("not_configured"); }
}
export function requiredSecret(name: "QUO_API_KEY" | "QUO_WEBHOOK_KEY" | "QUO_RECONCILE_SECRET") {
  // Signing secret must be preserved exactly as issued by Quo.
  const value = name === "QUO_WEBHOOK_KEY" ? process.env[name] : process.env[name]?.trim();
  if (!value || (name === "QUO_RECONCILE_SECRET" && value.length < 32)) throw new QuoError("not_configured");
  if (name === "QUO_WEBHOOK_KEY" && !validSigningKey(value)) throw new QuoError("not_configured");
  return value;
}
