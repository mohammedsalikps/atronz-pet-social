import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, EyeOff, PawPrint, SlidersHorizontal, X } from 'lucide-react';
import { DiscoveryFiltersSheet } from '@/components/discovery/DiscoveryFiltersSheet';
import { DiscoveryPetCard } from '@/components/discovery/DiscoveryPetCard';
import { PetProfileDialog } from '@/components/discovery/PetProfileDialog';
import { ReportPetDialog } from '@/components/discovery/ReportPetDialog';
import { SendInterestDialog } from '@/components/discovery/SendInterestDialog';
import { SafetyNotice } from '@/components/common/SafetyNotice';
import { PageHeading } from '@/components/layout/PageHeading';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAppData } from '@/context/appData';
import { useToast } from '@/context/toast';
import {
  DEFAULT_FILTERS,
  activeFilterCount,
  applyFilters,
  breedOptions,
  buildCompatibility,
  cityOptions,
  discoverableFor,
  isFiltered,
} from '@/lib/discovery';
import type { DiscoveryFilters, PetReportReason } from '@/types';

/**
 * Discover — browse pets whose owners opted in.
 *
 * The source list lives in `AppDataContext`; this page derives the visible set
 * from it on every render. Nothing descriptive is presented as verified, and
 * no contact detail is rendered anywhere.
 */
export function DiscoverPage() {
  const {
    status,
    owner,
    pets,
    privacy,
    discoverablePets,
    petBlocks,
    petReports,
    interestFor,
    relationshipFor,
    sendInterest,
    withdrawInterest,
    blockPet,
    reportPet,
  } = useAppData();
  const { showToast } = useToast();

  const [filters, setFilters] = useState<DiscoveryFilters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [profilePetId, setProfilePetId] = useState<string | null>(null);
  const [interestPetId, setInterestPetId] = useState<string | null>(null);
  const [reportPetId, setReportPetId] = useState<string | null>(null);
  const [comparePetId, setComparePetId] = useState<string>('');
  const [announcement, setAnnouncement] = useState('');

  /* Visible set, derived from source data on every render. */
  const visible = useMemo(
    () =>
      discoverableFor(discoverablePets, {
        viewerId: owner?.id ?? '',
        blockedPetIds: petBlocks.map((block) => block.petId),
        reportedPetIds: petReports.map((report) => report.petId),
      }),
    [discoverablePets, owner, petBlocks, petReports],
  );

  const results = useMemo(
    () => applyFilters(visible, filters),
    [visible, filters],
  );

  const breeds = useMemo(() => breedOptions(visible), [visible]);
  const cities = useMemo(() => cityOptions(visible), [visible]);

  /* The viewer's pet that compatibility is measured against. */
  const comparePet =
    pets.find((pet) => pet.id === comparePetId) ?? pets[0] ?? null;

  const compatibilityFor = useCallback(
    (petId: string) => {
      const pet = visible.find((item) => item.id === petId);
      if (!pet) {
        return {
          comparedWithPetId: null,
          notes: [],
          sharedCount: 0,
          totalCount: 0,
        };
      }
      return buildCompatibility(pet, comparePet);
    },
    [visible, comparePet],
  );

  const profilePet = profilePetId
    ? (visible.find((pet) => pet.id === profilePetId) ?? null)
    : null;
  const interestPet = interestPetId
    ? (visible.find((pet) => pet.id === interestPetId) ?? null)
    : null;
  const reportTarget = reportPetId
    ? (visible.find((pet) => pet.id === reportPetId) ?? null)
    : null;

  const filterCount = activeFilterCount(filters);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setFiltersOpen(false);
    setAnnouncement('Filters cleared.');
  }, []);

  const handleConfirmInterest = useCallback(
    (fromPetId: string | null) => {
      if (!interestPet) return;
      const request = sendInterest(interestPet.id, fromPetId);
      setInterestPetId(null);

      if (!request) {
        // The context refused a duplicate — say so rather than pretending.
        showToast({
          tone: 'info',
          title: 'Interest already sent',
          description: `You already have a pending interest in ${interestPet.name}.`,
        });
        setAnnouncement(`Interest in ${interestPet.name} was already pending.`);
        return;
      }

      showToast({
        tone: 'success',
        title: 'Interest recorded',
        description: `Saved on this device only. ${interestPet.name}'s owner has not been contacted.`,
      });
      setAnnouncement(
        `Interest in ${interestPet.name} recorded. The owner has not been contacted.`,
      );
    },
    [interestPet, sendInterest, showToast],
  );

  const handleWithdraw = useCallback(
    (petId: string) => {
      const pet = visible.find((item) => item.id === petId);
      // Withdraw is keyed by interest id now; Discover resolves it from the pet.
      const interest = interestFor(petId);
      if (!interest) return;
      withdrawInterest(interest.id);
      showToast({
        tone: 'info',
        title: 'Interest withdrawn',
        description: pet
          ? `Your interest in ${pet.name} is no longer pending.`
          : 'Your interest is no longer pending.',
      });
      setAnnouncement(
        pet ? `Withdrew your interest in ${pet.name}.` : 'Interest withdrawn.',
      );
    },
    [visible, interestFor, withdrawInterest, showToast],
  );

  const handleBlock = useCallback(
    (petId: string) => {
      const pet = visible.find((item) => item.id === petId);
      blockPet(petId);
      setProfilePetId(null);
      showToast({
        tone: 'info',
        title: 'Pet blocked',
        description: pet
          ? `${pet.name} will not appear in your Discover results.`
          : 'This pet will not appear in your Discover results.',
      });
      setAnnouncement(
        pet
          ? `Blocked ${pet.name} and removed them from Discover.`
          : 'Blocked and removed from Discover.',
      );
    },
    [visible, blockPet, showToast],
  );

  const handleReport = useCallback(
    (reason: PetReportReason) => {
      if (!reportTarget) return;
      reportPet(reportTarget.id, reason);
      setReportPetId(null);
      setProfilePetId(null);
      showToast({
        tone: 'success',
        title: 'Profile reported',
        description: `${reportTarget.name} has been removed from your Discover results. Reports stay on this device in the preview.`,
      });
      setAnnouncement(
        `Reported ${reportTarget.name} and removed them from Discover.`,
      );
    },
    [reportTarget, reportPet, showToast],
  );

  return (
    <div>
      <PageHeading
        eyebrow="Discovery"
        title="Discover Pets"
        description="Browse pets whose owners chose to appear here. Every detail below is owner-provided and unverified."
      />

      <SafetyNotice title="Demo only — no medical or genetic assessment" className="mb-4">
        This is placeholder data in a preview build. Atronz Pet Social does not
        screen for any condition, does not assess fertility, genetics or
        pedigree, and guarantees nothing about any pairing. The compatibility
        preview only compares details owners typed into their own profiles.
        Speak to a licensed veterinarian before making any decision.
      </SafetyNotice>

      {/* Search, filter and clear — one row, wrapping on small screens. */}
      <Card className="mb-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-0 flex-1 basis-full sm:basis-64">
            <label
              htmlFor="discover-search"
              className="block text-xs font-medium text-charcoal-600"
            >
              Search by name or breed
            </label>
            <input
              id="discover-search"
              type="search"
              value={filters.query}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  query: event.target.value,
                }))
              }
              placeholder="Try “Indie” or “Ladoo”"
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

          {isFiltered(filters) ? (
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

        {pets.length > 1 ? (
          <div className="mt-3 border-t border-cream-200 pt-3">
            <label
              htmlFor="discover-compare"
              className="block text-xs font-medium text-charcoal-600"
            >
              Compare details against
            </label>
            <select
              id="discover-compare"
              value={comparePet?.id ?? ''}
              onChange={(event) => setComparePetId(event.target.value)}
              className="mt-1.5 h-11 w-full rounded-2xl border border-cream-300 bg-white px-3 text-sm text-charcoal-800 transition hover:border-clay-200 sm:max-w-xs"
            >
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} · {pet.breed}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </Card>

      {/* Your own discoverability, stated plainly. Off by default. */}
      {!privacy.discoverable ? (
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3">
          <Badge tone="neutral">
            <EyeOff className="h-3 w-3" aria-hidden="true" />
            Your pets are hidden
          </Badge>
          <p className="min-w-0 flex-1 text-sm text-charcoal-500">
            You can browse without appearing here. Discoverability is off until
            you turn it on.
          </p>
          <Link
            to="/profile"
            className="shrink-0 text-sm font-medium text-clay-700 underline underline-offset-2 transition hover:text-clay-800"
          >
            Privacy controls
          </Link>
        </div>
      ) : null}

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {status === 'loading' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-[420px] rounded-2xl" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <>
          <p className="mb-3 text-sm text-charcoal-500" role="status">
            {results.length} {results.length === 1 ? 'pet' : 'pets'}
            {isFiltered(filters)
              ? results.length === 1
                ? ' matches your filters'
                : ' match your filters'
              : ' available'}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((pet) => (
              <DiscoveryPetCard
                key={pet.id}
                pet={pet}
                compatibility={compatibilityFor(pet.id)}
                hasPendingInterest={interestFor(pet.id) !== null}
                onViewProfile={() => setProfilePetId(pet.id)}
                onSendInterest={() => setInterestPetId(pet.id)}
                onWithdrawInterest={() => handleWithdraw(pet.id)}
              />
            ))}
          </div>
        </>
      ) : visible.length === 0 ? (
        /* Nothing to show at all — everything blocked, reported, or opted out. */
        <EmptyState
          icon={Compass}
          title="No discoverable pets right now"
          description={
            petBlocks.length > 0 || petReports.length > 0
              ? 'You have blocked or reported every pet that was available. Blocked and reported profiles stay hidden for this session.'
              : 'No owners have opted in to Discover yet. Check back later.'
          }
        />
      ) : (
        /* Pets exist, but the filters excluded all of them. */
        <EmptyState
          icon={PawPrint}
          title="No pets match these filters"
          description={`${visible.length} ${visible.length === 1 ? 'pet is' : 'pets are'} available, but none match what you have selected. Try widening the age range or clearing a filter.`}
          actionLabel="Clear filters"
          onAction={handleClearFilters}
        />
      )}

      <DiscoveryFiltersSheet
        open={filtersOpen}
        filters={filters}
        breeds={breeds}
        cities={cities}
        pets={visible}
        onClose={() => setFiltersOpen(false)}
        onApply={(next) => {
          setFilters(next);
          setFiltersOpen(false);
          setAnnouncement('Filters applied.');
        }}
        onClear={handleClearFilters}
      />

      <PetProfileDialog
        pet={profilePet}
        compatibility={compatibilityFor(profilePetId ?? '')}
        relationship={
          profilePetId
            ? relationshipFor(profilePetId)
            : { status: null, direction: null }
        }
        onClose={() => setProfilePetId(null)}
        onSendInterest={() => {
          setProfilePetId(null);
          setInterestPetId(profilePetId);
        }}
        onWithdrawInterest={() => {
          if (profilePetId) handleWithdraw(profilePetId);
        }}
        /* Close the profile first: two stacked `aria-modal` dialogs leave
           assistive tech unsure which one is modal, and both focus traps stay
           armed. Same hand-off the interest flow uses. */
        onReport={() => {
          setReportPetId(profilePetId);
          setProfilePetId(null);
        }}
        onBlock={() => {
          if (profilePetId) handleBlock(profilePetId);
        }}
      />

      <SendInterestDialog
        pet={interestPet}
        pets={pets}
        onClose={() => setInterestPetId(null)}
        onConfirm={handleConfirmInterest}
      />

      <ReportPetDialog
        subject={
          reportTarget
            ? {
                id: reportTarget.id,
                name: reportTarget.name,
                byline: reportTarget.ownerName,
              }
            : null
        }
        onClose={() => setReportPetId(null)}
        onConfirm={handleReport}
      />
    </div>
  );
}
