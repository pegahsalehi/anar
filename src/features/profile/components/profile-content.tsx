"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
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
import { deleteAccountAction } from "@/features/profile/delete-account-action";
import { saveProfileIdentityAction } from "@/features/profile/actions";
import { ProfilePasswordForm } from "@/features/profile/components/profile-password-form";
import {
  initialDeleteAccountActionState,
  initialProfileIdentityActionState,
  type ProfileIdentityValues,
  type ProfilePageData,
  type ProfileStatsData,
} from "@/features/profile/types";
import { formatInteger } from "@/lib/format";
import { cn } from "@/lib/utils";

type ProfileContentProps = {
  data: ProfilePageData;
};

export function ProfileContent({ data }: ProfileContentProps) {
  const [profile, setProfile] = useState<ProfileIdentityValues>({
    avatarId: data.avatarId,
    displayName: data.displayName,
    email: data.email,
  });
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setProfile({
      avatarId: data.avatarId,
      displayName: data.displayName,
      email: data.email,
    });
  }, [data.avatarId, data.displayName, data.email]);

  function openEditor() {
    setIsEditorOpen(true);
  }

  return (
    <>
      <ProfileHeader
        avatarId={profile.avatarId}
        displayName={profile.displayName}
        memberSince={data.memberSince}
        onEdit={openEditor}
      />
      <ProfileStats stats={data.stats} />
      <PersonalInformationCard
        displayName={profile.displayName}
        email={profile.email}
        memberSince={data.memberSince}
      />
      <AccountSecurityCard />
      <DeleteAccountDangerZone />
      {isEditorOpen ? (
        <ProfileEditorModal
          initialValues={profile}
          onClose={() => setIsEditorOpen(false)}
          onSaved={(nextProfile, message) => {
            setProfile(nextProfile);
            setToastMessage(message);
          }}
        />
      ) : null}
      {toastMessage ? (
        <ProfileToast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      ) : null}
    </>
  );
}

function DeleteAccountDangerZone() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  function closeDialog() {
    setIsDialogOpen(false);
    window.requestAnimationFrame(() => deleteButtonRef.current?.focus());
  }

  return (
    <section
      aria-labelledby="delete-account-title"
      className="rounded-md border border-[#F4B5B5] bg-card p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-lg font-semibold text-card-foreground" id="delete-account-title">
            Delete account
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Permanently delete your account, nutrition history, saved foods, uploaded images, and
            profile data. This action cannot be undone.
          </p>
        </div>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#DE2624] px-5 py-2.5 text-sm font-semibold text-[#B51E1C] transition hover:bg-[#DE2624]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DE2624]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          onClick={() => setIsDialogOpen(true)}
          ref={deleteButtonRef}
          type="button"
        >
          Delete account
        </button>
      </div>

      {isDialogOpen ? <DeleteAccountModal onCancel={closeDialog} /> : null}
    </section>
  );
}

function DeleteAccountModal({ onCancel }: { onCancel: () => void }) {
  const [state, formAction, isPending] = useActionState(
    deleteAccountAction,
    initialDeleteAccountActionState,
  );
  const [confirmation, setConfirmation] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmationInputRef = useRef<HTMLInputElement>(null);
  const canDelete = confirmation === "DELETE";

  useEffect(() => {
    window.requestAnimationFrame(() => confirmationInputRef.current?.focus());
  }, []);

  function handleCancel() {
    if (isPending) {
      return;
    }

    onCancel();
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

  return (
    <div
      aria-labelledby="delete-account-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 px-4 py-6 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
      role="dialog"
    >
      <div
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-md border border-[#F4B5B5] bg-card p-5 shadow-soft sm:p-6"
        ref={dialogRef}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              className="text-lg font-semibold text-card-foreground"
              id="delete-account-dialog-title"
            >
              Delete your account?
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This will permanently delete your account and all associated data. This action cannot
              be undone.
            </p>
          </div>
          <button
            aria-label="Close delete account dialog"
            className="flex h-9 w-9 items-center justify-center rounded-sm text-muted-foreground transition hover:bg-surface-soft hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={isPending}
            onClick={handleCancel}
            type="button"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <form action={formAction} className="mt-5 space-y-5">
          {state.message ? (
            <p
              aria-live="assertive"
              className="rounded-md border border-[#DE2624]/20 bg-[#DE2624]/[0.08] px-3.5 py-3 text-sm font-medium leading-6 text-[#B51E1C]"
              role="alert"
            >
              {state.message}
            </p>
          ) : null}

          <label className="block">
            <span className="text-sm font-semibold text-foreground">Type DELETE to confirm</span>
            <input
              aria-describedby={
                state.fieldErrors.confirmation ? "delete-account-confirmation-error" : undefined
              }
              aria-invalid={Boolean(state.fieldErrors.confirmation)}
              autoComplete="off"
              className={cn(
                "mt-2 min-h-12 w-full rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15",
                state.fieldErrors.confirmation &&
                  "border-[#DE2624] focus:border-[#DE2624] focus:ring-[#DE2624]/15",
              )}
              name="confirmation"
              onChange={(event) => setConfirmation(event.currentTarget.value)}
              ref={confirmationInputRef}
              value={confirmation}
            />
            {state.fieldErrors.confirmation ? (
              <span
                className="mt-1.5 block text-xs font-medium text-[#B51E1C]"
                id="delete-account-confirmation-error"
                role="alert"
              >
                {state.fieldErrors.confirmation}
              </span>
            ) : null}
          </label>

          <p aria-live="polite" className="text-sm font-medium text-muted-foreground" role="status">
            {isPending ? "Deleting account..." : ""}
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              disabled={isPending}
              onClick={handleCancel}
              type="button"
            >
              Cancel
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#DE2624] px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-[#B51E1C] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DE2624]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              disabled={isPending || !canDelete}
              type="submit"
            >
              {isPending ? "Deleting..." : "Permanently delete account"}
            </button>
          </div>
        </form>
      </div>
    </div>
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
}: {
  displayName: string;
  email: string;
  memberSince: string;
}) {
  return (
    <section className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-lg font-semibold text-card-foreground">Personal information</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Review the account details connected to your profile.
        </p>
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
  onClose,
  onSaved,
}: {
  initialValues: ProfileIdentityValues;
  onClose: () => void;
  onSaved: (values: ProfileIdentityValues, message: string) => void;
}) {
  const [state, formAction] = useActionState(
    saveProfileIdentityAction,
    initialProfileIdentityActionState,
  );
  const [draftValues, setDraftValues] = useState(initialValues);
  const dialogRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const avatarGroupRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const processedProfileStateRef = useRef<ProfileIdentityValues | null>(null);
  const router = useRouter();
  const hasChanges =
    draftValues.avatarId !== initialValues.avatarId ||
    draftValues.displayName.trim() !== initialValues.displayName ||
    normalizeEmail(draftValues.email) !== normalizeEmail(initialValues.email);

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    window.requestAnimationFrame(() => nameInputRef.current?.focus());

    return () => {
      previousFocusRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    if (!state.profile || processedProfileStateRef.current === state.profile) {
      return;
    }

    const shouldApplyProfile = state.status === "success" || state.profileUpdated;

    if (!shouldApplyProfile) {
      return;
    }

    processedProfileStateRef.current = state.profile;
    onSaved(
      state.profile,
      state.status === "success" ? (state.message ?? "Profile saved.") : "Profile details saved.",
    );
    router.refresh();

    if (state.status === "success") {
      onClose();
    }
  }, [onClose, onSaved, router, state.message, state.profile, state.profileUpdated, state.status]);

  useEffect(() => {
    if (state.status !== "error") {
      return;
    }

    if (state.fieldErrors.displayName) {
      nameInputRef.current?.focus();
      return;
    }

    if (state.fieldErrors.email) {
      emailInputRef.current?.focus();
      return;
    }

    if (state.fieldErrors.avatarId) {
      (
        avatarGroupRef.current?.querySelector<HTMLButtonElement>(
          '[data-avatar-button="selected"]',
        ) ?? avatarGroupRef.current?.querySelector<HTMLButtonElement>("[data-avatar-button]")
      )?.focus();
    }
  }, [state.fieldErrors, state.status]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!hasChanges) {
      event.preventDefault();
    }
  }

  function handleCancel() {
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
              Update your display name, email, and avatar.
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
          {state.profileError && state.profileError !== state.message ? (
            <p className="mt-3 rounded-md border border-coral/25 bg-coral/10 px-3.5 py-3 text-sm font-medium text-coral" role="alert">
              {state.profileError}
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
              onChange={(event) => {
                const value = event.currentTarget.value;

                setDraftValues((current) => ({
                  ...current,
                  displayName: value,
                }));
              }}
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

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-foreground">Email</span>
            <input
              aria-describedby={state.fieldErrors.email ? "profile-email-error" : undefined}
              aria-invalid={Boolean(state.fieldErrors.email)}
              autoComplete="email"
              className={cn(
                "mt-2 min-h-12 w-full rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15",
                state.fieldErrors.email && "border-coral focus:border-coral focus:ring-coral/15",
              )}
              name="email"
              onChange={(event) => {
                const value = event.currentTarget.value;

                setDraftValues((current) => ({
                  ...current,
                  email: value,
                }));
              }}
              ref={emailInputRef}
              type="email"
              value={draftValues.email}
            />
            {state.fieldErrors.email ? (
              <span
                className="mt-1.5 block text-xs font-medium text-coral"
                id="profile-email-error"
                role="alert"
              >
                {state.fieldErrors.email}
              </span>
            ) : null}
          </label>

          <AvatarPicker
            error={state.fieldErrors.avatarId}
            onChange={(avatarId) => {
              setDraftValues((current) => ({
                ...current,
                avatarId,
              }));
            }}
            groupRef={avatarGroupRef}
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
  groupRef,
  onChange,
  value,
}: {
  error?: string;
  groupRef: RefObject<HTMLDivElement | null>;
  onChange: (avatarId: AvatarId) => void;
  value: AvatarId;
}) {
  return (
    <fieldset className="mt-5">
      <legend className="text-sm font-semibold text-foreground">Avatar</legend>
      <input name="avatarId" type="hidden" value={value} />
      <div
        aria-describedby={error ? "profile-avatar-error" : undefined}
        className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3"
        ref={groupRef}
      >
        {avatarOptions.map((avatar) => {
          const isSelected = avatar.id === value;

          return (
            <button
              aria-pressed={isSelected}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-2 rounded-md border bg-surface-soft p-3 text-center text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                isSelected
                  ? "scale-[1.02] border-primary bg-primary/10 text-foreground shadow-sm"
                  : "border-soft-border text-muted-foreground hover:border-primary/45 hover:bg-card hover:text-foreground",
              )}
              data-avatar-button={isSelected ? "selected" : "option"}
              key={avatar.id}
              onClick={() => onChange(avatar.id)}
              type="button"
            >
              <UserAvatar avatarId={avatar.id} isSelected={isSelected} size="lg" />
              <span>{avatar.label}</span>
            </button>
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

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function getFocusableElements(element: HTMLElement) {
  return Array.from(
    element.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((item) => !item.hasAttribute("disabled") && !item.getAttribute("aria-hidden"));
}
