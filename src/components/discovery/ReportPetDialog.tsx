import { useEffect, useState } from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PET_REPORT_REASONS } from '@/lib/discovery';
import { cn } from '@/lib/utils';
import type { PetReportReason, ReportSubject } from '@/types';

export interface ReportPetDialogProps {
  /**
   * What is being reported — a pet profile or an adoption listing.
   *
   * Deliberately a minimal `{ id, name, byline }` rather than a full record, so
   * one report dialog serves Discover, Matches and Adoption without any of them
   * handing a contact-bearing object to a shared component.
   */
  subject: ReportSubject | null;
  title?: string;
  onClose: () => void;
  onConfirm: (reason: PetReportReason) => void;
}

/** Report a profile or listing. A reason is required before anything happens. */
export function ReportPetDialog({
  subject,
  title = 'Report this pet profile',
  onClose,
  onConfirm,
}: ReportPetDialogProps) {
  const [reason, setReason] = useState<PetReportReason | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setReason(null);
    setSubmitted(false);
  }, [subject?.id]);

  if (!subject) return null;

  const handleConfirm = () => {
    setSubmitted(true);
    if (!reason) return;
    onConfirm(reason);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={title}
      description={`${subject.name} · ${subject.byline}`}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} block className="sm:w-auto">
            Cancel
          </Button>
          <Button
            variant="danger"
            icon={Flag}
            onClick={handleConfirm}
            block
            className="sm:w-auto"
          >
            Report profile
          </Button>
        </div>
      }
    >
      <fieldset>
        <legend className="text-sm font-medium text-charcoal-800">
          Why are you reporting this profile?
        </legend>
        <div className="mt-2 space-y-2">
          {PET_REPORT_REASONS.map((option) => (
            <label
              key={option.id}
              className={cn(
                'flex cursor-pointer items-center gap-2.5 rounded-2xl border p-3 text-sm transition',
                reason === option.id
                  ? 'border-clay-300 bg-clay-50 font-medium text-charcoal-900'
                  : 'border-cream-300 bg-white text-charcoal-700 hover:border-clay-200',
              )}
            >
              <input
                type="radio"
                name="pet-report-reason"
                value={option.id}
                checked={reason === option.id}
                onChange={() => {
                  setReason(option.id);
                  setSubmitted(false);
                }}
                className="h-4 w-4 shrink-0 accent-clay-700"
              />
              <span className="min-w-0 break-words">{option.label}</span>
            </label>
          ))}
        </div>
        {submitted && !reason ? (
          <p role="alert" className="mt-2 text-xs text-red-700">
            Choose a reason before reporting.
          </p>
        ) : null}
      </fieldset>

      <p className="mt-4 text-xs leading-relaxed text-charcoal-400">
        Reporting removes this listing or profile from your results. Reports
        are stored locally in this preview and are not sent anywhere.
      </p>
    </Modal>
  );
}
