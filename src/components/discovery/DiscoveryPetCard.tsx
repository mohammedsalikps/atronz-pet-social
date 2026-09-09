import { Check, Heart, Minus, ShieldQuestion, Undo2 } from 'lucide-react';
import { PetPhoto } from '@/components/discovery/PetPhoto';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ageLabel, ownerProvidedVaccinationLabel } from '@/lib/discovery';
import { speciesLabel } from '@/lib/utils';
import type { CompatibilityPreview, DiscoverablePet } from '@/types';

export interface DiscoveryPetCardProps {
  pet: DiscoverablePet;
  compatibility: CompatibilityPreview;
  hasPendingInterest: boolean;
  onViewProfile: () => void;
  onSendInterest: () => void;
  onWithdrawInterest: () => void;
}

/**
 * One discovery result.
 *
 * Everything descriptive is labelled as owner-provided. There is no score, no
 * percentage, and no contact detail — the type it renders does not carry one.
 */
export function DiscoveryPetCard({
  pet,
  compatibility,
  hasPendingInterest,
  onViewProfile,
  onSendInterest,
  onWithdrawInterest,
}: DiscoveryPetCardProps) {
  const shared = compatibility.notes.filter((note) => note.shared);
  const hasComparison = compatibility.comparedWithPetId !== null;

  return (
    <Card padded={false} className="flex flex-col overflow-hidden">
      <article aria-label={`${pet.name}, ${pet.breed}`} className="flex flex-1 flex-col">
        <PetPhoto
          photo={pet.photos[0]}
          fallbackAlt={`No photo shared for ${pet.name}`}
          className="aspect-[4/3] w-full"
        />

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start gap-2">
            <h3 className="min-w-0 flex-1 break-words text-base font-semibold tracking-tight text-charcoal-900">
              {pet.name}
            </h3>
            <Badge>{speciesLabel(pet.species)}</Badge>
          </div>

          <p className="mt-0.5 break-words text-sm text-charcoal-500">
            {pet.breed} • {pet.sex === 'female' ? 'Female' : 'Male'} •{' '}
            {ageLabel(pet)}
          </p>

          <p className="mt-1 truncate text-xs text-charcoal-400">
            {pet.city} • {pet.ownerName}
          </p>

          {/* Owner-provided wording, never presented as verified. */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge tone={pet.vaccination === 'unknown' ? 'neutral' : 'accent'}>
              <ShieldQuestion className="h-3 w-3" aria-hidden="true" />
              {ownerProvidedVaccinationLabel(pet.vaccination)}
            </Badge>
          </div>

          <div className="mt-3 border-t border-cream-200 pt-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-charcoal-400">
              Compatibility preview
            </p>
            {hasComparison ? (
              <>
                <p className="mt-1 text-sm text-charcoal-600">
                  {compatibility.sharedCount} of {compatibility.totalCount}{' '}
                  profile details line up
                </p>
                <ul className="mt-1.5 space-y-1">
                  {compatibility.notes.slice(0, 3).map((note) => (
                    <li
                      key={note.id}
                      className="flex items-start gap-1.5 text-xs text-charcoal-500"
                    >
                      {/* Icon as well as tint — never colour alone. */}
                      {note.shared ? (
                        <Check
                          className="mt-0.5 h-3 w-3 shrink-0 text-sage-600"
                          aria-hidden="true"
                        />
                      ) : (
                        <Minus
                          className="mt-0.5 h-3 w-3 shrink-0 text-charcoal-400"
                          aria-hidden="true"
                        />
                      )}
                      <span className="min-w-0 break-words">{note.label}</span>
                    </li>
                  ))}
                </ul>
                {shared.length === 0 ? (
                  <p className="mt-1.5 text-xs text-charcoal-400">
                    Nothing lines up on these profile details.
                  </p>
                ) : null}
              </>
            ) : (
              <p className="mt-1 text-sm text-charcoal-500">
                Add a pet to your profile to compare details.
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              variant="secondary"
              size="sm"
              onClick={onViewProfile}
              block
              className="sm:flex-1"
            >
              View profile
            </Button>
            {hasPendingInterest ? (
              <Button
                variant="secondary"
                size="sm"
                icon={Undo2}
                onClick={onWithdrawInterest}
                block
                className="sm:flex-1"
              >
                Withdraw interest
              </Button>
            ) : (
              <Button
                size="sm"
                icon={Heart}
                onClick={onSendInterest}
                block
                className="sm:flex-1"
              >
                Send interest
              </Button>
            )}
          </div>

          {hasPendingInterest ? (
            <p className="mt-2 text-xs text-clay-700">
              Interest pending. The owner has not been contacted.
            </p>
          ) : null}
        </div>
      </article>
    </Card>
  );
}
