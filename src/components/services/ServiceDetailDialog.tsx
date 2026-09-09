import {
  Ban,
  Bookmark,
  CalendarPlus,
  Flag,
  Info,
  ListChecks,
  MapPin,
} from 'lucide-react';
import { PetPhoto } from '@/components/discovery/PetPhoto';
import { SafetyNotice } from '@/components/common/SafetyNotice';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatRelativeTime } from '@/lib/feed';
import {
  availabilityLabel,
  availabilityTone,
  canRequest,
  categoryCaveat,
  priceLabel,
  serviceCategoryLabel,
} from '@/lib/services';
import { speciesLabel } from '@/lib/utils';
import type { BookingRequest, PetProfile, ServiceListing } from '@/types';

export interface ServiceDetailDialogProps {
  listing: ServiceListing | null;
  bookings: BookingRequest[];
  /** For naming which pet each request was made for. */
  pets: PetProfile[];
  saved: boolean;
  onClose: () => void;
  onRequest: () => void;
  onWithdrawBooking: (bookingId: string) => void;
  onToggleSave: () => void;
  onReport: () => void;
  onBlock: () => void;
}

/**
 * Full service detail.
 *
 * A bottom sheet on mobile and a dialog above `sm`, from the shared Modal, so
 * Escape, the focus trap and focus restoration behave as everywhere else.
 */
export function ServiceDetailDialog({
  listing,
  bookings,
  pets,
  saved,
  onClose,
  onRequest,
  onWithdrawBooking,
  onToggleSave,
  onReport,
  onBlock,
}: ServiceDetailDialogProps) {
  if (!listing) return null;

  const requestable = canRequest(listing);
  const caveat = categoryCaveat(listing.category);
  const petName = (petId: string) =>
    pets.find((pet) => pet.id === petId)?.name ?? 'your pet';

  return (
    <Modal
      open
      onClose={onClose}
      title={listing.name}
      description={`${serviceCategoryLabel(listing.category)} · ${listing.providerName}`}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} block className="sm:w-auto">
            Close
          </Button>
          <Button
            variant="secondary"
            icon={Bookmark}
            onClick={onToggleSave}
            aria-pressed={saved}
            block
            className="sm:w-auto"
          >
            {saved ? 'Saved' : 'Save service'}
          </Button>
          {requestable ? (
            <Button
              icon={CalendarPlus}
              onClick={onRequest}
              block
              className="sm:w-auto"
            >
              Request booking
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={availabilityTone(listing.availability)}>
            {availabilityLabel(listing.availability)}
          </Badge>
          {listing.price ? (
            <Badge tone="neutral">{priceLabel(listing.price)}</Badge>
          ) : (
            <Badge tone="neutral">Price not published</Badge>
          )}
          {saved ? <Badge tone="accent">Saved</Badge> : null}
        </div>

        {caveat ? (
          <p className="flex items-start gap-1.5 rounded-2xl border border-cream-300 bg-cream-100 px-3 py-2.5 text-xs leading-relaxed text-charcoal-600">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 break-words">{caveat}</span>
          </p>
        ) : null}

        {listing.photos.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {listing.photos.map((photo) => (
              <PetPhoto
                key={photo.id}
                photo={photo}
                fallbackAlt={`Photo for ${listing.name}`}
                className="aspect-[4/3] w-full rounded-xl border border-cream-200"
              />
            ))}
          </div>
        ) : (
          <PetPhoto
            photo={undefined}
            fallbackAlt={`No photo shared for ${listing.name}`}
            className="aspect-[16/9] w-full rounded-xl border border-cream-200"
          />
        )}

        <section>
          <h3 className="text-sm font-semibold text-charcoal-800">
            About this service
          </h3>
          <p className="mt-1.5 break-words text-sm leading-relaxed text-charcoal-600">
            {listing.description}
          </p>
          <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Detail
              label="Category"
              value={serviceCategoryLabel(listing.category)}
            />
            <Detail
              label="Works with"
              value={listing.species.map((s) => speciesLabel(s)).join(', ')}
            />
            <Detail
              label="Availability"
              value={availabilityLabel(listing.availability)}
            />
            <Detail
              label="Price"
              value={
                listing.price ? priceLabel(listing.price) : 'Not published'
              }
            />
          </dl>
          <p className="mt-2 flex items-start gap-1.5 text-sm text-charcoal-500">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 break-words">
              {listing.city} — city only, no precise location or address
            </span>
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-charcoal-800">
            Provider-supplied notes
          </h3>
          {listing.qualifications.length > 0 ? (
            <ul className="mt-2 space-y-1.5">
              {listing.qualifications.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <ListChecks
                    className="mt-0.5 h-4 w-4 shrink-0 text-clay-600"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 break-words text-charcoal-600">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1.5 text-sm text-charcoal-500">
              This provider published no notes.
            </p>
          )}
          {listing.rating ? (
            <p className="mt-2 text-sm text-charcoal-600">
              Provider states {listing.rating.average.toFixed(1)} out of 5 from{' '}
              {listing.rating.count} reviews.
            </p>
          ) : (
            <p className="mt-2 text-sm text-charcoal-500">
              This provider published no rating.
            </p>
          )}
          <p className="mt-1.5 text-xs text-charcoal-400">
            All of the above is written by the provider. Atronz does not check
            qualifications, licences, reviews or insurance, and no listing here
            is endorsed, certified or approved by Atronz.
          </p>
        </section>

        {/* Only rendered when the provider actually wrote them. */}
        {listing.preparationNotes.length > 0 ? (
          <section>
            <h3 className="text-sm font-semibold text-charcoal-800">
              How to prepare
            </h3>
            <ul className="mt-2 space-y-1.5">
              {listing.preparationNotes.map((note) => (
                <li key={note} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clay-400" aria-hidden="true" />
                  <span className="min-w-0 break-words text-charcoal-600">
                    {note}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {listing.cancellationNote ? (
          <section>
            <h3 className="text-sm font-semibold text-charcoal-800">
              Cancellation
            </h3>
            <p className="mt-1.5 break-words text-sm leading-relaxed text-charcoal-600">
              {listing.cancellationNote}
            </p>
          </section>
        ) : null}

        {/* The viewer's own demo requests for this service. */}
        {bookings.length > 0 ? (
          <section>
            <h3 className="text-sm font-semibold text-charcoal-800">
              Your demo requests
            </h3>
            <ul className="mt-2 space-y-2">
              {bookings.map((booking) => (
                <li
                  key={booking.id}
                  className="rounded-2xl border border-cream-300 bg-cream-50 p-3"
                >
                  <p className="break-words text-sm font-medium text-charcoal-800">
                    For {petName(booking.petId)} · {booking.preferredDate}
                  </p>
                  <p className="mt-0.5 break-words text-xs text-charcoal-500">
                    {booking.timeWindow} · sent{' '}
                    <time dateTime={new Date(booking.submittedAt).toISOString()}>
                      {formatRelativeTime(booking.submittedAt)}
                    </time>
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onWithdrawBooking(booking.id)}
                    className="mt-2"
                  >
                    Withdraw request
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <SafetyNotice title="Demo listing — nothing here is verified">
          Providers, availability, prices, qualifications and reviews are
          placeholder or provider-supplied information in a preview build.
          Atronz does not verify any of it and makes no claim about service
          quality or safety. Booking requests are session-local: no provider is
          contacted, no appointment is made, and no payment is owed.
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
              Report this provider
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={Ban}
              onClick={onBlock}
              block
              className="sm:w-auto"
            >
              Block this provider
            </Button>
          </div>
          <p className="mt-1.5 text-xs text-charcoal-400">
            Blocking removes every service from {listing.providerName}, saved
            services included.
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
