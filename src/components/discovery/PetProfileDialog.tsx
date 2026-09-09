import {
  Ban,
  Check,
  Flag,
  Heart,
  MapPin,
  Minus,
  ThumbsDown,
  Undo2,
} from 'lucide-react';
import { PetPhoto } from '@/components/discovery/PetPhoto';
import { SafetyNotice } from '@/components/common/SafetyNotice';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ageLabel, ownerProvidedVaccinationLabel } from '@/lib/discovery';
import { interestStatusLabel, interestStatusTone } from '@/lib/matches';
import { speciesLabel } from '@/lib/utils';
import type {
  CompatibilityPreview,
  DiscoverablePet,
  PetRelationship,
} from '@/types';

export interface PetProfileDialogProps {
  pet: DiscoverablePet | null;
  compatibility: CompatibilityPreview;
  /**
   * How the viewer currently relates to this pet. Drives the status banner and
   * which footer action is offered, so Discover and Matches share one profile
   * implementation instead of forking it.
   */
  relationship: PetRelationship;
  onClose: () => void;
  onSendInterest?: () => void;
  onWithdrawInterest?: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
  onReport: () => void;
  onBlock: () => void;
}

/** One line of plain English per relationship state. */
function relationshipSummary(relationship: PetRelationship): string | null {
  const { status, direction } = relationship;
  if (!status) return null;
  switch (status) {
    case 'pending':
      return direction === 'received'
        ? 'This owner expressed interest in your pet. Nothing is shared unless you accept.'
        : 'You have a pending interest. The owner has not been contacted.';
    case 'accepted':
      return 'Connected. No phone number, email, address or location was shared.';
    case 'declined':
      return 'This interest was declined. Nothing was shared.';
    case 'withdrawn':
      return 'This interest was withdrawn.';
  }
}

/**
 * The full pet profile.
 *
 * A bottom sheet on mobile and a dialog on desktop, both from the shared
 * Modal, so Escape, the focus trap and focus restoration all come for free.
 *
 * Every descriptive field is prefixed as owner-provided. No contact detail is
 * rendered because the type carries none.
 */
export function PetProfileDialog({
  pet,
  compatibility,
  relationship,
  onClose,
  onSendInterest,
  onWithdrawInterest,
  onAccept,
  onDecline,
  onReport,
  onBlock,
}: PetProfileDialogProps) {
  if (!pet) return null;

  const hasComparison = compatibility.comparedWithPetId !== null;
  const { status, direction } = relationship;
  const summary = relationshipSummary(relationship);

  /*
   * Exactly one primary action is offered, chosen from the live status — so a
   * declined or accepted interest never shows an accept or withdraw control.
   */
  const pendingReceived = status === 'pending' && direction === 'received';
  const pendingSent = status === 'pending' && direction === 'sent';
  const canSend = !status || status === 'declined' || status === 'withdrawn';

  return (
    <Modal
      open
      onClose={onClose}
      title={pet.name}
      description={`${speciesLabel(pet.species)} · ${pet.breed}`}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} block className="sm:w-auto">
            Close
          </Button>
          {pendingReceived && onDecline ? (
            <Button
              variant="secondary"
              icon={ThumbsDown}
              onClick={onDecline}
              block
              className="sm:w-auto"
            >
              Decline
            </Button>
          ) : null}
          {pendingReceived && onAccept ? (
            <Button icon={Heart} onClick={onAccept} block className="sm:w-auto">
              Accept interest
            </Button>
          ) : null}
          {pendingSent && onWithdrawInterest ? (
            <Button
              variant="secondary"
              icon={Undo2}
              onClick={onWithdrawInterest}
              block
              className="sm:w-auto"
            >
              Withdraw interest
            </Button>
          ) : null}
          {canSend && onSendInterest ? (
            <Button icon={Heart} onClick={onSendInterest} block className="sm:w-auto">
              Send interest
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="space-y-4">
        {status && summary ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-cream-300 bg-cream-50 px-3 py-2.5">
            <Badge tone={interestStatusTone(status)}>
              {interestStatusLabel(status)}
              {direction ? ` · ${direction === 'received' ? 'received' : 'sent'}` : ''}
            </Badge>
            <p className="min-w-0 flex-1 break-words text-xs leading-relaxed text-charcoal-500">
              {summary}
              {/* Discover opens this dialog without accept/decline handlers, so
                  say where to act rather than leaving a dead end. */}
              {pendingReceived && !onAccept
                ? ' Accept or decline it on the Matches page.'
                : null}
            </p>
          </div>
        ) : null}

        {pet.photos.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {pet.photos.map((photo) => (
              <PetPhoto
                key={photo.id}
                photo={photo}
                fallbackAlt={`Photo of ${pet.name}`}
                className="aspect-[4/3] w-full rounded-xl border border-cream-200"
              />
            ))}
          </div>
        ) : (
          <PetPhoto
            photo={undefined}
            fallbackAlt={`No photo shared for ${pet.name}`}
            className="aspect-[16/9] w-full rounded-xl border border-cream-200"
          />
        )}

        <section>
          <h3 className="text-sm font-semibold text-charcoal-800">Details</h3>
          <dl className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Detail label="Species" value={speciesLabel(pet.species)} />
            <Detail label="Breed" value={pet.breed} />
            <Detail label="Age" value={ageLabel(pet)} />
            <Detail
              label="Gender"
              value={pet.sex === 'female' ? 'Female' : 'Male'}
            />
            <Detail
              label="Size"
              value={
                pet.size.charAt(0).toUpperCase() + pet.size.slice(1)
              }
            />
            <Detail
              label="Activity level (owner-provided)"
              value={
                pet.energyLevel.charAt(0).toUpperCase() +
                pet.energyLevel.slice(1)
              }
            />
          </dl>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-charcoal-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 break-words">
              {pet.city} — city only, no precise location
            </span>
          </p>
          <p className="mt-1 break-words text-sm text-charcoal-500">
            Owner: {pet.ownerName}{' '}
            <span className="text-charcoal-400">{pet.ownerHandle}</span>
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-charcoal-800">
            Owner-provided bio
          </h3>
          <p className="mt-1.5 break-words text-sm leading-relaxed text-charcoal-600">
            {pet.bio}
          </p>
          {pet.temperament.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {pet.temperament.map((word) => (
                <Badge key={word}>{word}</Badge>
              ))}
            </div>
          ) : null}
        </section>

        <section>
          <h3 className="text-sm font-semibold text-charcoal-800">
            Owner-provided health information
          </h3>
          <p className="mt-1.5 text-sm text-charcoal-600">
            {ownerProvidedVaccinationLabel(pet.vaccination)}.
          </p>
          <p className="mt-1 break-words text-sm text-charcoal-600">
            {pet.healthNotes}
          </p>
          <p className="mt-1.5 text-xs text-charcoal-400">
            Not verified by Atronz. No screening, veterinary record or genetic
            information is involved.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-charcoal-800">
            Compatibility preview
          </h3>
          {hasComparison ? (
            <>
              <p className="mt-1.5 text-sm text-charcoal-600">
                {compatibility.sharedCount} of {compatibility.totalCount}{' '}
                profile details line up with your pet.
              </p>
              <ul className="mt-2 space-y-1.5">
                {compatibility.notes.map((note) => (
                  <li key={note.id} className="flex items-start gap-2 text-sm">
                    {note.shared ? (
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-sage-600"
                        aria-hidden="true"
                      />
                    ) : (
                      <Minus
                        className="mt-0.5 h-4 w-4 shrink-0 text-charcoal-400"
                        aria-hidden="true"
                      />
                    )}
                    <span className="min-w-0 break-words text-charcoal-600">
                      {note.label}
                      <span className="sr-only">
                        {note.shared ? ' — matches' : ' — does not match'}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-1.5 text-sm text-charcoal-500">
              Add a pet to your profile to see how these details compare.
            </p>
          )}
        </section>

        <SafetyNotice title="This is a demo, not an assessment">
          The compatibility preview only compares words two owners typed into
          their own profiles. It is not a medical, genetic, fertility or
          breeding assessment, it does not screen for any condition, and it
          guarantees nothing. Speak to a licensed veterinarian before making any
          decision about your pet.
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
              Report this pet
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={Ban}
              onClick={onBlock}
              block
              className="sm:w-auto"
            >
              Block this pet
            </Button>
          </div>
          <p className="mt-1.5 text-xs text-charcoal-400">
            Blocking removes this pet from your Discover results.
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
