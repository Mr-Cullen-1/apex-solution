"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAdminAction, resetAdminPasswordAction, setAdminActiveAction, setAdminRoleAction } from "@/features/admin/admins/actions";
import type { AdminAccount, AdminRole } from "@/features/admin/admins/types";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(date);
}

type RevealedPassword = { heading: string; email: string; password: string };
/** An existing Supabase Auth identity was just linked as an Admin — its
 * password was deliberately left untouched (it may already have a usable
 * one), so there is nothing to reveal yet. Kept separate from `feedback`
 * because this state needs its own "Reset Password" call-to-action, not
 * just a message. */
type LinkedAdminNotice = { userId: string; email: string };

export function AdminsBoard({ admins, currentUserId }: { admins: AdminAccount[]; currentUserId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [revealed, setRevealed] = useState<RevealedPassword | null>(null);
  const [linkedNotice, setLinkedNotice] = useState<LinkedAdminNotice | null>(null);

  const [createEmail, setCreateEmail] = useState("");
  const [createRole, setCreateRole] = useState<AdminRole>("ADMIN");

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingUserId("create");
    setRevealed(null);
    setLinkedNotice(null);
    startTransition(async () => {
      const result = await createAdminAction(createEmail, createRole);
      setPendingUserId(null);
      if (result.ok) {
        setCreateEmail("");
        setFeedback(null);
        if (result.temporaryPassword) {
          setRevealed({ heading: "Admin created successfully", email: result.admin.email, password: result.temporaryPassword });
        } else {
          // Existing Auth identity, not previously an Admin: linked, but its
          // password was NOT modified — it may already have a usable one, so
          // this must never silently imply they can log in yet. A direct
          // Reset Password action is offered right here rather than making
          // the SUPER_ADMIN hunt for the new row in the table below.
          setLinkedNotice({ userId: result.admin.userId, email: result.admin.email });
        }
        router.refresh();
      } else {
        setFeedback({ tone: "error", text: result.message });
      }
    });
  }

  function handleResetPassword(admin: Pick<AdminAccount, "userId" | "email">) {
    if (!window.confirm(`Reset the password for ${admin.email}? Their current password will stop working immediately.`)) return;
    setPendingUserId(admin.userId);
    setRevealed(null);
    setLinkedNotice(null);
    startTransition(async () => {
      const result = await resetAdminPasswordAction(admin.userId);
      setPendingUserId(null);
      if (result.ok) {
        setFeedback(null);
        setRevealed({ heading: "Password reset successfully", email: result.admin.email, password: result.temporaryPassword });
        router.refresh();
      } else {
        setFeedback({ tone: "error", text: result.status === "not_found" ? "That admin no longer exists." : "Couldn't reset that password." });
      }
    });
  }

  function handleActiveToggle(userId: string, next: boolean) {
    setPendingUserId(userId);
    startTransition(async () => {
      const result = await setAdminActiveAction(userId, next);
      setPendingUserId(null);
      if (result.ok) {
        setFeedback({ tone: "success", text: "Saved." });
        router.refresh();
      } else {
        setFeedback({ tone: "error", text: result.status === "invalid" ? result.message : "That couldn't be saved." });
      }
    });
  }

  function handleRoleChange(userId: string, next: AdminRole) {
    setPendingUserId(userId);
    startTransition(async () => {
      const result = await setAdminRoleAction(userId, next);
      setPendingUserId(null);
      if (result.ok) {
        setFeedback({ tone: "success", text: "Saved." });
        router.refresh();
      } else {
        setFeedback({ tone: "error", text: result.status === "invalid" ? result.message : "That couldn't be saved." });
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {revealed ? (
        <PasswordRevealPanel heading={revealed.heading} email={revealed.email} password={revealed.password} onDismiss={() => setRevealed(null)} />
      ) : linkedNotice ? (
        <LinkedAdminNoticePanel
          email={linkedNotice.email}
          pending={pending && pendingUserId === linkedNotice.userId}
          onResetPassword={() => handleResetPassword(linkedNotice)}
          onDismiss={() => setLinkedNotice(null)}
        />
      ) : (
        <form onSubmit={handleCreate} className="flex flex-col gap-3 rounded-panel border border-steel bg-surface p-5 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="create-email" className="text-sm font-semibold text-navy">
              Create admin — email
            </label>
            <input
              id="create-email"
              type="email"
              required
              value={createEmail}
              onChange={(event) => setCreateEmail(event.target.value)}
              disabled={pending}
              className="mt-1.5 min-h-10 w-full rounded-control border border-steel bg-surface px-3.5 text-sm text-navy outline-none focus-visible:border-brand-primary disabled:opacity-60"
            />
          </div>
          <div>
            <label htmlFor="create-role" className="text-sm font-semibold text-navy">
              Role
            </label>
            <select
              id="create-role"
              value={createRole}
              onChange={(event) => setCreateRole(event.target.value as AdminRole)}
              disabled={pending}
              className="mt-1.5 min-h-10 rounded-control border border-steel bg-surface px-3.5 text-sm text-navy outline-none focus-visible:border-brand-primary disabled:opacity-60"
            >
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={pending || !createEmail}
            className="min-h-10 rounded-control bg-navy px-5 text-sm font-semibold text-white transition-colors hover:bg-copper disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pendingUserId === "create" ? "Creating…" : "Create Admin"}
          </button>
        </form>
      )}

      {feedback && (
        <p role="status" className={`rounded-control px-4 py-2.5 text-sm font-medium ${feedback.tone === "success" ? "bg-status-live/15 text-status-live" : "bg-brand-soft text-ink"}`}>
          {feedback.text}
        </p>
      )}

      <div className="overflow-x-auto rounded-panel border border-steel bg-surface">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-steel text-left text-xs font-bold uppercase tracking-[0.06em] text-slate">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Last sign-in</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => {
              const isSelf = admin.userId === currentUserId;
              const rowPending = pending && pendingUserId === admin.userId;
              return (
                <tr key={admin.userId} className="border-b border-steel last:border-b-0">
                  <td className="px-4 py-3 align-top font-semibold text-navy">
                    {admin.email}
                    {isSelf && <span className="ml-2 text-xs font-normal text-slate">(you)</span>}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <select
                      value={admin.role}
                      disabled={rowPending}
                      onChange={(event) => handleRoleChange(admin.userId, event.target.value as AdminRole)}
                      className="rounded-control border border-steel bg-surface px-2.5 py-1.5 text-sm text-navy disabled:opacity-60"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex w-fit items-center rounded-control px-2.5 py-1 text-xs font-bold uppercase tracking-[0.06em] ${
                          admin.isActive ? "bg-status-live/15 text-status-live" : "bg-ink/10 text-ink-muted"
                        }`}
                      >
                        {admin.isActive ? "Active" : "Inactive"}
                      </span>
                      {admin.mustChangePassword && <span className="text-xs font-semibold text-copper">Must change password</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-slate">{formatDate(admin.createdAt)}</td>
                  <td className="px-4 py-3 align-top text-slate">{admin.lastSignInAt ? formatDate(admin.lastSignInAt) : "Never"}</td>
                  <td className="px-4 py-3 align-top text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        disabled={rowPending}
                        onClick={() => handleResetPassword(admin)}
                        className="rounded-control border border-steel px-3 py-1.5 text-sm font-semibold text-navy transition-colors hover:border-navy disabled:opacity-60"
                      >
                        {rowPending ? "Working…" : "Reset Password"}
                      </button>
                      <button
                        type="button"
                        disabled={rowPending}
                        onClick={() => handleActiveToggle(admin.userId, !admin.isActive)}
                        className="rounded-control border border-steel px-3 py-1.5 text-sm font-semibold text-navy transition-colors hover:border-navy disabled:opacity-60"
                      >
                        {rowPending ? "Saving…" : admin.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** An existing Supabase Auth identity was just linked as an Apex Admin.
 * Deliberately makes NO claim that they can log in yet — their existing
 * password (which may or may not still be usable, e.g. an account left
 * over from the retired invite-email flow) was not touched. "Reset
 * Password" is the explicit, separate action that actually issues a usable
 * credential. */
function LinkedAdminNoticePanel({
  email,
  pending,
  onResetPassword,
  onDismiss,
}: {
  email: string;
  pending: boolean;
  onResetPassword: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="rounded-panel border border-brand-primary bg-brand-soft p-6">
      <p className="text-sm font-bold uppercase tracking-[0.06em] text-brand-primary">Existing Supabase account linked as Apex Admin</p>
      <p className="mt-3 text-sm text-ink">
        An existing account for <span className="font-semibold text-navy">{email}</span> was found and has been added as an Apex Admin. Their existing
        password was not changed, so they may not yet have a working password for this workspace.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={onResetPassword}
          className="rounded-control bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-copper disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Working…" : "Set temporary password"}
        </button>
        <button type="button" onClick={onDismiss} className="rounded-control border border-steel bg-surface px-4 py-2 text-sm font-semibold text-navy hover:border-navy">
          Done
        </button>
      </div>
    </div>
  );
}

/** One-time reveal — this password exists only in this component's local
 * state. It is never written anywhere (no table, log, localStorage, or URL),
 * so navigating away or reloading makes it permanently unrecoverable, which
 * is the whole point. Shown after both Create Admin (a new identity) and
 * Reset Password (an existing one, including one first linked via
 * `LinkedAdminNoticePanel` above). */
function PasswordRevealPanel({ heading, email, password, onDismiss }: { heading: string; email: string; password: string; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be unavailable (permissions/non-secure context) —
      // the password is still visible on screen to copy manually.
    }
  }

  return (
    <div className="rounded-panel border border-brand-primary bg-brand-soft p-6">
      <p className="text-sm font-bold uppercase tracking-[0.06em] text-brand-primary">{heading}</p>
      <dl className="mt-4 flex flex-col gap-4 text-sm">
        <div>
          <dt className="text-slate">Email</dt>
          <dd className="mt-0.5 font-semibold text-navy">{email}</dd>
        </div>
        <div>
          <dt className="text-slate">Temporary password</dt>
          <dd className="mt-1.5 flex flex-wrap items-center gap-2">
            <code className="rounded-control border border-steel bg-surface px-3 py-2 font-mono text-sm text-navy">{password}</code>
            <button type="button" onClick={handleCopy} className="rounded-control border border-steel bg-surface px-3 py-2 text-sm font-semibold text-navy hover:border-navy">
              {copied ? "Copied" : "Copy password"}
            </button>
          </dd>
        </div>
      </dl>
      <p className="mt-5 text-sm text-ink">
        Share this password securely with the administrator. They will be required to create a new password after their first login. This password will not be shown again.
      </p>
      <button type="button" onClick={onDismiss} className="mt-5 rounded-control bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-copper">
        Done
      </button>
    </div>
  );
}
