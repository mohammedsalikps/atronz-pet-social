import { useEffect, useRef, useState } from 'react';
import { Save } from 'lucide-react';
import { SafetyNotice } from '@/components/common/SafetyNotice';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  EMPTY_PET_DRAFT,
  PET_AGE_MONTHS_MAX,
  PET_AGE_YEARS_MAX,
  PET_BIO_MAX,
  PET_BREED_MAX,
  PET_CITY_MAX,
  PET_NAME_MAX,
  SEX_CHOICES,
  SIZE_CHOICES,
  SPECIES_CHOICES,
  VACCINATION_CHOICES,
  draftFromPet,
  validatePet,
} from '@/lib/pets';
import { cn } from '@/lib/utils';
import type { PetDraft, PetProfile } from '@/types';

export interface PetFormDialogProps {
  open: boolean;
  /** Null when adding, a pet when editing. */
  pet: PetProfile | null;
  onClose: () => void;
  onSubmit: (draft: PetDraft) => void;
}

const SELECT_CLASS =
  'mt-1.5 h-11 w-full rounded-2xl border border-cream-300 bg-white px-3 text-sm text-charcoal-800 transition hover:border-clay-200';
const INPUT_CLASS =
  'mt-1.5 h-11 w-full rounded-2xl border border-cream-300 bg-white px-3 text-sm text-charcoal-800 transition placeholder:text-charcoal-400 hover:border-clay-200';

/**
 * Add or edit a pet.
 *
 * One dialog serves both, so there is a single set of fields, one validator
 * and one place where discoverability can be turned on — which only ever
 * happens because the owner ticked it here.
 */
export function PetFormDialog({
  open,
  pet,
  onClose,
  onSubmit,
}: PetFormDialogProps) {
  const [draft, setDraft] = useState<PetDraft>(EMPTY_PET_DRAFT);
  const [attempted, setAttempted] = useState(false);
  /* A ref, not state: four synchronous submits all read the same rendered
     value, so only a ref stops the second one reaching the context. */
  const sentRef = useRef(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraft(pet ? draftFromPet(pet) : EMPTY_PET_DRAFT);
    setAttempted(false);
    sentRef.current = false;
    setSent(false);
  }, [open, pet]);

  const validation = validatePet(draft);
  const show = attempted && !validation.valid;

  const patch = (next: Partial<PetDraft>) =>
    setDraft((current) => ({ ...current, ...next }));

  const handleSubmit = () => {
    setAttempted(true);
    if (!validation.valid) return;
    if (sentRef.current) return;
    sentRef.current = true;
    setSent(true);
    onSubmit(draft);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={pet ? `Edit ${pet.name}` : 'Add a pet'}
      description="Owner-provided details. Atronz does not verify any of them."
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} block className="sm:w-auto">
            Cancel
          </Button>
          <Button
            icon={Save}
            onClick={handleSubmit}
            disabled={sent}
            block
            className="sm:w-auto"
          >
            {pet ? 'Save changes' : 'Add pet'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="pet-name" className="block text-sm font-medium text-charcoal-800">
            Pet name
          </label>
          <input
            id="pet-name"
            type="text"
            value={draft.name}
            maxLength={PET_NAME_MAX}
            onChange={(event) => patch({ name: event.target.value })}
            aria-invalid={show && validation.errors.name ? true : undefined}
            aria-describedby={show && validation.errors.name ? 'pet-name-error' : undefined}
            className={INPUT_CLASS}
          />
          {show && validation.errors.name ? (
            <p id="pet-name-error" role="alert" className="mt-1.5 text-xs text-red-700">
              {validation.errors.name}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="pet-species" className="block text-sm font-medium text-charcoal-800">
              Species
            </label>
            <select
              id="pet-species"
              value={draft.species}
              onChange={(event) =>
                patch({ species: event.target.value as PetDraft['species'] })
              }
              className={SELECT_CLASS}
            >
              {SPECIES_CHOICES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="pet-breed" className="block text-sm font-medium text-charcoal-800">
              Breed
            </label>
            <input
              id="pet-breed"
              type="text"
              value={draft.breed}
              maxLength={PET_BREED_MAX}
              placeholder="Mixed, if you are not sure"
              onChange={(event) => patch({ breed: event.target.value })}
              aria-invalid={show && validation.errors.breed ? true : undefined}
              aria-describedby={show && validation.errors.breed ? 'pet-breed-error' : undefined}
              className={INPUT_CLASS}
            />
            {show && validation.errors.breed ? (
              <p id="pet-breed-error" role="alert" className="mt-1.5 text-xs text-red-700">
                {validation.errors.breed}
              </p>
            ) : null}
          </div>
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-charcoal-800">Age</legend>
          <div className="mt-1.5 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="pet-age-years" className="block text-xs font-medium text-charcoal-600">
                Years
              </label>
              <input
                id="pet-age-years"
                type="number"
                inputMode="numeric"
                min={0}
                max={PET_AGE_YEARS_MAX}
                value={draft.ageYears}
                onChange={(event) => patch({ ageYears: event.target.value })}
                aria-invalid={show && validation.errors.ageYears ? true : undefined}
                aria-describedby={show && validation.errors.ageYears ? 'pet-age-years-error' : undefined}
                className={INPUT_CLASS}
              />
              {show && validation.errors.ageYears ? (
                <p id="pet-age-years-error" role="alert" className="mt-1.5 text-xs text-red-700">
                  {validation.errors.ageYears}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="pet-age-months" className="block text-xs font-medium text-charcoal-600">
                Months
              </label>
              <input
                id="pet-age-months"
                type="number"
                inputMode="numeric"
                min={0}
                max={PET_AGE_MONTHS_MAX}
                value={draft.ageMonths}
                onChange={(event) => patch({ ageMonths: event.target.value })}
                aria-invalid={show && validation.errors.ageMonths ? true : undefined}
                aria-describedby={show && validation.errors.ageMonths ? 'pet-age-months-error' : undefined}
                className={INPUT_CLASS}
              />
              {show && validation.errors.ageMonths ? (
                <p id="pet-age-months-error" role="alert" className="mt-1.5 text-xs text-red-700">
                  {validation.errors.ageMonths}
                </p>
              ) : null}
            </div>
          </div>
        </fieldset>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="pet-sex" className="block text-sm font-medium text-charcoal-800">
              Gender
            </label>
            <select
              id="pet-sex"
              value={draft.sex}
              onChange={(event) => patch({ sex: event.target.value as PetDraft['sex'] })}
              className={SELECT_CLASS}
            >
              {SEX_CHOICES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="pet-size" className="block text-sm font-medium text-charcoal-800">
              Size
            </label>
            <select
              id="pet-size"
              value={draft.size}
              onChange={(event) => patch({ size: event.target.value as PetDraft['size'] })}
              className={SELECT_CLASS}
            >
              {SIZE_CHOICES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="pet-city" className="block text-sm font-medium text-charcoal-800">
            City
          </label>
          <p id="pet-city-hint" className="mt-0.5 text-xs text-charcoal-400">
            City only. Never enter a street, building or postcode — Atronz has no
            field for one and uses no location services.
          </p>
          <input
            id="pet-city"
            type="text"
            value={draft.city}
            maxLength={PET_CITY_MAX}
            onChange={(event) => patch({ city: event.target.value })}
            aria-invalid={show && validation.errors.city ? true : undefined}
            aria-describedby={
              show && validation.errors.city ? 'pet-city-hint pet-city-error' : 'pet-city-hint'
            }
            className={INPUT_CLASS}
          />
          {show && validation.errors.city ? (
            <p id="pet-city-error" role="alert" className="mt-1.5 text-xs text-red-700">
              {validation.errors.city}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="pet-bio" className="block text-sm font-medium text-charcoal-800">
            Short bio <span className="font-normal text-charcoal-400">(optional)</span>
          </label>
          <textarea
            id="pet-bio"
            value={draft.bio}
            rows={3}
            onChange={(event) => patch({ bio: event.target.value })}
            aria-invalid={show && validation.errors.bio ? true : undefined}
            aria-describedby="pet-bio-count"
            className="mt-1.5 w-full resize-none rounded-2xl border border-cream-300 bg-white px-3 py-2.5 text-sm leading-relaxed text-charcoal-800 transition hover:border-clay-200"
          />
          <div className="mt-1.5 flex items-start justify-between gap-3">
            {show && validation.errors.bio ? (
              <p role="alert" className="text-xs text-red-700">
                {validation.errors.bio}
              </p>
            ) : (
              <span />
            )}
            <p
              id="pet-bio-count"
              className={cn(
                'shrink-0 text-xs tabular-nums',
                draft.bio.length > PET_BIO_MAX
                  ? 'font-semibold text-red-700'
                  : 'text-charcoal-400',
              )}
            >
              {draft.bio.length}/{PET_BIO_MAX}
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="pet-vaccination" className="block text-sm font-medium text-charcoal-800">
            Vaccination information
          </label>
          <select
            id="pet-vaccination"
            value={draft.vaccination}
            onChange={(event) =>
              patch({ vaccination: event.target.value as PetDraft['vaccination'] })
            }
            className={SELECT_CLASS}
          >
            {VACCINATION_CHOICES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-charcoal-400">
            Owner-provided and shown to others as unverified. Atronz holds no
            veterinary record and makes no health claim about your pet.
          </p>
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl border border-cream-300 bg-white p-3">
          <input
            type="checkbox"
            checked={draft.neutered}
            onChange={(event) => patch({ neutered: event.target.checked })}
            className="mt-0.5 h-4 w-4 shrink-0 accent-clay-700"
          />
          <span className="min-w-0 text-sm text-charcoal-700">
            Neutered <span className="text-charcoal-400">(owner-provided)</span>
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl border border-cream-300 bg-cream-50 p-3">
          <input
            type="checkbox"
            checked={draft.openToMating}
            onChange={(event) => patch({ openToMating: event.target.checked })}
            className="mt-0.5 h-4 w-4 shrink-0 accent-clay-700"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-charcoal-800">
              Show this pet in Discover
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-charcoal-500">
              Off unless you turn it on. Atronz never enables this for you, and
              your profile's own discoverability switch applies as well.
            </span>
          </span>
        </label>

        <SafetyNotice title="Owner-provided, not verified">
          Everything you enter here is shown to other owners as your own
          description. Atronz does not verify it and makes no medical,
          behavioural or suitability claim about your pet.
        </SafetyNotice>
      </div>
    </Modal>
  );
}
