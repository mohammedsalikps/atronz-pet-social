import { useCallback, useMemo, useState } from 'react';
import { Bookmark, Scissors, SlidersHorizontal, Store, X } from 'lucide-react';
import { BookingRequestDialog } from '@/components/services/BookingRequestDialog';
import { ServiceCard } from '@/components/services/ServiceCard';
import { ServiceDetailDialog } from '@/components/services/ServiceDetailDialog';
import { ServiceFiltersSheet } from '@/components/services/ServiceFiltersSheet';
import { ReportPetDialog } from '@/components/discovery/ReportPetDialog';
import { SafetyNotice } from '@/components/common/SafetyNotice';
import { PageHeading } from '@/components/layout/PageHeading';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAppData } from '@/context/appData';
import { useToast } from '@/context/toast';
import {
  DEFAULT_SERVICE_FILTERS,
  activeServiceFilterCount,
  applyServiceFilters,
  isServiceFiltered,
  serviceCityOptions,
  visibleServices,
} from '@/lib/services';
import type { BookingDraft } from '@/lib/services';
import type { PetReportReason, ServiceFilters } from '@/types';

/**
 * Services — browse providers and send a demo booking request.
 *
 * Listings live in `AppDataContext`; this page derives the visible set on
 * every render. Blocked providers are removed before any filter runs, so no
 * filter — including "Saved only" — can surface one of their services.
 */
export function ServicesPage() {
  const {
    status,
    pets,
    serviceListings,
    savedServiceIds,
    blockedProviderIds,
    bookingsForService,
    submitBooking,
    withdrawBooking,
    toggleSavedService,
    blockProvider,
    reportProvider,
  } = useAppData();
  const { showToast } = useToast();

  const [filters, setFilters] = useState<ServiceFilters>(
    DEFAULT_SERVICE_FILTERS,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [reportProviderId, setReportProviderId] = useState<string | null>(null);
  const [withdrawId, setWithdrawId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const visible = useMemo(
    () => visibleServices(serviceListings, blockedProviderIds),
    [serviceListings, blockedProviderIds],
  );

  const results = useMemo(
    () => applyServiceFilters(visible, filters, savedServiceIds),
    [visible, filters, savedServiceIds],
  );

  /* Saved ids that still resolve to a visible service, so blocking a provider
     never leaves a count pointing at something nobody can see. */
  const visibleSavedIds = useMemo(
    () => savedServiceIds.filter((id) => visible.some((item) => item.id === id)),
    [savedServiceIds, visible],
  );

  const cities = useMemo(() => serviceCityOptions(visible), [visible]);
  const filterCount = activeServiceFilterCount(filters);

  const listingById = useCallback(
    (id: string | null) =>
      id ? (visible.find((item) => item.id === id) ?? null) : null,
    [visible],
  );

  const detailListing = listingById(detailId);
  const requestListing = listingById(requestId);
  const reportTarget = reportProviderId
    ? (visible.find((item) => item.providerId === reportProviderId) ?? null)
    : null;

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_SERVICE_FILTERS);
    setFiltersOpen(false);
    setAnnouncement('Filters cleared.');
  }, []);

  const handleToggleSave = useCallback(
    (serviceId: string) => {
      const listing = listingById(serviceId);
      const wasSaved = savedServiceIds.includes(serviceId);
      toggleSavedService(serviceId);
      setAnnouncement(
        wasSaved
          ? `Removed ${listing?.name ?? 'service'} from saved services.`
          : `Saved ${listing?.name ?? 'service'}.`,
      );
    },
    [listingById, savedServiceIds, toggleSavedService],
  );

  /* Called once from the dialog's review step, which latches on first click. */
  const handleSubmitBooking = useCallback(
    (draft: BookingDraft) => {
      if (!requestListing) return;
      const name = requestListing.name;
      const provider = requestListing.providerName;
      const request = submitBooking(requestListing.id, draft);

      setRequestId(null);

      if (!request) {
        showToast({
          tone: 'info',
          title: 'Request not submitted',
          description: `You already have an active request for that pet and ${name}.`,
        });
        setAnnouncement(
          `A request for that pet and ${name} was already active. Nothing was submitted.`,
        );
        return;
      }

      showToast({
        tone: 'success',
        title: 'Demo request recorded',
        description: `Saved on this device only. ${provider} was not contacted and no appointment was made.`,
      });
      setAnnouncement(
        `Demo booking request for ${name} recorded on this device. ${provider} was not contacted and no appointment was made.`,
      );
    },
    [requestListing, submitBooking, showToast],
  );

  const handleConfirmWithdraw = useCallback(() => {
    if (!withdrawId) return;
    const ok = withdrawBooking(withdrawId);
    setWithdrawId(null);
    showToast({
      tone: ok ? 'info' : 'warning',
      title: ok ? 'Request withdrawn' : 'Nothing to withdraw',
      description: ok
        ? 'Your demo request is no longer active. The record is kept.'
        : 'That request is no longer active.',
    });
    setAnnouncement(
      ok
        ? 'Withdrew your demo booking request.'
        : 'That request was no longer active.',
    );
  }, [withdrawId, withdrawBooking, showToast]);

  const handleReport = useCallback(
    (reason: PetReportReason) => {
      if (!reportTarget) return;
      const provider = reportTarget.providerName;
      reportProvider(reportTarget.providerId, reason);
      setReportProviderId(null);
      setDetailId(null);
      showToast({
        tone: 'success',
        title: 'Provider reported',
        description: `Every service from ${provider} has been removed from your results.`,
      });
      setAnnouncement(
        `Reported ${provider} and removed all of their services.`,
      );
    },
    [reportTarget, reportProvider, showToast],
  );

  const handleBlock = useCallback(
    (providerId: string) => {
      const listing = visible.find((item) => item.providerId === providerId);
      const provider = listing?.providerName ?? 'this provider';
      blockProvider(providerId);
      setDetailId(null);
      showToast({
        tone: 'info',
        title: 'Provider blocked',
        description: `Every service from ${provider} will be hidden, saved services included.`,
      });
      setAnnouncement(`Blocked ${provider} and removed all of their services.`);
    },
    [visible, blockProvider, showToast],
  );

  return (
    <div>
      <PageHeading
        eyebrow="Pet services"
        title="Services"
        description="Grooming, walking, sitting, boarding and training. Every listing and booking request here is demo data held in this session only."
      />

      <SafetyNotice
        title="Demo listings — nothing here is verified"
        className="mb-4"
      >
        Providers, availability, prices, qualifications and reviews are
        placeholder or provider-supplied information. Atronz does not verify
        credentials, licences, insurance or service quality, and endorses no
        provider. Booking requests are session-local: no provider is contacted,
        no appointment is created, and no payment is owed.
      </SafetyNotice>

      <Card className="mb-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-0 flex-1 basis-full sm:basis-64">
            <label
              htmlFor="services-search"
              className="block text-xs font-medium text-charcoal-600"
            >
              Search services, providers or descriptions
            </label>
            <input
              id="services-search"
              type="search"
              value={filters.query}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  query: event.target.value,
                }))
              }
              placeholder="Try “grooming” or “walk”"
              className="mt-1.5 h-11 w-full rounded-2xl border border-cream-300 bg-white px-3 text-sm text-charcoal-800 transition placeholder:text-charcoal-400 hover:border-clay-200"
            />
          </div>

          <Button
            variant="secondary"
            icon={SlidersHorizontal}
            onClick={() => setFiltersOpen(true)}
            className="h-11 shrink-0"
          >
            Filters
            {filterCount > 0 ? (
              <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-clay-700 px-1.5 text-[11px] font-semibold text-white">
                {filterCount}
              </span>
            ) : null}
          </Button>

          <Button
            variant={filters.savedOnly ? 'primary' : 'secondary'}
            icon={Bookmark}
            aria-pressed={filters.savedOnly}
            onClick={() =>
              setFilters((current) => ({
                ...current,
                savedOnly: !current.savedOnly,
              }))
            }
            className="h-11 shrink-0"
          >
            Saved ({visibleSavedIds.length})
          </Button>

          {isServiceFiltered(filters) ? (
            <Button
              variant="ghost"
              icon={X}
              onClick={handleClearFilters}
              className="h-11 shrink-0"
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      </Card>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {status === 'loading' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-[440px] rounded-2xl" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <>
          <p className="mb-3 text-sm text-charcoal-500" role="status">
            {results.length} {results.length === 1 ? 'service' : 'services'}
            {isServiceFiltered(filters)
              ? results.length === 1
                ? ' matches your filters'
                : ' match your filters'
              : ' available'}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((listing) => (
              <ServiceCard
                key={listing.id}
                listing={listing}
                bookings={bookingsForService(listing.id)}
                saved={savedServiceIds.includes(listing.id)}
                onViewDetails={() => setDetailId(listing.id)}
                onRequest={() => setRequestId(listing.id)}
                onToggleSave={() => handleToggleSave(listing.id)}
              />
            ))}
          </div>
        </>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No services to show"
          description={
            blockedProviderIds.length > 0
              ? 'You have blocked or reported every provider that was available. Blocked providers stay hidden for this session.'
              : 'No providers are listed right now. Check back later.'
          }
        />
      ) : filters.savedOnly && visibleSavedIds.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved services yet"
          description="Save a service with the bookmark control and it will appear here."
          actionLabel="Show all services"
          onAction={() =>
            setFilters((current) => ({ ...current, savedOnly: false }))
          }
        />
      ) : (
        <EmptyState
          icon={Scissors}
          title="No services match these filters"
          description={`${visible.length} ${visible.length === 1 ? 'service is' : 'services are'} available, but none match what you have selected. Try clearing a filter or raising the price limit.`}
          actionLabel="Clear filters"
          onAction={handleClearFilters}
        />
      )}

      <ServiceFiltersSheet
        open={filtersOpen}
        filters={filters}
        cities={cities}
        listings={visible}
        savedIds={savedServiceIds}
        onClose={() => setFiltersOpen(false)}
        onApply={(next) => {
          setFilters(next);
          setFiltersOpen(false);
          setAnnouncement('Filters applied.');
        }}
        onClear={handleClearFilters}
      />

      {/*
        One dialog at a time throughout: every hand-off closes the dialog it
        came from, so two `aria-modal` dialogs and two focus traps are never
        active together.
      */}
      <ServiceDetailDialog
        listing={detailListing}
        bookings={detailId ? bookingsForService(detailId) : []}
        pets={pets}
        saved={detailId ? savedServiceIds.includes(detailId) : false}
        onClose={() => setDetailId(null)}
        onRequest={() => {
          setRequestId(detailId);
          setDetailId(null);
        }}
        onWithdrawBooking={(bookingId) => {
          setWithdrawId(bookingId);
          setDetailId(null);
        }}
        onToggleSave={() => {
          if (detailId) handleToggleSave(detailId);
        }}
        onReport={() => {
          setReportProviderId(detailListing?.providerId ?? null);
          setDetailId(null);
        }}
        onBlock={() => {
          if (detailListing) handleBlock(detailListing.providerId);
        }}
      />

      <BookingRequestDialog
        listing={requestListing}
        pets={pets}
        requestedPetIds={
          requestId
            ? bookingsForService(requestId).map((item) => item.petId)
            : []
        }
        onClose={() => setRequestId(null)}
        onSubmit={handleSubmitBooking}
      />

      <ConfirmDialog
        open={withdrawId !== null}
        title="Withdraw this request?"
        description="Your demo request will be marked withdrawn. The record is kept rather than deleted, and you can request again later."
        confirmLabel="Withdraw request"
        destructive
        onConfirm={handleConfirmWithdraw}
        onCancel={() => setWithdrawId(null)}
      />

      <ReportPetDialog
        subject={
          reportTarget
            ? {
                id: reportTarget.providerId,
                name: reportTarget.providerName,
                byline: `${reportTarget.city} · provider`,
              }
            : null
        }
        title="Report this provider"
        onClose={() => setReportProviderId(null)}
        onConfirm={handleReport}
      />
    </div>
  );
}
