import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { SafetyNotice } from '@/components/common/SafetyNotice';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { DiscoverablePet, PetProfile } from '@/types';

export interface SendInterestDialogProps {
  pet: DiscoverablePet | null;
  /** The viewer's pets, so they can say which one the interest is about. */
  pets: PetProfile[];
  onClose: () => void;
  onConfirm: (fromPetId: string | null) => void;
}

/**
 * Explicit confirmation before an interest is recorded.
 *
 * The dialog states plainly what does and does not happen, because "send
 * interest" could otherwise be read as messaging the owner.
 */
export function SendInterestDialog({
  pet,
  pets,
  onClose,
  onConfirm,
}: SendInterestDialogProps) {
  const [fromPetId, setFromPetId] = useState<string>('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setFromPetId(pets[0]?.id ?? '');
    setAcknowledged(false);
    setSubmitted(false);
  }, [pet?.id, pets]);

  if (!pet) return null;

  const handleConfirm = () => {
    setSubmitted(true);
    if (!acknowledged) return;
    onConfirm(fromPetId || null);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Send interest"
      description={`About ${pet.name} · ${pet.breed}`}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} block className="sm:w-auto">
            Cancel
          </Button>
          <Button icon={Heart} onClick={handleConfirm} block className="sm:w-auto">
            Send interest
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-cream-300 bg-cream-50 p-3">
          <p className="text-sm font-medium text-charcoal-800">
            What happens when you send this
          </p>
          <ul className="mt-1.5 space-y-1 text-sm leading-relaxed text-charcoal-600">
            <li>Atronz records that you are interested in {pet.name}.</li>
            <li>The owner is not contacted and gets no message.</li>
            <li>No match is created and no contact details are shared.</li>
            <li>You can withdraw it at any time.</li>
          </ul>
        </div>

        {pets.length > 0 ? (
          <div>
            <label
              htmlFor="interest-from-pet"
              className="block text-sm font-medium text-charcoal-800"
            >
              Which of your pets is this about?
            </label>
            <select
              id="interest-from-pet"
              value={fromPetId}
              onChange={(event) => setFromPetId(event.target.value)}
              className="mt-1.5 h-11 w-full rounded-2xl border border-cream-300 bg-white px-3 text-sm text-charcoal-800 transition hover:border-clay-200"
            >
              {pets.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {item.breed}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-cream-300 bg-cream-50 px-3 py-2.5 text-sm text-charcoal-500">
            You have no pets on your profile yet. The interest will be recorded
            without one.
          </p>
        )}

        <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl border border-cream-300 bg-white p-3">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(event) => {
              setAcknowledged(event.target.checked);
              setSubmitted(false);
            }}
            aria-describedby={
              submitted && !acknowledged ? 'interest-ack-error' : undefined
            }
            className="mt-0.5 h-4 w-4 shrink-0 accent-clay-700"
          />
          <span className="min-w-0 text-sm leading-relaxed text-charcoal-700">
            I understand this is a demo and that Atronz makes no medical,
            genetic, fertility or breeding guarantee about any pet.
          </span>
        </label>

        {submitted && !acknowledged ? (
          <p id="interest-ack-error" role="alert" className="text-xs text-red-700">
            Tick the box to confirm before sending.
          </p>
        ) : null}

        <SafetyNotice title="Meet safely">
          Information on this profile is owner-provided and unverified. If you
          take a connection further, meet in a public place, ask to see
          veterinary records yourself, and speak to a licensed vet first.
        </SafetyNotice>
      </div>
    </Modal>
  );
}
