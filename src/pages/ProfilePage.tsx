import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, PawPrint, Pencil, RotateCcw, Save } from 'lucide-react';
import { SafetyNotice } from '@/components/common/SafetyNotice';
import { PageHeading } from '@/components/layout/PageHeading';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAppData } from '@/context/appData';
import { useToast } from '@/context/toast';
import { cn, formatCount, speciesLabel } from '@/lib/utils';
import type { PrivacySettings, ProfileDraft } from '@/types';

const NAME_MAX = 40;
const CITY_MAX = 60;
const BIO_MAX = 240;

interface PrivacyRow {
  key: keyof PrivacySettings;
  label: string;
  description: string;
}

const PRIVACY_ROWS: PrivacyRow[] = [
  {
    key: 'showCity',
    label: 'Show my city',
    description:
      'Broad city level only. Atronz never asks for or stores a precise location, and uses no GPS.',
  },
  {
    key: 'allowContactRequests',
    label: 'Allow contact requests',
    description:
      'Other owners can ask to connect. Accepting still shares no contact details.',
  },
  {
    key: 'discoverable',
    label: 'Show my pets in Discover',
    description:
      'Off by default and never enabled for you. Each pet also has its own switch on My Pets.',
  },
];

/**
 * Profile — the local demo account.
 *
 * There is no sign-in, password, email verification or payment here, and no
 * external account to connect. Edits write to the same owner record the header
 * reads, so the two can never drift apart.
 */
export function ProfilePage() {
  const {
    owner,
    pets,
    privacy,
    setPrivacy,
    status,
    activePetId,
    updateProfile,
    resetDemoData,
  } = useAppData();
  const { showToast } = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<ProfileDraft>({ name: '', bio: '', city: '' });
  const [attempted, setAttempted] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  /* A ref, not state: four synchronous saves all read the same rendered value,
     so only a ref stops the second one writing again. */
  const savingRef = useRef(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editOpen || !owner) return;
    setDraft({ name: owner.name, bio: owner.bio, city: owner.city });
    setAttempted(false);
    savingRef.current = false;
    setSaving(false);
  }, [editOpen, owner]);

  const nameError = !draft.name.trim()
    ? 'Add a display name.'
    : draft.name.trim().length > NAME_MAX
      ? `Keep the name under ${NAME_MAX} characters.`
      : undefined;
  const cityError = !draft.city.trim()
    ? 'Add a city. City level only — never an address.'
    : draft.city.trim().length > CITY_MAX
      ? `Keep the city under ${CITY_MAX} characters.`
      : undefined;
  const bioError =
    draft.bio.length > BIO_MAX ? `Keep the bio under ${BIO_MAX} characters.` : undefined;
  const valid = !nameError && !cityError && !bioError;

  const handleSave = useCallback(() => {
    setAttempted(true);
    if (!valid) return;
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);

    const updated = updateProfile(draft);
    setEditOpen(false);
    if (!updated) {
      showToast({
        tone: 'warning',
        title: 'Profile not saved',
        description: 'Check the highlighted fields and try again.',
      });
      return;
    }
    showToast({
      tone: 'success',
      title: 'Profile updated',
      description: 'Saved on this device only.',
    });
    setAnnouncement(`Profile updated. You are shown as ${updated.name}.`);
  }, [valid, draft, updateProfile, showToast]);

  const handleReset = useCallback(() => {
    resetDemoData();
    setResetOpen(false);
    showToast({
      tone: 'info',
      title: 'Demo data reset',
      description: 'Every session-local change has been restored to the mock state.',
    });
    setAnnouncement('Demo data reset. Session-local changes were restored.');
  }, [resetDemoData, showToast]);

  if (status === 'loading' || !owner) {
    return (
      <div>
        <PageHeading eyebrow="You" title="Profile" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  const activePet = pets.find((pet) => pet.id === activePetId) ?? null;

  return (
    <div>
      <PageHeading
        eyebrow="You"
        title="Profile"
        description="How other owners see you in this demo, and what you choose to share."
        action={<Badge tone="accent">Demo profile · no account</Badge>}
      />

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar name={owner.name} size="3xl" shape="rounded" className="self-start" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start gap-2">
              <h2 className="min-w-0 flex-1 break-words text-xl font-semibold tracking-tight text-charcoal-900">
                {owner.name}
              </h2>
              <Button
                variant="secondary"
                size="sm"
                icon={Pencil}
                onClick={() => setEditOpen(true)}
              >
                Edit profile
              </Button>
            </div>
            <p className="break-words text-sm text-charcoal-500">{owner.handle}</p>
            {privacy.showCity ? (
              <p className="mt-1.5 flex items-center gap-1 text-sm text-charcoal-500">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="min-w-0 break-words">{owner.city}</span>
              </p>
            ) : (
              <p className="mt-1.5 text-sm text-charcoal-400">
                City hidden — turn on “Show my city” below to share it.
              </p>
            )}
            <p className="mt-3 break-words text-sm leading-relaxed text-charcoal-600">
              {owner.bio}
            </p>

            <dl className="mt-4 flex flex-wrap gap-2">
              <Stat label="Pets" value={String(pets.length)} />
              <Stat label="Followers" value={formatCount(owner.followers)} />
              <Stat label="Following" value={formatCount(owner.following)} />
              <Stat label="Member since" value={String(owner.joinedYear)} />
            </dl>
          </div>
        </div>
      </Card>

      <div className="mt-6">
        <SectionHeader
          title="Your pets"
          description="Managed on the My Pets page."
        />
        <Card>
          {pets.length === 0 ? (
            <p className="text-sm text-charcoal-500">
              No pets yet.{' '}
              <Link
                to="/pets"
                className="font-medium text-clay-700 underline underline-offset-2"
              >
                Add your first pet
              </Link>
              .
            </p>
          ) : (
            <>
              <ul className="space-y-2">
                {pets.map((pet) => (
                  <li key={pet.id} className="flex items-center gap-3">
                    <Avatar name={pet.name} size="md" shape="rounded" />
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-medium text-charcoal-800">
                        {pet.name}
                        {pet.id === activePetId ? (
                          <span className="ml-2 align-middle">
                            <Badge tone="accent">Active</Badge>
                          </span>
                        ) : null}
                      </p>
                      <p className="break-words text-xs text-charcoal-500">
                        {speciesLabel(pet.species)} · {pet.breed}
                      </p>
                    </div>
                    <Badge tone={pet.openToMating ? 'accent' : 'neutral'}>
                      {pet.openToMating ? 'In Discover' : 'Hidden'}
                    </Badge>
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-cream-200 pt-3 text-xs text-charcoal-400">
                {activePet
                  ? `${activePet.name} is your active pet, used as the default elsewhere.`
                  : 'No active pet is selected. Choose one on My Pets.'}
              </p>
              {/* A styled Link, not a Button wrapping one — a button containing
                  an anchor is invalid HTML and confuses assistive tech. */}
              <Link
                to="/pets"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-cream-300 bg-white px-3 py-1.5 text-[13px] font-medium text-charcoal-700 transition hover:border-clay-200 hover:text-charcoal-900"
              >
                <PawPrint className="h-3.5 w-3.5" aria-hidden="true" />
                Manage pets
              </Link>
            </>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <SectionHeader
          title="Privacy and safety"
          description="Every switch defaults to the private option."
        />
        <Card padded={false}>
          <ul className="divide-y divide-cream-200">
            {PRIVACY_ROWS.map((row) => (
              <li key={row.key}>
                <label className="flex cursor-pointer items-start gap-3 p-4">
                  <input
                    type="checkbox"
                    checked={privacy[row.key]}
                    onChange={(event) => {
                      setPrivacy({ [row.key]: event.target.checked });
                      setAnnouncement(
                        `${row.label} turned ${event.target.checked ? 'on' : 'off'}.`,
                      );
                    }}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      'mt-0.5 flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition',
                      privacy[row.key] ? 'bg-clay-700' : 'bg-cream-300',
                      'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-clay-700',
                    )}
                  >
                    <span
                      className={cn(
                        'h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                        privacy[row.key] ? 'translate-x-4' : 'translate-x-0',
                      )}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-charcoal-800">
                      {row.label}
                    </span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-charcoal-500">
                      {row.description}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </Card>
        <p className="mt-2 text-xs text-charcoal-400">
          These switches are local to this session and are not saved anywhere.
        </p>
      </div>

      <SafetyNotice title="Demo mode — no account, no tracking" className="mt-6">
        This is a local demo profile, not a signed-in account. There is no
        password, email verification, payment method or external service
        connected. Atronz Pet Social uses no GPS or location permission, sends
        no messages or emails on your behalf, and stores nothing outside this
        browser session. Nearby matching compares city names in demo data only.
      </SafetyNotice>

      <div className="mt-6">
        <SectionHeader
          title="Demo controls"
          description="Nothing here touches a real account."
        />
        <Card>
          <p className="text-sm leading-relaxed text-charcoal-600">
            Resetting restores the deterministic mock data: your profile, pets,
            posts, interests and connections, adoption applications, booking
            requests, saved items, the demo cart, notifications and
            conversations, plus every block and report you made in this session.
          </p>
          <Button
            variant="danger"
            size="sm"
            icon={RotateCcw}
            className="mt-3"
            onClick={() => setResetOpen(true)}
          >
            Reset demo data
          </Button>
          <p className="mt-2 text-xs text-charcoal-400">
            Asks for confirmation first — a single click never resets anything.
          </p>
        </Card>
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit profile"
        description="Local demo details. No email, phone or password is involved."
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setEditOpen(false)}
              block
              className="sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              icon={Save}
              onClick={handleSave}
              disabled={saving}
              block
              className="sm:w-auto"
            >
              Save changes
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="profile-name"
              className="block text-sm font-medium text-charcoal-800"
            >
              Display name
            </label>
            <input
              id="profile-name"
              type="text"
              value={draft.name}
              maxLength={NAME_MAX}
              onChange={(event) =>
                setDraft((current) => ({ ...current, name: event.target.value }))
              }
              aria-invalid={attempted && nameError ? true : undefined}
              aria-describedby={attempted && nameError ? 'profile-name-error' : undefined}
              className="mt-1.5 h-11 w-full rounded-2xl border border-cream-300 bg-white px-3 text-sm text-charcoal-800 transition hover:border-clay-200"
            />
            {attempted && nameError ? (
              <p id="profile-name-error" role="alert" className="mt-1.5 text-xs text-red-700">
                {nameError}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="profile-city"
              className="block text-sm font-medium text-charcoal-800"
            >
              City
            </label>
            <p id="profile-city-hint" className="mt-0.5 text-xs text-charcoal-400">
              City only. Never enter a street, building or postcode.
            </p>
            <input
              id="profile-city"
              type="text"
              value={draft.city}
              maxLength={CITY_MAX}
              onChange={(event) =>
                setDraft((current) => ({ ...current, city: event.target.value }))
              }
              aria-invalid={attempted && cityError ? true : undefined}
              aria-describedby={
                attempted && cityError
                  ? 'profile-city-hint profile-city-error'
                  : 'profile-city-hint'
              }
              className="mt-1.5 h-11 w-full rounded-2xl border border-cream-300 bg-white px-3 text-sm text-charcoal-800 transition hover:border-clay-200"
            />
            {attempted && cityError ? (
              <p id="profile-city-error" role="alert" className="mt-1.5 text-xs text-red-700">
                {cityError}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="profile-bio"
              className="block text-sm font-medium text-charcoal-800"
            >
              Bio <span className="font-normal text-charcoal-400">(optional)</span>
            </label>
            <textarea
              id="profile-bio"
              value={draft.bio}
              rows={3}
              onChange={(event) =>
                setDraft((current) => ({ ...current, bio: event.target.value }))
              }
              aria-invalid={attempted && bioError ? true : undefined}
              aria-describedby="profile-bio-count"
              className="mt-1.5 w-full resize-none rounded-2xl border border-cream-300 bg-white px-3 py-2.5 text-sm leading-relaxed text-charcoal-800 transition hover:border-clay-200"
            />
            <div className="mt-1.5 flex items-start justify-between gap-3">
              {attempted && bioError ? (
                <p role="alert" className="text-xs text-red-700">
                  {bioError}
                </p>
              ) : (
                <span />
              )}
              <p
                id="profile-bio-count"
                className={cn(
                  'shrink-0 text-xs tabular-nums',
                  draft.bio.length > BIO_MAX
                    ? 'font-semibold text-red-700'
                    : 'text-charcoal-400',
                )}
              >
                {draft.bio.length}/{BIO_MAX}
              </p>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={resetOpen}
        title="Reset all demo data?"
        description="Your profile edits, pets, posts, likes and comments, interests and connections, adoption applications, booking requests, saved items, demo cart, notifications, conversations, blocks and reports will all be restored to the original mock data. This cannot be undone."
        confirmLabel="Reset demo data"
        destructive
        onConfirm={handleReset}
        onCancel={() => setResetOpen(false)}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-cream-300 bg-cream-50 px-3 py-2">
      <dt className="text-[10px] uppercase tracking-wide text-charcoal-400">
        {label}
      </dt>
      <dd className="text-sm font-semibold text-charcoal-800">{value}</dd>
    </div>
  );
}
