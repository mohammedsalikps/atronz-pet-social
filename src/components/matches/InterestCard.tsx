import { Heart, MapPin, ThumbsDown, Undo2 } from 'lucide-react';
import { PetPhoto } from '@/components/discovery/PetPhoto';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ageLabel, ownerProvidedVaccinationLabel } from '@/lib/discovery';
import { formatRelativeTime } from '@/lib/feed';
import {
  canAccept,
  canDecline,
  canWithdraw,
  directionLabel,
  interestStatusLabel,
  interestStatusTone,
} from '@/lib/matches';
import { speciesLabel } from '@/lib/utils';
import type { DiscoverablePet, InterestRequest, PetProfile } from '@/types';

export interface InterestCardProps {
  interest: InterestRequest;
  pet: DiscoverablePet;
  /** The viewer's pet the interest concerns, when they still have it. */
  ownPet: PetProfile | null;
  onViewProfile: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onWithdraw: () => void;
}

/**
 * One interest row.
 *
 * Which controls render is decided by the interest's own status through the
 * shared `canAccept` / `canDecline` / `canWithdraw` guards — the same ones the
 * context enforces — so a resolved interest can never show a stale control.
 */
export function InterestCard({
  interest,
  pet,
  ownPet,
  onViewProfile,
  onAccept,
  onDecline,
  onWithdraw,
}: InterestCardProps) {
  const showAccept = canAccept(interest);
  const showDecline = canDecline(interest);
  const showWithdraw = canWithdraw(interest);
  const label = `${pet.name}, ${directionLabel(interest.direction).toLowerCase()} interest`;

  return (
    <Card padded={false}>
      <article aria-label={label} className="p-4">
        <div className="flex items-start gap-3">
          <PetPhoto
            photo={pet.photos[0]}
            fallbackAlt={`No photo shared for ${pet.name}`}
            className="h-20 w-20 shrink-0 rounded-xl border border-cream-200"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="min-w-0 break-words text-base font-semibold tracking-tight text-charcoal-900">
                {pet.name}
              </h3>
              <Badge tone={interestStatusTone(interest.status)}>
                {interestStatusLabel(interest.status)}
              </Badge>
              <Badge>{directionLabel(interest.direction)}</Badge>
            </div>

            <p className="mt-0.5 break-words text-sm text-charcoal-500">
              {speciesLabel(pet.species)} · {pet.breed} ·{' '}
              {pet.sex === 'female' ? 'Female' : 'Male'} · {ageLabel(pet)}
            </p>

            <p className="mt-1 flex items-center gap-1 text-xs text-charcoal-400">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="min-w-0 break-words">
                {pet.city} · {pet.ownerName}
              </span>
            </p>

            <p className="mt-1 text-xs text-charcoal-400">
              <time dateTime={new Date(interest.sentAt).toISOString()}>
                {formatRelativeTime(interest.sentAt)}
              </time>
              {ownPet ? ` · about ${ownPet.name}` : null}
            </p>
          </div>
        </div>

        {/* Owner-provided wording, never presented as verified. */}
        <p className="mt-3 break-words text-xs text-charcoal-500">
          {ownerProvidedVaccinationLabel(pet.vaccination)} — owner-provided and
          not verified.
        </p>

        <div className="mt-3 flex flex-col gap-2 border-t border-cream-200 pt-3 sm:flex-row">
          <Button
            variant="secondary"
            size="sm"
            onClick={onViewProfile}
            block
            className="sm:w-auto"
          >
            View pet profile
          </Button>

          {showDecline ? (
            <Button
              variant="secondary"
              size="sm"
              icon={ThumbsDown}
              onClick={onDecline}
              block
              className="sm:w-auto"
            >
              Decline
            </Button>
          ) : null}

          {showAccept ? (
            <Button
              size="sm"
              icon={Heart}
              onClick={onAccept}
              block
              className="sm:w-auto"
            >
              Accept
            </Button>
          ) : null}

          {showWithdraw ? (
            <Button
              variant="secondary"
              size="sm"
              icon={Undo2}
              onClick={onWithdraw}
              block
              className="sm:w-auto"
            >
              Withdraw
            </Button>
          ) : null}
        </div>
      </article>
    </Card>
  );
}
