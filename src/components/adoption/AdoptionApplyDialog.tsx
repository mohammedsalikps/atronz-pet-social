import { useEffect, useRef, useState } from 'react';
import { HeartHandshake } from 'lucide-react';
import { SafetyNotice } from '@/components/common/SafetyNotice';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  EXPERIENCE_LIMIT,
  LIVING_LIMIT,
  REASON_LIMIT,
  validateApplication,
} from '@/lib/adoption';
import type { ApplicationDraft } from '@/lib/adoption';
import { cn } from '@/lib/utils';
import type { AdoptionListing } from '@/types';

export interface AdoptionApplyDialogProps {
  listing: AdoptionListing | null;
  /** Display name from local profile state. Never typed by the applicant. */
  applicantName: string | null;
  onClose: () => void;
  /** Called once, from the review step, with a validated draft. */
  onSubmit: (draft: ApplicationDraft) => void;
}

const EMPTY_DRAFT: ApplicationDraft = {
  reason: '',
  livingSituation: '',
  experience: '',
  acknowledged: false,
};

/**
 * The adoption application, as two steps inside ONE dialog.
 *
 * The confirmation is a second step rather than a second Modal on purpose:
 * stacking would leave two `aria-modal` elements and two focus traps active at
 * once. Going back from review keeps the draft intact.
 *
 * The applicant's name is read from the local profile rather than typed, so
 * this form cannot become a place to enter a new identity.
 */
export function AdoptionApplyDialog({
  listing,
  applicantName,
  onClose,
  onSubmit,
}: AdoptionApplyDialogProps) {
  const [draft, setDraft] = useState<ApplicationDraft>(EMPTY_DRAFT);
  const [attempted, setAttempted] = useState(false);
  const [step, setStep] = useState('form');
  /* A ref, not state: three synchronous clicks all read the same rendered
     state, so a state latch would let the 2nd and 3rd through. The ref flips
     immediately, so only the first click ever calls `onSubmit`. The state copy
     exists only to disable the button on the next render. */
  const sentRef = useRef(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setDraft(EMPTY_DRAFT);
    setAttempted(false);
    setStep('form');
    sentRef.current = false;
    setSent(false);
  }, [listing?.id]);

  if (!listing) return null;

  const validation = validateApplication(draft);
  const show = attempted && !validation.valid;

  const patch = (next: Partial<ApplicationDraft>) =>
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
        title="Review your application"
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
              icon={HeartHandshake}
              onClick={handleSubmit}
              disabled={sent}
              block
              className="sm:w-auto"
            >
              Submit application
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="rounded-2xl border border-cream-300 bg-cream-50 p-3">
            <p className="text-sm font-medium text-charcoal-800">
              This records a session-local application only
            </p>
            <p className="mt-1 text-xs leading-relaxed text-charcoal-500">
              Nothing is sent, {listing.listerName} is not contacted, and this
              grants no priority, entitlement or agreement of any kind. You can
              withdraw it at any time.
            </p>
          </div>

          <ReviewRow label="Applying as" value={applicantName ?? 'Your profile'} />
          <ReviewRow label="Pet" value={`${listing.name} · ${listing.breed}`} />
          <ReviewRow label="Why you would like to adopt" value={draft.reason} />
          <ReviewRow label="Living situation" value={draft.livingSituation} />
          <ReviewRow label="Experience with pets" value={draft.experience} />
          <ReviewRow
            label="Acknowledgement"
            value="I will independently verify identity, ownership, health, vaccination and suitability."
          />
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Apply to adopt"
      description={`Step 1 of 2 · ${listing.name} · ${listing.listerName}`}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} block className="sm:w-auto">
            Cancel
          </Button>
          <Button
            icon={HeartHandshake}
            onClick={goToReview}
            block
            className="sm:w-auto"
          >
            Review application
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-cream-300 bg-cream-50 p-3">
          <p className="text-sm font-medium text-charcoal-800">
            Applying as {applicantName ?? 'your profile'}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-charcoal-500">
            Taken from your local profile. Atronz shares no phone number, email
            address or location with the lister — and in this preview, nothing
            is sent at all.
          </p>
        </div>

        <TextAreaField
          id="apply-reason"
          label="Why would you like to adopt this pet?"
          value={draft.reason}
          limit={REASON_LIMIT}
          rows={4}
          error={show ? validation.errors.reason : undefined}
          onChange={(reason) => patch({ reason })}
        />

        <TextAreaField
          id="apply-living"
          label="Describe your living situation"
          hint="Home type, outdoor space, who else lives there, other pets."
          value={draft.livingSituation}
          limit={LIVING_LIMIT}
          rows={3}
          error={show ? validation.errors.livingSituation : undefined}
          onChange={(livingSituation) => patch({ livingSituation })}
        />

        <TextAreaField
          id="apply-experience"
          label="What experience do you have with pets?"
          value={draft.experience}
          limit={EXPERIENCE_LIMIT}
          rows={3}
          error={show ? validation.errors.experience : undefined}
          onChange={(experience) => patch({ experience })}
        />

        <div>
          <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl border border-cream-300 bg-white p-3">
            <input
              type="checkbox"
              checked={draft.acknowledged}
              onChange={(event) => patch({ acknowledged: event.target.checked })}
              aria-describedby={
                show && validation.errors.acknowledged
                  ? 'apply-ack-error'
                  : undefined
              }
              className="mt-0.5 h-4 w-4 shrink-0 accent-clay-700"
            />
            <span className="min-w-0 text-sm leading-relaxed text-charcoal-700">
              I understand this is a demo application, that no organisation is
              contacted, and that I must independently verify the lister's
              identity, ownership, and the pet's health, vaccination and
              suitability before adopting.
            </span>
          </label>
          {show && validation.errors.acknowledged ? (
            <p id="apply-ack-error" role="alert" className="mt-1.5 text-xs text-red-700">
              {validation.errors.acknowledged}
            </p>
          ) : null}
        </div>

        <SafetyNotice title="Not a binding application">
          Submitting this creates a record in your browser session only. It is
          not an agreement, it grants no priority or entitlement, and it does
          not guarantee an adoption. Atronz makes no promise about any pet's
          health, behaviour, fertility or genetics.
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

interface TextAreaFieldProps {
  id: string;
  label: string;
  hint?: string;
  value: string;
  limit: number;
  rows: number;
  error?: string;
  onChange: (value: string) => void;
}

function TextAreaField({
  id,
  label,
  hint,
  value,
  limit,
  rows,
  error,
  onChange,
}: TextAreaFieldProps) {
  const over = value.length > limit;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-charcoal-800">
        {label}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="mt-0.5 text-xs text-charcoal-400">
          {hint}
        </p>
      ) : null}
      <textarea
        id={id}
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(
          hint ? `${id}-hint` : '',
          `${id}-count`,
          error ? `${id}-error` : '',
        )
          .trim()
          .replace(/\s+/g, ' ')}
        className="mt-1.5 w-full resize-none rounded-2xl border border-cream-300 bg-white px-3 py-2.5 text-sm leading-relaxed text-charcoal-800 transition placeholder:text-charcoal-400 hover:border-clay-200"
      />
      <div className="mt-1.5 flex items-start justify-between gap-3">
        {error ? (
          <p id={`${id}-error`} role="alert" className="text-xs text-red-700">
            {error}
          </p>
        ) : (
          <span />
        )}
        <p
          id={`${id}-count`}
          className={cn(
            'shrink-0 text-xs tabular-nums',
            over ? 'font-semibold text-red-700' : 'text-charcoal-400',
          )}
        >
          {value.length}/{limit}
        </p>
      </div>
    </div>
  );
}
