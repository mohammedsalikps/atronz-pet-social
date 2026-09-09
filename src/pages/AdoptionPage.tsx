import { useCallback, useMemo, useState } from 'react';
import { Bookmark, PawPrint, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { AdoptionApplyDialog } from '@/components/adoption/AdoptionApplyDialog';
import { AdoptionCard } from '@/components/adoption/AdoptionCard';
import { AdoptionDetailDialog } from '@/components/adoption/AdoptionDetailDialog';
import { AdoptionFiltersSheet } from '@/components/adoption/AdoptionFiltersSheet';
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
  DEFAULT_ADOPTION_FILTERS,
  activeAdoptionFilterCount,
  applyAdoptionFilters,
  breedOptionsFor,
  cityOptionsFor,
  isAdoptionFiltered,
  visibleListings,
} from '@/lib/adoption';
import type { ApplicationDraft } from '@/lib/adoption';
import type { AdoptionFilters, PetReportReason } from '@/types';

/**
 * Adoption — browse listings and send a demo application.
 *
 * Listings live in `AppDataContext`; this page derives the visible set on
 * every render. Blocked and reported listings are removed before any filter
 * runs, so no filter — including "Saved only" — can surface one.
 */
export function AdoptionPage() {
  const {
    status,
    owner,
    adoptionListings,
    adoptionApplications,
    savedListingIds,
    hiddenListingIds,
    applicationFor,
    submitApplication,
    withdrawApplication,
    toggleSavedListing,
    blockListing,
    reportListing,
  } = useAppData();
  const { showToast } = useToast();

  const [filters, setFilters] = useState<AdoptionFilters>(
    DEFAULT_ADOPTION_FILTERS,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [applyId, setApplyId] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [withdrawId, setWithdrawId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const visible = useMemo(
    () =>
      visibleListings(adoptionListings, {
        hiddenIds: hiddenListingIds,
        savedIds: savedListingIds,
      }),
    [adoptionListings, hiddenListingIds, savedListingIds],
  );

  const results = useMemo(
    () => applyAdoptionFilters(visible, filters, savedListingIds),
    [visible, filters, savedListingIds],
  );

  /* Saved ids that still resolve to a visible listing. Blocking a saved
     listing must not leave a count pointing at something nobody can see. */
  const visibleSavedIds = useMemo(
    () => savedListingIds.filter((id) => visible.some((item) => item.id === id)),
    [savedListingIds, visible],
  );

  const breeds = useMemo(() => breedOptionsFor(visible), [visible]);
  const cities = useMemo(() => cityOptionsFor(visible), [visible]);
  const filterCount = activeAdoptionFilterCount(filters);

  const listingById = useCallback(
    (id: string | null) =>
      id ? (visible.find((item) => item.id === id) ?? null) : null,
    [visible],
  );

  const detailListing = listingById(detailId);
  const applyListing = listingById(applyId);
  const reportTarget = listingById(reportId);
  const withdrawTarget = withdrawId
    ? (adoptionApplications.find((item) => item.id === withdrawId) ?? null)
    : null;

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_ADOPTION_FILTERS);
    setFiltersOpen(false);
    setAnnouncement('Filters cleared.');
  }, []);

  const handleToggleSave = useCallback(
    (listingId: string) => {
      const listing = listingById(listingId);
      const wasSaved = savedListingIds.includes(listingId);
      toggleSavedListing(listingId);
      setAnnouncement(
        wasSaved
          ? `Removed ${listing?.name ?? 'listing'} from saved listings.`
          : `Saved ${listing?.name ?? 'listing'}.`,
      );
    },
    [listingById, savedListingIds, toggleSavedListing],
  );

  /* Called once from the dialog's review step, which latches after the first
     click, so this cannot run twice for one application. */
  const handleSubmitApplication = useCallback(
    (draft: ApplicationDraft) => {
      if (!applyListing) return;
      const listingName = applyListing.name;
      const application = submitApplication(applyListing.id, draft);

      setApplyId(null);

    if (!application) {
      showToast({
        tone: 'info',
        title: 'Application not submitted',
        description: `You already have an active application for ${listingName}.`,
      });
      setAnnouncement(
        `An application for ${listingName} was already active. Nothing was submitted.`,
      );
      return;
    }

    showToast({
      tone: 'success',
      title: 'Demo application recorded',
      description: `Saved on this device only. No organisation was contacted about ${listingName}.`,
    });
      setAnnouncement(
        `Demo application for ${listingName} recorded on this device. No organisation was contacted.`,
      );
    },
    [applyListing, submitApplication, showToast],
  );

  const handleConfirmWithdraw = useCallback(() => {
    if (!withdrawTarget) return;
    const listing = adoptionListings.find(
      (item) => item.id === withdrawTarget.listingId,
    );
    const ok = withdrawApplication(withdrawTarget.id);
    setWithdrawId(null);
    showToast({
      tone: ok ? 'info' : 'warning',
      title: ok ? 'Application withdrawn' : 'Nothing to withdraw',
      description: ok
        ? `Your demo application for ${listing?.name ?? 'this listing'} is no longer active. The record is kept.`
        : 'That application is no longer active.',
    });
    setAnnouncement(
      ok
        ? `Withdrew your demo application for ${listing?.name ?? 'this listing'}.`
        : 'That application was no longer active.',
    );
  }, [withdrawTarget, adoptionListings, withdrawApplication, showToast]);

  const handleReport = useCallback(
    (reason: PetReportReason) => {
      if (!reportTarget) return;
      const name = reportTarget.name;
      reportListing(reportTarget.id, reason);
      setReportId(null);
      setDetailId(null);
      showToast({
        tone: 'success',
        title: 'Listing reported',
        description: `${name} has been removed from your Adoption results.`,
      });
      setAnnouncement(`Reported ${name} and removed the listing.`);
    },
    [reportTarget, reportListing, showToast],
  );

  const handleBlock = useCallback(
    (listingId: string) => {
      const listing = listingById(listingId);
      const name = listing?.name ?? 'this listing';
      blockListing(listingId);
      setDetailId(null);
      showToast({
        tone: 'info',
        title: 'Listing blocked',
        description: `${name} will not appear in Adoption, including saved listings.`,
      });
      setAnnouncement(`Blocked ${name} and removed the listing.`);
    },
    [listingById, blockListing, showToast],
  );

  return (
    <div>
      <PageHeading
        eyebrow="Adoption & rehoming"
        title="Adoption"
        description="Browse pets looking for a home. Every listing here is demo data created for this preview."
      />

      <SafetyNotice
        title="Demo listings — nothing here is verified"
        className="mb-4"
      >
        These listings are local placeholder data. Atronz does not verify
        identity, ownership, health, vaccination or suitability, and makes no
        guarantee about a pet's health, behaviour, fertility, genetics or the
        outcome of any adoption. Applications are session-local and reach no
        organisation.
      </SafetyNotice>

      <Card className="mb-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-0 flex-1 basis-full sm:basis-64">
            <label
              htmlFor="adoption-search"
              className="block text-xs font-medium text-charcoal-600"
            >
              Search listings by name, breed or description
            </label>
            <input
              id="adoption-search"
              type="search"
              value={filters.query}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  query: event.target.value,
                }))
              }
              placeholder="Try “Poppy” or “senior”"
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

          {isAdoptionFiltered(filters) ? (
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
            {results.length} {results.length === 1 ? 'listing' : 'listings'}
            {isAdoptionFiltered(filters)
              ? results.length === 1
                ? ' matches your filters'
                : ' match your filters'
              : ' available'}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((listing) => (
              <AdoptionCard
                key={listing.id}
                listing={listing}
                application={applicationFor(listing.id)}
                saved={savedListingIds.includes(listing.id)}
                onViewDetails={() => setDetailId(listing.id)}
                onApply={() => setApplyId(listing.id)}
                onToggleSave={() => handleToggleSave(listing.id)}
              />
            ))}
          </div>
        </>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No listings to show"
          description={
            hiddenListingIds.length > 0
              ? 'You have blocked or reported every listing that was available. Blocked listings stay hidden for this session.'
              : 'No pets are listed for adoption right now. Check back later.'
          }
        />
      ) : filters.savedOnly && visibleSavedIds.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved listings yet"
          description="Save a listing with the bookmark control and it will appear here."
          actionLabel="Show all listings"
          onAction={() =>
            setFilters((current) => ({ ...current, savedOnly: false }))
          }
        />
      ) : (
        <EmptyState
          icon={PawPrint}
          title="No listings match these filters"
          description={`${visible.length} ${visible.length === 1 ? 'listing is' : 'listings are'} available, but none match what you have selected. Try widening the age range or clearing a filter.`}
          actionLabel="Clear filters"
          onAction={handleClearFilters}
        />
      )}

      <AdoptionFiltersSheet
        open={filtersOpen}
        filters={filters}
        breeds={breeds}
        cities={cities}
        listings={visible}
        savedIds={savedListingIds}
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
      <AdoptionDetailDialog
        listing={detailListing}
        application={detailId ? applicationFor(detailId) : null}
        saved={detailId ? savedListingIds.includes(detailId) : false}
        onClose={() => setDetailId(null)}
        onApply={() => {
          setApplyId(detailId);
          setDetailId(null);
        }}
        onWithdrawApplication={() => {
          const application = detailId ? applicationFor(detailId) : null;
          if (application) {
            setWithdrawId(application.id);
            setDetailId(null);
          }
        }}
        onToggleSave={() => {
          if (detailId) handleToggleSave(detailId);
        }}
        onReport={() => {
          setReportId(detailId);
          setDetailId(null);
        }}
        onBlock={() => {
          if (detailId) handleBlock(detailId);
        }}
      />

      <AdoptionApplyDialog
        listing={applyListing}
        applicantName={owner?.name ?? null}
        onClose={() => setApplyId(null)}
        onSubmit={handleSubmitApplication}
      />

      <ConfirmDialog
        open={withdrawTarget !== null}
        title="Withdraw this application?"
        description="Your demo application will be marked withdrawn. The record is kept rather than deleted, and you can apply again later."
        confirmLabel="Withdraw application"
        destructive
        onConfirm={handleConfirmWithdraw}
        onCancel={() => setWithdrawId(null)}
      />

      <ReportPetDialog
        subject={
          reportTarget
            ? {
                id: reportTarget.id,
                name: reportTarget.name,
                byline: reportTarget.listerName,
              }
            : null
        }
        title="Report this listing"
        onClose={() => setReportId(null)}
        onConfirm={handleReport}
      />
    </div>
  );
}
