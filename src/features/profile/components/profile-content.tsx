"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { UserAvatar } from "@/components/user/user-avatar";
import { LogoutButton } from "@/features/auth/components/logout-button";
import {
  avatarOptions,
  type AvatarId,
} from "@/features/profile/avatar-options";
import { saveProfileIdentityAction } from "@/features/profile/actions";
import { ProfilePasswordForm } from "@/features/profile/components/profile-password-form";
import {
  initialProfileIdentityActionState,
  type ProfilePageData,
  type ProfileStatsData,
} from "@/features/profile/types";
import { formatInteger } from "@/lib/format";
import { cn } from "@/lib/utils";

type ProfileContentProps = {
  data: ProfilePageData;
};

type ProfileIdentityValues = {
  avatarId: AvatarId;
  displayName: string;
};

export function ProfileContent({ data }: ProfileContentProps) {
  const [identity, setIdentity] = useState<ProfileIdentityValues>({
    avatarId: data.avatarId,
    displayName: data.displayName,
  });
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function openEditor() {
    setIsEditorOpen(true);
  }

  return (
    <>
      <ProfileHeader
        avatarId={identity.avatarId}
        displayName={identity.displayName}
        memberSince={data.memberSince}
        onEdit={openEditor}
      />
      <ProfileStats stats={data.stats} />
      <PersonalInformationCard
        displayName={identity.displayName}
        email={data.email}
        memberSince={data.memberSince}
        onEdit={openEditor}
      />
      <AccountSecurityCard />
      <ProfileEditorModal
        initialValues={identity}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSaved={(nextIdentity, message) => {
          setIdentity(nextIdentity);
          setToastMessage(message);
        }}
      />
      {toastMessage ? (
        <ProfileToast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      ) : null}
    </>
  );
}

function ProfileHeader({
  avatarId,
  displayName,
  memberSince,
  onEdit,
}: {
  avatarId: AvatarId;
  displayName: string;
  memberSince: string;
  onEdit: () => void;
}) {
  return (
    <section className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <UserAvatar avatarId={avatarId} size="xl" />
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold leading-tight text-card-foreground sm:text-3xl">
              {displayName}
            </h2>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              {formatTrackingSince(memberSince)}
            </p>
          </div>
        </div>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-[#49C995] active:bg-[#38B982] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          onClick={onEdit}
          type="button"
        >
          Edit profile
        </button>
      </div>
    </section>
  );
}

function ProfileStats({ stats }: { stats: ProfileStatsData }) {
  const items = [
    {
      label: "Current streak",
      value: `${formatInteger(stats.currentStreak)} ${
        stats.currentStreak === 1 ? "day" : "days"
      }`,
    },
    {
      label: "Active days",
      value: formatInteger(stats.activeDays),
    },
    {
      label: "Foods logged",
      value: formatInteger(stats.foodsLogged),
    },
  ];

  return (
    <section aria-label="Profile statistics" className="grid gap-3 md:grid-cols-3">
      {items.map((item) => (
        <article
          className="rounded-md border border-border bg-card p-4 shadow-sm"
          key={item.label}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {item.label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-card-foreground">{item.value}</p>
        </article>
      ))}
    </section>
  );
}

function PersonalInformationCard({
  displayName,
  email,
  memberSince,
  onEdit,
}: {
  displayName: string;
  email: string;
  memberSince: string;
  onEdit: () => void;
}) {
  return (
    <section className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-card-foreground">Personal information</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Keep your profile name and avatar up to date.
          </p>
        </div>
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/50 hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={onEdit}
          type="button"
        >
          Edit
        </button>
      </div>
      <dl className="mt-5 grid gap-4 text-sm md:grid-cols-3">
        <InfoItem label="Display name" value={displayName} />
        <InfoItem label="Email" value={email || "No email available"} />
        <InfoItem label="Member since" value={formatMemberSince(memberSince)} />
      </dl>
    </section>
  );
}

function AccountSecurityCard() {
  return (
    <section className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-lg font-semibold text-card-foreground">Account & security</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Update your password or sign out of this account.
        </p>
      </div>

      <ProfilePasswordForm />

      <div className="mt-6 border-t border-border pt-5">
        <h3 className="text-sm font-semibold text-card-foreground">Account actions</h3>
        <div className="mt-3">
          <LogoutButton />
        </div>
      </div>
    </section>
  );
}

function ProfileEditorModal({
  initialValues,
  isOpen,
  onClose,
  onSaved,
}: {
  initialValues: ProfileIdentityValues;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (values: ProfileIdentityValues, message: string) => void;
}) {
  const [state, formAction] = useActionState(
    saveProfileIdentityAction,
    initialProfileIdentityActionState,
  );
  const [draftValues, setDraftValues] = useState(initialValues);
  const pendingValuesRef = useRef<ProfileIdentityValues | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const router = useRouter();
  const hasChanges =
    draftValues.avatarId !== initialValues.avatarId ||
    draftValues.displayName !== initialValues.displayName;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    setDraftValues(initialValues);
    window.requestAnimationFrame(() => nameInputRef.current?.focus());

    return () => {
      previousFocusRef.current?.focus();
    };
  }, [initialValues, isOpen]);

  useEffect(() => {
    if (state.status === "success" && pendingValuesRef.current) {
      const nextValues = pendingValuesRef.current;
      pendingValuesRef.current = null;
      onSaved(nextValues, state.message ?? "Profile saved.");
      onClose();
      router.refresh();
    }
  }, [onClose, onSaved, router, state.message, state.status]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!hasChanges) {
      event.preventDefault();
      return;
    }

    pendingValuesRef.current = {
      avatarId: draftValues.avatarId,
      displayName: draftValues.displayName.trim(),
    };
  }

  function handleCancel() {
    pendingValuesRef.current = null;
    setDraftValues(initialValues);
    onClose();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      handleCancel();
      return;
    }

    if (event.key !== "Tab" || !dialogRef.current) {
      return;
    }

    const focusable = getFocusableElements(dialogRef.current);
    const first = focusable[0];
    const last = focusable.at(-1);

    if (!first || !last) {
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-labelledby="profile-editor-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 px-4 py-6 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          handleCancel();
        }
      }}
      onKeyDown={handleKeyDown}
      role="dialog"
    >
      <div
        className="max-h-full w-full max-w-2xl overflow-y-auto rounded-md border border-border bg-card p-5 shadow-soft sm:p-6"
        ref={dialogRef}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="profile-editor-title" className="text-lg font-semibold text-card-foreground">
              Edit profile
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Choose your display name and one of nine avatars.
            </p>
          </div>
          <button
            aria-label="Close profile editor"
            className="flex h-9 w-9 items-center justify-center rounded-sm text-muted-foreground transition hover:bg-surface-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={handleCancel}
            type="button"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <form action={formAction} className="mt-5" onSubmit={handleSubmit}>
          {state.message && state.status === "error" ? (
            <p className="rounded-md border border-coral/25 bg-coral/10 px-3.5 py-3 text-sm font-medium text-coral" role="alert">
              {state.message}
            </p>
          ) : null}

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-foreground">Display name</span>
            <input
              aria-describedby={state.fieldErrors.displayName ? "profile-display-name-error" : undefined}
              aria-invalid={Boolean(state.fieldErrors.displayName)}
              className={cn(
                "mt-2 min-h-12 w-full rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15",
                state.fieldErrors.displayName && "border-coral focus:border-coral focus:ring-coral/15",
              )}
              name="displayName"
              onChange={(event) =>
                setDraftValues((current) => ({
                  ...current,
                  displayName: event.currentTarget.value,
                }))
              }
              ref={nameInputRef}
              value={draftValues.displayName}
            />
            {state.fieldErrors.displayName ? (
              <span
                className="mt-1.5 block text-xs font-medium text-coral"
                id="profile-display-name-error"
                role="alert"
              >
                {state.fieldErrors.displayName}
              </span>
            ) : null}
          </label>

          <AvatarPicker
            error={state.fieldErrors.avatarId}
            onChange={(avatarId) =>
              setDraftValues((current) => ({
                ...current,
                avatarId,
              }))
            }
            value={draftValues.avatarId}
          />

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={handleCancel}
              type="button"
            >
              Cancel
            </button>
            <ProfileSaveButton disabled={!hasChanges} />
          </div>
        </form>
      </div>
    </div>
  );
}

function AvatarPicker({
  error,
  onChange,
  value,
}: {
  error?: string;
  onChange: (avatarId: AvatarId) => void;
  value: AvatarId;
}) {
  return (
    <fieldset className="mt-5">
      <legend className="text-sm font-semibold text-foreground">Avatar</legend>
      <div
        aria-describedby={error ? "profile-avatar-error" : undefined}
        className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3"
      >
        {avatarOptions.map((avatar) => {
          const isSelected = avatar.id === value;

          return (
            <label
              className={cn(
                "flex cursor-pointer flex-col items-center gap-2 rounded-md border bg-surface-soft p-3 text-center text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-card",
                isSelected
                  ? "scale-[1.02] border-primary bg-primary/10 text-foreground shadow-sm"
                  : "border-soft-border text-muted-foreground hover:border-primary/45 hover:bg-card hover:text-foreground",
              )}
              key={avatar.id}
            >
              <input
                checked={isSelected}
                className="sr-only"
                name="avatarId"
                onChange={() => onChange(avatar.id)}
                type="radio"
                value={avatar.id}
              />
              <UserAvatar avatarId={avatar.id} isSelected={isSelected} size="lg" />
              <span>{avatar.label}</span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-coral" id="profile-avatar-error" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

function ProfileSaveButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-[#49C995] active:bg-[#38B982] disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending || disabled}
      type="submit"
    >
      {pending ? "Saving..." : "Save profile"}
    </button>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-soft-border bg-surface-soft px-3 py-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 truncate font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function ProfileToast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, 3600);
    return () => window.clearTimeout(timeout);
  }, [onDismiss]);

  return (
    <div
      className="fixed bottom-5 right-5 z-[60] max-w-sm rounded-md border border-primary/35 bg-card px-4 py-3 text-sm font-semibold text-foreground shadow-soft"
      role="status"
    >
      {message}
    </div>
  );
}

function formatTrackingSince(value: string) {
  const label = formatMonthYear(value);
  return label ? `Tracking nutrition since ${label}` : "Tracking nutrition with Anar";
}

function formatMemberSince(value: string) {
  return formatReadableDate(value) || "Not available";
}

function formatMonthYear(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatReadableDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getFocusableElements(element: HTMLElement) {
  return Array.from(
    element.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((item) => !item.hasAttribute("disabled") && !item.getAttribute("aria-hidden"));
}
