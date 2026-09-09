import { Bookmark, CalendarPlus, Info, MapPin } from 'lucide-react';
import { PetPhoto } from '@/components/discovery/PetPhoto';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  availabilityLabel,
  availabilityTone,
  canRequest,
  categoryCaveat,
  priceLabel,
  serviceCategoryLabel,
} from '@/lib/services';
import { speciesLabel } from '@/lib/utils';
import type { BookingRequest, ServiceListing } from '@/types';

export interface ServiceCardProps {
  listing: ServiceListing;
  /** Still-submitted requests for this service, across the viewer's pets. */
  bookings: BookingRequest[];
  saved: boolean;
  onViewDetails: () => void;
  onRequest: () => void;
  onToggleSave: () => void;
}

/**
 * One service listing.
 *
 * Every claim is attributed to the provider. The card renders no contact
 * detail because `ServiceListing` carries none.
 */
export function ServiceCard({
  listing,
  bookings,
  saved,
  onViewDetails,
  onRequest,
  onToggleSave,
}: ServiceCardProps) {
  const requestable = canRequest(listing);
  const caveat = categoryCaveat(listing.category);

  return (
    <Card padded={false} className="flex flex-col overflow-hidden">
      <article
        aria-label={`${listing.name} by ${listing.providerName}`}
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
                ? `Remove ${listing.name} from saved services`
                : `Save ${listing.name} to your services`
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
            <Badge>{serviceCategoryLabel(listing.category)}</Badge>
          </div>

          <p className="mt-0.5 break-words text-sm text-charcoal-500">
            {listing.providerName}
          </p>

          <p className="mt-1 flex items-start gap-1 text-xs text-charcoal-400">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="min-w-0 break-words">
              {listing.city} ·{' '}
              {listing.species.map((s) => speciesLabel(s)).join(', ')}
            </span>
          </p>

          <p className="mt-2 line-clamp-3 break-words text-sm leading-relaxed text-charcoal-600">
            {listing.description}
          </p>

          {/* The vet category must never read as a medical service. */}
          {caveat ? (
            <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-cream-100 px-2.5 py-2 text-xs leading-relaxed text-charcoal-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="min-w-0 break-words">{caveat}</span>
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge tone={availabilityTone(listing.availability)}>
              {availabilityLabel(listing.availability)}
            </Badge>
            {/* Only rendered when the provider published one. */}
            {listing.price ? (
              <Badge tone="neutral">{priceLabel(listing.price)}</Badge>
            ) : (
              <Badge tone="neutral">Price not published</Badge>
            )}
            {saved ? <Badge tone="accent">Saved</Badge> : null}
            {bookings.length > 0 ? (
              <Badge tone="positive">
                {bookings.length === 1
                  ? 'Request sent'
                  : `${bookings.length} requests sent`}
              </Badge>
            ) : null}
          </div>

          {/* A provider claim, phrased as one — never stars or a score. */}
          {listing.rating ? (
            <p className="mt-2 text-xs text-charcoal-400">
              Provider states {listing.rating.average.toFixed(1)} out of 5 from{' '}
              {listing.rating.count} reviews. Not verified by Atronz.
            </p>
          ) : null}

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
            {requestable ? (
              <Button
                size="sm"
                icon={CalendarPlus}
                onClick={onRequest}
                block
                className="sm:flex-1"
              >
                Request booking
              </Button>
            ) : null}
          </div>

          {/* Why the request control is absent, stated rather than left blank. */}
          {!requestable ? (
            <p className="mt-2 text-xs text-charcoal-400">
              {listing.availability === 'waitlist'
                ? 'This provider is waitlist only and is not taking requests here.'
                : 'This provider is not accepting requests right now.'}
            </p>
          ) : bookings.length > 0 ? (
            <p className="mt-2 text-xs text-clay-700">
              Demo request recorded. No provider was contacted.
            </p>
          ) : null}
        </div>
      </article>
    </Card>
  );
}
