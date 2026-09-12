import "server-only";
import { Resend } from "resend";
import { contact, company } from "@/content/company";
import type { EmailDeliveryResult } from "./types";

// Server-only Resend delivery for Book Now confirmation emails. Purely
// transactional: no Contacts/Audience, no Broadcasts, no marketing consent
// inferred from a submission. Only ever sent when the customer supplied an
// email address (see submission-adapter.ts) — Resend is never called
// otherwise.

type ResendConfig = { apiKey: string; fromEmail: string; replyTo?: string };

function readResendConfig(): ResendConfig | null {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) return null;
  const replyTo = process.env.RESEND_REPLY_TO;
  return { apiKey, fromEmail, replyTo: replyTo || undefined };
}

export function isResendConfigured(): boolean {
  return readResendConfig() !== null;
}

let cachedClient: Resend | null = null;

function getResendClient(apiKey: string): Resend {
  if (!cachedClient) cachedClient = new Resend(apiKey);
  return cachedClient;
}

export type LeadForEmail = {
  requestId: string;
  fullName: string;
  /** Guaranteed non-empty by the only caller (deliverConfirmationEmail),
   * which never invokes this module when the customer left email blank. */
  email: string;
  categoryLabel: string | null;
  serviceLabel: string | null;
  issue: string | null;
  zipCode: string;
  message: string;
};

export const CONFIRMATION_EMAIL_SUBJECT = "We received your service request";

/** "John Smith" -> "John", "Mary-Jane O'Connor" -> "Mary-Jane". Deliberately
 * simple — just the first whitespace-separated token — per the product
 * requirement not to over-engineer name parsing. Returns null only if
 * nothing usable remains (e.g. blank), in which case callers fall back to a
 * plain "Hello," greeting instead of "Hi ," */
function deriveFirstName(fullName: string): string | null {
  const first = fullName.trim().split(/\s+/)[0];
  return first || null;
}

/** Combined "{category} — {service}" when both are known (a specific
 * subservice page), just the category alone when only that's known (e.g. the
 * Heating -> Other path), or null when Book Now was opened with no context
 * at all. Returns null rather than "Not specified" — unlike the Telegram
 * message, the customer-facing email simply omits the Service line entirely
 * in that case (see buildDetailLines below). */
function serviceLine(lead: Pick<LeadForEmail, "categoryLabel" | "serviceLabel">): string | null {
  if (lead.serviceLabel && lead.categoryLabel) return `${lead.categoryLabel} — ${lead.serviceLabel}`;
  return lead.categoryLabel ?? lead.serviceLabel ?? null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeHtmlMultiline(value: string): string {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function buildPlainText(lead: LeadForEmail): string {
  const firstName = deriveFirstName(lead.fullName);
  const greeting = firstName ? `Hi ${firstName},` : "Hello,";
  const service = serviceLine(lead);

  const lines = [
    greeting,
    "",
    "Your service request has been received.",
    "",
    "A member of our team will reach out shortly to confirm the details and help coordinate your service request.",
    "",
    "Request details",
    "",
  ];
  if (service) lines.push(`Service: ${service}`);
  if (lead.issue) lines.push(`Issue: ${lead.issue}`);
  lines.push(`ZIP Code: ${lead.zipCode}`, "", "Your message:", lead.message);

  if (contact.phoneHref) lines.push("", "Need immediate assistance?", `Call ${contact.phone}`);

  lines.push("", company.name, "", `Request reference: ${lead.requestId}`);
  return lines.join("\n");
}

function detailRow(label: string, value: string): string {
  return `<p style="margin:0 0 6px;font-size:14px;line-height:20px;color:#01213a;"><span style="color:#4b5768;">${label}:</span> ${value}</p>`;
}

function buildHtml(lead: LeadForEmail): string {
  const firstName = deriveFirstName(lead.fullName);
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : "Hello,";
  const service = serviceLine(lead);

  const detailRows: string[] = [];
  if (service) detailRows.push(detailRow("Service", escapeHtml(service)));
  if (lead.issue) detailRows.push(detailRow("Issue", escapeHtml(lead.issue)));
  detailRows.push(detailRow("ZIP Code", escapeHtml(lead.zipCode)));

  const callBlock = contact.phoneHref
    ? `<p style="margin:24px 0 0;font-size:14px;line-height:20px;color:#4b5768;">Need immediate assistance?</p>
       <a href="${contact.phoneHref}" style="display:inline-block;margin-top:8px;padding:12px 24px;background:#005098;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">Call ${escapeHtml(contact.phone ?? "")}</a>`
    : "";

  // Table-based layout (not flex/grid) — the layout that survives the widest
  // range of email clients, several of which (notably Outlook desktop) only
  // reliably render inline-styled tables. No images, no external CSS/JS.
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f2f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f4f7;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e3e7ec;">
            <tr>
              <td style="padding:28px 32px 0;">
                <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#005098;">${escapeHtml(company.name)}</p>
                <h1 style="margin:12px 0 0;font-size:24px;line-height:32px;color:#01213a;">Request received</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 0;">
                <p style="margin:0;font-size:15px;line-height:24px;color:#01213a;">${greeting}</p>
                <p style="margin:12px 0 0;font-size:15px;line-height:24px;color:#01213a;">Your service request has been received.</p>
                <p style="margin:12px 0 0;font-size:15px;line-height:24px;color:#4b5768;">A member of our team will reach out shortly to confirm the details and help coordinate your service request.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e3e7ec;border-radius:8px;">
                  <tr>
                    <td style="padding:16px 20px;">
                      <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#005098;">Request details</p>
                      ${detailRows.join("")}
                      <p style="margin:14px 0 4px;font-size:12px;font-weight:600;color:#4b5768;">Your message</p>
                      <p style="margin:0;font-size:14px;line-height:22px;color:#01213a;">${escapeHtmlMultiline(lead.message)}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 0;">${callBlock}</td>
            </tr>
            <tr>
              <td style="padding:28px 32px 28px;">
                <p style="margin:0;font-size:13px;color:#4b5768;">${escapeHtml(company.name)}</p>
                <p style="margin:8px 0 0;font-size:11px;color:#8a95a3;">Request reference: ${escapeHtml(lead.requestId)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildConfirmationEmail(lead: LeadForEmail): { subject: string; html: string; text: string } {
  return { subject: CONFIRMATION_EMAIL_SUBJECT, html: buildHtml(lead), text: buildPlainText(lead) };
}

function sanitizeResendError(raw: string | null | undefined): string {
  if (!raw) return "Unknown Resend error";
  const config = readResendConfig();
  const withoutKey = config?.apiKey ? raw.split(config.apiKey).join("[redacted]") : raw;
  return withoutKey.slice(0, 500);
}

/** Sends the confirmation email via the official `resend` SDK. Returns
 * `not_configured` (never throws) when the env vars are absent. Idempotency
 * is keyed on the service request UUID (`book-now-confirmation/<requestId>`)
 * so a retry of the same request can never produce a second email — never
 * the customer's email address, phone, or a timestamp, none of which
 * uniquely and stably identify "this one request." */
export async function sendConfirmationEmail(lead: LeadForEmail): Promise<EmailDeliveryResult> {
  const config = readResendConfig();
  if (!config) return { status: "not_configured" };

  const resend = getResendClient(config.apiKey);
  const { subject, html, text } = buildConfirmationEmail(lead);

  try {
    const { data, error } = await resend.emails.send(
      {
        from: config.fromEmail,
        to: lead.email,
        subject,
        html,
        text,
        ...(config.replyTo ? { replyTo: config.replyTo } : {}),
      },
      { idempotencyKey: `book-now-confirmation/${lead.requestId}` },
    );
    if (error || !data) return { status: "failed", error: sanitizeResendError(error?.message ?? "Resend returned no data") };
    return { status: "sent", messageId: data.id };
  } catch (err) {
    return { status: "failed", error: sanitizeResendError(err instanceof Error ? err.message : "Unknown Resend error") };
  }
}
