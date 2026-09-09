import { Bookmark, HeartHandshake, MapPin, ShieldQuestion } from 'lucide-react';
import { PetPhoto } from '@/components/discovery/PetPhoto';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  adoptionStatusLabel,
  adoptionStatusTone,
  canApply,
  listerLabel,
} from '@/lib/adoption';
import { ageLabel, ownerProvidedVaccinationLabel } from '@/lib/discovery';
import { speciesLabel } from '@/lib/utils';
import type { AdoptionApplication, AdoptionListing } from '@/types';

export interface AdoptionCardProps {
  listing: AdoptionListing;
  /** The viewer's live application, if they have one. */
  application: AdoptionApplication | null;
  saved: boolean;
  onViewDetails: () => void;
  onApply: () => void;
  onToggleSave: () => void;
}

/**
 * One adoption listing.
 *
 * Every descriptive line is labelled as lister-provided. The card renders no
 * contact detail because `AdoptionListing` carries none.
 */
export function AdoptionCard({
  listing,
  application,
  saved,
  onViewDetails,
  onApply,
  onToggleSave,
}: AdoptionCardProps) {
  const applyable = canApply(listing);
  const hasApplied = application !== null;

  return (
    <Card padded={false} className="flex flex-col overflow-hidden">
      <article
        aria-label={`${listing.name}, ${listing.breed}, ${adoptionStatusLabel(listing.status)}`}
        className="flex flex-1 flex-col"
      >
        <div className="relative">
          <PetPhoto
            photo={listing.photos[0]}
            fallbackAlt={`No photo shared for ${listing.name}`}
            className="aspect-[4/3] w-full"
          />
          <button
            type="button"
            onClick={onToggleSave}
            aria-pressed={saved}
            aria-label={
              saved
                ? `Remove ${listing.name} from saved listings`
                : `Save ${listing.name} to your listings`
            }
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full border border-cream-300 bg-white/95 text-charcoal-500 shadow-sm transition hover:text-clay-700"
          >
            <Bookmark
              className="h-[17px] w-[17px]"
              fill={saved ? 'currentColor' : 'none'}
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
            <h3 className="min-w-0 flex-1 break-words text-base font-semibold tracking-tight text-charcoal-900">
              {listing.name}
            </h3>
            <Badge tone={adoptionStatusTone(listing.status)}>
              {adoptionStatusLabel(listing.status)}
            </Badge>
          </div>

          <p className="mt-0.5 break-words text-sm text-charcoal-500">
            {speciesLabel(listing.species)} · {listing.breed} ·{' '}
            {listing.sex === 'female' ? 'Female' : 'Male'} · {ageLabel(listing)}
          </p>

          <p className="mt-1 flex items-start gap-1 text-xs text-charcoal-400">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="min-w-0 break-words">
              {listing.city} · {listerLabel(listing.listerKind)} ·{' '}
              {listing.listerName}
            </span>
          </p>

          <p className="mt-2 line-clamp-3 break-words text-sm leading-relaxed text-charcoal-600">
            {listing.description}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge tone={listing.vaccination === 'unknown' ? 'neutral' : 'accent'}>
              <ShieldQuestion className="h-3 w-3" aria-hidden="true" />
              {ownerProvidedVaccinationLabel(listing.vaccination)}
            </Badge>
            {listing.careNeeds.length > 0 ? (
              <Badge tone="warning">
                Extra care described ({listing.careNeeds.length})
              </Badge>
            ) : null}
            {saved ? <Badge tone="accent">Saved</Badge> : null}
            {hasApplied ? <Badge tone="positive">Applied</Badge> : null}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              variant="secondary"
              size="sm"
              onClick={onViewDetails}
              block
              className="sm:flex-1"
            >
              View details
            </Button>
            {applyable && !hasApplied ? (
              <Button
                size="sm"
                icon={HeartHandshake}
                onClick={onApply}
                block
                className="sm:flex-1"
              >
                Apply to adopt
              </Button>
            ) : null}
          </div>

          {/* Why the apply control is absent, stated rather than left blank. */}
          {hasApplied ? (
            <p className="mt-2 text-xs text-clay-700">
              Demo application submitted. No organisation was contacted.
            </p>
          ) : !applyable ? (
            <p className="mt-2 text-xs text-charcoal-400">
              {listing.status === 'pending'
                ? 'This listing is pending with another adopter.'
                : 'This pet has already been adopted.'}
            </p>
          ) : null}
        </div>
      </article>
    </Card>
  );
}
