import {
  Ban,
  Bookmark,
  Flag,
  HeartHandshake,
  ListChecks,
  MapPin,
  Undo2,
} from 'lucide-react';
import { PetPhoto } from '@/components/discovery/PetPhoto';
import { SafetyNotice } from '@/components/common/SafetyNotice';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  adoptionStatusLabel,
  adoptionStatusTone,
  canApply,
  listerLabel,
} from '@/lib/adoption';
import { ageLabel, ownerProvidedVaccinationLabel } from '@/lib/discovery';
import { formatRelativeTime } from '@/lib/feed';
import { speciesLabel } from '@/lib/utils';
import type { AdoptionApplication, AdoptionListing } from '@/types';

export interface AdoptionDetailDialogProps {
  listing: AdoptionListing | null;
  application: AdoptionApplication | null;
  saved: boolean;
  onClose: () => void;
  onApply: () => void;
  onWithdrawApplication: () => void;
  onToggleSave: () => void;
  onReport: () => void;
  onBlock: () => void;
}

/** The adoption process, stated once so it is the same on every listing. */
const PROCESS_STEPS = [
  'Send a demo application from this screen.',
  'The lister would normally review it and reply — in this preview, nobody is contacted.',
  'You arrange to meet the pet in a safe public place, at your own initiative.',
  'You verify identity, ownership, health and vaccination records yourself, with your own vet.',
  'Any real adoption happens directly between you and the lister, outside this app.',
];

/**
 * Full listing detail.
 *
 * A bottom sheet on mobile and a dialog above `sm`, from the shared Modal — so
 * Escape, the focus trap and focus restoration all behave as elsewhere.
 */
export function AdoptionDetailDialog({
  listing,
  application,
  saved,
  onClose,
  onApply,
  onWithdrawApplication,
  onToggleSave,
  onReport,
  onBlock,
}: AdoptionDetailDialogProps) {
  if (!listing) return null;

  const applyable = canApply(listing);
  const hasApplied = application !== null;

  return (
    <Modal
      open
      onClose={onClose}
      title={listing.name}
      description={`${speciesLabel(listing.species)} · ${listing.breed}`}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} block className="sm:w-auto">
            Close
          </Button>
          <Button
            variant="secondary"
            icon={Bookmark}
            onClick={onToggleSave}
            aria-pressed={saved}
            block
            className="sm:w-auto"
          >
            {saved ? 'Saved' : 'Save listing'}
          </Button>
          {hasApplied ? (
            <Button
              variant="secondary"
              icon={Undo2}
              onClick={onWithdrawApplication}
              block
              className="sm:w-auto"
            >
              Withdraw application
            </Button>
          ) : applyable ? (
            <Button
              icon={HeartHandshake}
              onClick={onApply}
              block
              className="sm:w-auto"
            >
              Apply to adopt
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={adoptionStatusTone(listing.status)}>
            {adoptionStatusLabel(listing.status)}
          </Badge>
          {hasApplied ? <Badge tone="positive">You applied</Badge> : null}
          {saved ? <Badge tone="accent">Saved</Badge> : null}
          <span className="text-xs text-charcoal-400">
            Listed <time dateTime={new Date(listing.listedAt).toISOString()}>
              {formatRelativeTime(listing.listedAt)}
            </time>
          </span>
        </div>

        {listing.photos.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {listing.photos.map((photo) => (
              <PetPhoto
                key={photo.id}
                photo={photo}
                fallbackAlt={`Photo of ${listing.name}`}
                className="aspect-[4/3] w-full rounded-xl border border-cream-200"
              />
            ))}
          </div>
        ) : (
          <PetPhoto
            photo={undefined}
            fallbackAlt={`No photo shared for ${listing.name}`}
            className="aspect-[16/9] w-full rounded-xl border border-cream-200"
          />
        )}

        <section>
          <h3 className="text-sm font-semibold text-charcoal-800">Details</h3>
          <dl className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Detail label="Species" value={speciesLabel(listing.species)} />
            <Detail label="Breed" value={listing.breed} />
            <Detail label="Age" value={ageLabel(listing)} />
            <Detail
              label="Gender"
              value={listing.sex === 'female' ? 'Female' : 'Male'}
            />
            <Detail
              label="Size"
              value={listing.size.charAt(0).toUpperCase() + listing.size.slice(1)}
            />
            <Detail label="Status" value={adoptionStatusLabel(listing.status)} />
          </dl>
          <p className="mt-2 flex items-start gap-1.5 text-sm text-charcoal-500">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 break-words">
              {listing.city} — city only, no precise location
            </span>
          </p>
          <p className="mt-1 break-words text-sm text-charcoal-500">
            {listerLabel(listing.listerKind)}:{' '}
            <span className="text-charcoal-700">{listing.listerName}</span>
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-charcoal-800">
            Lister-provided description
          </h3>
          <p className="mt-1.5 break-words text-sm leading-relaxed text-charcoal-600">
            {listing.description}
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-charcoal-800">
            Lister-provided health information
          </h3>
          <p className="mt-1.5 text-sm text-charcoal-600">
            {ownerProvidedVaccinationLabel(listing.vaccination)}.
          </p>
          <p className="mt-1 break-words text-sm text-charcoal-600">
            {listing.healthNotes}
          </p>
          <p className="mt-1.5 text-xs text-charcoal-400">
            Unverified. Atronz performs no screening and holds no veterinary
            record for this pet.
          </p>
        </section>

        {/* Only rendered when the lister actually described care needs. */}
        {listing.careNeeds.length > 0 ? (
          <section>
            <h3 className="text-sm font-semibold text-charcoal-800">
              Care requirements the lister described
            </h3>
            <ul className="mt-2 space-y-1.5">
              {listing.careNeeds.map((need) => (
                <li key={need} className="flex items-start gap-2 text-sm">
                  <ListChecks
                    className="mt-0.5 h-4 w-4 shrink-0 text-clay-600"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 break-words text-charcoal-600">
                    {need}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section>
          <h3 className="text-sm font-semibold text-charcoal-800">
            How adoption works here
          </h3>
          <ol className="mt-2 space-y-1.5">
            {PROCESS_STEPS.map((step, index) => (
              <li key={step} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cream-200 text-[11px] font-semibold text-charcoal-600">
                  {index + 1}
                </span>
                <span className="min-w-0 break-words text-charcoal-600">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <SafetyNotice title="Demo listing — verify everything yourself">
          This listing is placeholder data in a preview build. Atronz does not
          verify identity, ownership, health, vaccination or suitability, and
          guarantees nothing about a pet's health, behaviour, fertility,
          genetics or the outcome of any adoption. Applications here are
          session-local and reach no organisation.
        </SafetyNotice>

        <section className="border-t border-cream-200 pt-3">
          <h3 className="text-sm font-semibold text-charcoal-800">
            Safety controls
          </h3>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Button
              variant="secondary"
              size="sm"
              icon={Flag}
              onClick={onReport}
              block
              className="sm:w-auto"
            >
              Report this listing
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={Ban}
              onClick={onBlock}
              block
              className="sm:w-auto"
            >
              Block this listing
            </Button>
          </div>
          <p className="mt-1.5 text-xs text-charcoal-400">
            Blocking removes this listing from Adoption, including your saved
            listings.
          </p>
        </section>
      </div>
    </Modal>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-cream-200 bg-cream-50 px-3 py-2">
      <dt className="text-[10px] uppercase tracking-wide text-charcoal-400">
        {label}
      </dt>
      <dd className="break-words text-sm font-medium text-charcoal-800">
        {value}
      </dd>
    </div>
  );
}
