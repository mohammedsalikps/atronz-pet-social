import { useEffect, useRef, useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import { SafetyNotice } from '@/components/common/SafetyNotice';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  MESSAGE_LIMIT,
  TIME_WINDOWS,
  serviceCategoryLabel,
  validateBooking,
} from '@/lib/services';
import type { BookingDraft } from '@/lib/services';
import { cn } from '@/lib/utils';
import type { PetProfile, ServiceListing } from '@/types';

export interface BookingRequestDialogProps {
  listing: ServiceListing | null;
  pets: PetProfile[];
  /** Pet ids that already have an active request for this service. */
  requestedPetIds: string[];
  onClose: () => void;
  /** Called once, from the review step, with a validated draft. */
  onSubmit: (draft: BookingDraft) => void;
}

const EMPTY_DRAFT: BookingDraft = {
  petId: '',
  preferredDate: '',
  timeWindow: '',
  message: '',
  acknowledged: false,
};

/**
 * The booking request, as two steps inside ONE dialog.
 *
 * The review is a second step rather than a second Modal on purpose: stacking
 * would leave two `aria-modal` elements and two focus traps active at once.
 * Going back from review keeps the whole draft, acknowledgement included.
 */
export function BookingRequestDialog({
  listing,
  pets,
  requestedPetIds,
  onClose,
  onSubmit,
}: BookingRequestDialogProps) {
  const [draft, setDraft] = useState<BookingDraft>(EMPTY_DRAFT);
  const [attempted, setAttempted] = useState(false);
  const [step, setStep] = useState('form');
  /* A ref, not state: synchronous clicks all read the same rendered state, so
     a state latch would let the second through. The ref flips immediately. */
  const sentRef = useRef(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    // Default to the first pet that has not already been requested for.
    const firstFree = pets.find((pet) => !requestedPetIds.includes(pet.id));
    setDraft({ ...EMPTY_DRAFT, petId: firstFree?.id ?? '' });
    setAttempted(false);
    setStep('form');
    sentRef.current = false;
    setSent(false);
  }, [listing?.id, pets, requestedPetIds]);

  if (!listing) return null;

  const validation = validateBooking(draft);
  const show = attempted && !validation.valid;
  const selectedPet = pets.find((pet) => pet.id === draft.petId) ?? null;
  const allPetsRequested =
    pets.length > 0 && pets.every((pet) => requestedPetIds.includes(pet.id));

  const patch = (next: Partial<BookingDraft>) =>
    setDraft((current) => ({ ...current, ...next }));

  const goToReview = () => {
    setAttempted(true);
    if (!validation.valid) return;
    setStep('review');
  };

  const handleSubmit = () => {
    if (sentRef.current || !validation.valid) return;
    sentRef.current = true;
    setSent(true);
    onSubmit(draft);
  };

  if (step === 'review') {
    return (
      <Modal
        open
        onClose={onClose}
        title="Review your request"
        description={`Step 2 of 2 · ${listing.name}`}
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setStep('form')}
              block
              className="sm:w-auto"
            >
              Back to edit
            </Button>
            <Button
              icon={CalendarPlus}
              onClick={handleSubmit}
              disabled={sent}
              block
              className="sm:w-auto"
            >
              Submit request
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="rounded-2xl border border-cream-300 bg-cream-50 p-3">
            <p className="text-sm font-medium text-charcoal-800">
              This records a session-local request only
            </p>
            <p className="mt-1 text-xs leading-relaxed text-charcoal-500">
              Nothing is sent, {listing.providerName} is not contacted, no
              appointment is created and no payment is owed. You can withdraw it
              at any time.
            </p>
          </div>

          <ReviewRow
            label="Service"
            value={`${listing.name} · ${serviceCategoryLabel(listing.category)}`}
          />
          <ReviewRow label="Provider" value={listing.providerName} />
          <ReviewRow
            label="Pet"
            value={
              selectedPet
                ? `${selectedPet.name} · ${selectedPet.breed}`
                : 'Not selected'
            }
          />
          <ReviewRow label="Preferred date" value={draft.preferredDate} />
          <ReviewRow label="Preferred time" value={draft.timeWindow} />
          <ReviewRow
            label="Message"
            value={draft.message.trim() || 'No message added'}
          />
          <ReviewRow
            label="Acknowledgement"
            value="I understand this is a demo request and books nothing."
          />
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Request booking"
      description={`Step 1 of 2 · ${listing.name} · ${listing.providerName}`}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} block className="sm:w-auto">
            Cancel
          </Button>
          <Button
            icon={CalendarPlus}
            onClick={goToReview}
            block
            className="sm:w-auto"
          >
            Review request
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="booking-pet"
            className="block text-sm font-medium text-charcoal-800"
          >
            Which of your pets is this for?
          </label>
          {pets.length === 0 ? (
            <p className="mt-1.5 rounded-2xl border border-dashed border-cream-300 bg-cream-50 px-3 py-2.5 text-sm text-charcoal-500">
              Add a pet to your profile before requesting a booking.
            </p>
          ) : (
            <>
              <select
                id="booking-pet"
                value={draft.petId}
                onChange={(event) => patch({ petId: event.target.value })}
                aria-invalid={show && validation.errors.petId ? true : undefined}
                aria-describedby={
                  show && validation.errors.petId ? 'booking-pet-error' : undefined
                }
                className="mt-1.5 h-11 w-full rounded-2xl border border-cream-300 bg-white px-3 text-sm text-charcoal-800 transition hover:border-clay-200"
              >
                <option value="">Choose a pet</option>
                {pets.map((pet) => {
                  const taken = requestedPetIds.includes(pet.id);
                  return (
                    /* Disabled rather than hidden, so the reason is visible. */
                    <option key={pet.id} value={pet.id} disabled={taken}>
                      {pet.name} · {pet.breed}
                      {taken ? ' — request already sent' : ''}
                    </option>
                  );
                })}
              </select>
              {allPetsRequested ? (
                <p className="mt-1.5 text-xs text-charcoal-500">
                  You already have an active request for every pet on your
                  profile. Withdraw one to request again.
                </p>
              ) : null}
            </>
          )}
          {show && validation.errors.petId ? (
            <p id="booking-pet-error" role="alert" className="mt-1.5 text-xs text-red-700">
              {validation.errors.petId}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="booking-date"
            className="block text-sm font-medium text-charcoal-800"
          >
            Preferred date
          </label>
          <input
            id="booking-date"
            type="date"
            value={draft.preferredDate}
            onChange={(event) => patch({ preferredDate: event.target.value })}
            aria-invalid={show && validation.errors.preferredDate ? true : undefined}
            aria-describedby={
              show && validation.errors.preferredDate
                ? 'booking-date-error'
                : undefined
            }
            className="mt-1.5 h-11 w-full rounded-2xl border border-cream-300 bg-white px-3 text-sm text-charcoal-800 transition hover:border-clay-200"
          />
          {show && validation.errors.preferredDate ? (
            <p id="booking-date-error" role="alert" className="mt-1.5 text-xs text-red-700">
              {validation.errors.preferredDate}
            </p>
          ) : null}
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-charcoal-800">
            Preferred time window
          </legend>
          <div className="mt-1.5 space-y-2">
            {TIME_WINDOWS.map((window) => (
              <label
                key={window}
                className={cn(
                  'flex cursor-pointer items-center gap-2.5 rounded-2xl border p-3 text-sm transition',
                  draft.timeWindow === window
                    ? 'border-clay-300 bg-clay-50 font-medium text-charcoal-900'
                    : 'border-cream-300 bg-white text-charcoal-700 hover:border-clay-200',
                )}
              >
                <input
                  type="radio"
                  name="booking-time"
                  value={window}
                  checked={draft.timeWindow === window}
                  onChange={() => patch({ timeWindow: window })}
                  className="h-4 w-4 shrink-0 accent-clay-700"
                />
                <span className="min-w-0 break-words">{window}</span>
              </label>
            ))}
          </div>
          {show && validation.errors.timeWindow ? (
            <p role="alert" className="mt-1.5 text-xs text-red-700">
              {validation.errors.timeWindow}
            </p>
          ) : null}
        </fieldset>

        <div>
          <label
            htmlFor="booking-message"
            className="block text-sm font-medium text-charcoal-800"
          >
            Message or special instructions{' '}
            <span className="font-normal text-charcoal-400">(optional)</span>
          </label>
          <p id="booking-message-hint" className="mt-0.5 text-xs text-charcoal-400">
            Do not include your home address, phone number or email — Atronz
            does not pass any of it on.
          </p>
          <textarea
            id="booking-message"
            value={draft.message}
            rows={3}
            onChange={(event) => patch({ message: event.target.value })}
            aria-invalid={show && validation.errors.message ? true : undefined}
            aria-describedby="booking-message-hint booking-message-count"
            className="mt-1.5 w-full resize-none rounded-2xl border border-cream-300 bg-white px-3 py-2.5 text-sm leading-relaxed text-charcoal-800 transition hover:border-clay-200"
          />
          <div className="mt-1.5 flex items-start justify-between gap-3">
            {show && validation.errors.message ? (
              <p role="alert" className="text-xs text-red-700">
                {validation.errors.message}
              </p>
            ) : (
              <span />
            )}
            <p
              id="booking-message-count"
              className={cn(
                'shrink-0 text-xs tabular-nums',
                draft.message.length > MESSAGE_LIMIT
                  ? 'font-semibold text-red-700'
                  : 'text-charcoal-400',
              )}
            >
              {draft.message.length}/{MESSAGE_LIMIT}
            </p>
          </div>
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl border border-cream-300 bg-white p-3">
            <input
              type="checkbox"
              checked={draft.acknowledged}
              onChange={(event) => patch({ acknowledged: event.target.checked })}
              aria-describedby={
                show && validation.errors.acknowledged
                  ? 'booking-ack-error'
                  : undefined
              }
              className="mt-0.5 h-4 w-4 shrink-0 accent-clay-700"
            />
            <span className="min-w-0 text-sm leading-relaxed text-charcoal-700">
              I understand this is a demo request, that {listing.providerName} is
              not contacted, that no appointment is booked and no payment is
              owed, and that Atronz has not verified this provider.
            </span>
          </label>
          {show && validation.errors.acknowledged ? (
            <p id="booking-ack-error" role="alert" className="mt-1.5 text-xs text-red-700">
              {validation.errors.acknowledged}
            </p>
          ) : null}
        </div>

        <SafetyNotice title="Not a real appointment">
          Submitting creates a record in your browser session only. Arrange any
          real booking directly with the provider, and check their
          qualifications, insurance and references yourself first.
        </SafetyNotice>
      </div>
    </Modal>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-cream-200 bg-white px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wide text-charcoal-400">
        {label}
      </p>
      <p className="mt-0.5 whitespace-pre-line break-words text-sm leading-relaxed text-charcoal-700">
        {value}
      </p>
    </div>
  );
}
