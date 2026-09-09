import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Archive, Heart, Inbox, Link2, Send } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PetProfileDialog } from '@/components/discovery/PetProfileDialog';
import { ReportPetDialog } from '@/components/discovery/ReportPetDialog';
import { ConnectionCard } from '@/components/matches/ConnectionCard';
import { InterestCard } from '@/components/matches/InterestCard';
import { SafetyNotice } from '@/components/common/SafetyNotice';
import { PageHeading } from '@/components/layout/PageHeading';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAppData } from '@/context/appData';
import { useToast } from '@/context/toast';
import { buildCompatibility } from '@/lib/discovery';
import {
  MATCHES_TABS,
  sortConnections,
  splitInterests,
} from '@/lib/matches';
import type { MatchesTabId } from '@/lib/matches';
import { cn } from '@/lib/utils';
import type { PetReportReason } from '@/types';

type PendingAction =
  | { kind: 'accept'; interestId: string; petName: string }
  | { kind: 'decline'; interestId: string; petName: string }
  | { kind: 'withdraw'; interestId: string; petName: string };

/**
 * Matches — the viewer's interests and accepted connections.
 *
 * Every section is derived from the one interest list in `AppDataContext`, so
 * the tab counts and the rows underneath cannot disagree. Blocked and reported
 * pets are filtered out before anything is split, so no section can surface a
 * pet the viewer removed.
 */
export function MatchesPage() {
  const {
    status,
    pets,
    discoverablePets,
    interests,
    connections,
    petBlocks,
    petReports,
    relationshipFor,
    acceptInterest,
    declineInterest,
    withdrawInterest,
    reportPet,
    blockPet,
  } = useAppData();
  const { showToast } = useToast();

  const [tab, setTab] = useState<MatchesTabId>('received');
  const [profilePetId, setProfilePetId] = useState<string | null>(null);
  const [reportPetId, setReportPetId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const blockedIds = useMemo(
    () => [
      ...petBlocks.map((block) => block.petId),
      ...petReports.map((report) => report.petId),
    ],
    [petBlocks, petReports],
  );

  /** Pet lookup, minus anything blocked or reported. */
  const petById = useCallback(
    (petId: string) =>
      discoverablePets.find(
        (pet) => pet.id === petId && !blockedIds.includes(pet.id),
      ) ?? null,
    [discoverablePets, blockedIds],
  );

  /* A row is only shown when its pet is still visible to the viewer. */
  const usableInterests = useMemo(
    () => interests.filter((interest) => petById(interest.petId) !== null),
    [interests, petById],
  );

  const sections = useMemo(
    () => splitInterests(usableInterests),
    [usableInterests],
  );

  const usableConnections = useMemo(
    () =>
      sortConnections(
        connections.filter((item) => petById(item.petId) !== null),
      ),
    [connections, petById],
  );

  const counts: Record<MatchesTabId, number> = {
    received: sections.received.length,
    sent: sections.sent.length,
    connections: usableConnections.length,
    history: sections.history.length,
  };

  const ownPetById = useCallback(
    (petId: string | null) =>
      petId ? (pets.find((pet) => pet.id === petId) ?? null) : null,
    [pets],
  );

  const profilePet = profilePetId ? petById(profilePetId) : null;
  const reportTarget = reportPetId ? petById(reportPetId) : null;

  const compatibilityFor = useCallback(
    (petId: string | null) => {
      const pet = petId ? petById(petId) : null;
      if (!pet) {
        return {
          comparedWithPetId: null,
          notes: [],
          sharedCount: 0,
          totalCount: 0,
        };
      }
      return buildCompatibility(pet, pets[0] ?? null);
    },
    [petById, pets],
  );

  const runPendingAction = useCallback(() => {
    if (!pendingAction) return;
    const { kind, interestId, petName } = pendingAction;
    setPendingAction(null);
    setProfilePetId(null);

    if (kind === 'accept') {
      const connection = acceptInterest(interestId);
      if (!connection) {
        // The context refused it — already resolved, or already connected.
        showToast({
          tone: 'info',
          title: 'Nothing to accept',
          description: `This interest in ${petName} is no longer pending.`,
        });
        setAnnouncement(`Interest in ${petName} was no longer pending.`);
        return;
      }
      showToast({
        tone: 'success',
        title: 'Connection created',
        description: `You are connected about ${petName}. No contact details were shared.`,
      });
      setAnnouncement(
        `Accepted the interest about ${petName}. A connection was created and no contact details were shared.`,
      );
      setTab('connections');
      return;
    }

    if (kind === 'decline') {
      const ok = declineInterest(interestId);
      showToast({
        tone: ok ? 'info' : 'warning',
        title: ok ? 'Interest declined' : 'Nothing to decline',
        description: ok
          ? `The interest about ${petName} was declined. It stays in History.`
          : `This interest in ${petName} is no longer pending.`,
      });
      setAnnouncement(
        ok
          ? `Declined the interest about ${petName}. It moved to History.`
          : `Interest in ${petName} was no longer pending.`,
      );
      return;
    }

    const ok = withdrawInterest(interestId);
    showToast({
      tone: ok ? 'info' : 'warning',
      title: ok ? 'Interest withdrawn' : 'Nothing to withdraw',
      description: ok
        ? `Your interest in ${petName} is no longer pending. It stays in History.`
        : `This interest in ${petName} is no longer pending.`,
    });
    setAnnouncement(
      ok
        ? `Withdrew your interest in ${petName}. It moved to History.`
        : `Interest in ${petName} was no longer pending.`,
    );
  }, [
    pendingAction,
    acceptInterest,
    declineInterest,
    withdrawInterest,
    showToast,
  ]);

  const handleReport = useCallback(
    (reason: PetReportReason) => {
      if (!reportTarget) return;
      const name = reportTarget.name;
      reportPet(reportTarget.id, reason);
      setReportPetId(null);
      setProfilePetId(null);
      showToast({
        tone: 'success',
        title: 'Profile reported',
        description: `${name} has been removed from Matches and Discover.`,
      });
      setAnnouncement(`Reported ${name} and removed them from Matches.`);
    },
    [reportTarget, reportPet, showToast],
  );

  const handleBlock = useCallback(
    (petId: string) => {
      const pet = petById(petId);
      const name = pet?.name ?? 'this pet';
      blockPet(petId);
      setProfilePetId(null);
      showToast({
        tone: 'info',
        title: 'Pet blocked',
        description: `${name} will not appear in Matches or Discover.`,
      });
      setAnnouncement(`Blocked ${name} and removed them from Matches.`);
    },
    [petById, blockPet, showToast],
  );

  const onTabKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const index = MATCHES_TABS.findIndex((item) => item.id === tab);
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    const next = (index + delta + MATCHES_TABS.length) % MATCHES_TABS.length;
    setTab(MATCHES_TABS[next].id);
  };

  const activeTab = MATCHES_TABS.find((item) => item.id === tab);

  return (
    <div>
      <PageHeading
        eyebrow="Connections"
        title="Matches"
        description="A demo connection area. Interests and connections here are session-local and are not sent to anyone."
      />

      <SafetyNotice title="Demo connections — nothing is verified" className="mb-4">
        Connections exist only in this browser session and disappear on reload.
        Accepting an interest does not verify identity, ownership, health,
        vaccination, fertility, genetics or breeding suitability, and it does
        not share a phone number, email address, exact address or location.
        Never share private contact or location details here.
      </SafetyNotice>

      <div
        role="tablist"
        aria-label="Matches sections"
        onKeyDown={onTabKeyDown}
        className="no-scrollbar flex gap-1.5 overflow-x-auto rounded-full border border-cream-300 bg-cream-50 p-1"
      >
        {MATCHES_TABS.map((item) => {
          const selected = item.id === tab;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`matches-tab-${item.id}`}
              aria-selected={selected}
              aria-controls="matches-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => setTab(item.id)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition',
                selected
                  ? 'bg-clay-700 text-white shadow-sm'
                  : 'text-charcoal-500 hover:bg-white hover:text-charcoal-800',
              )}
            >
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.shortLabel}</span>
              <span
                className={cn(
                  'flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums',
                  selected ? 'bg-white/20 text-white' : 'bg-cream-200 text-charcoal-600',
                )}
              >
                {counts[item.id]}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 px-1 text-xs text-charcoal-400">
        {activeTab?.hint}
      </p>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <div
        id="matches-panel"
        role="tabpanel"
        aria-labelledby={`matches-tab-${tab}`}
        className="mt-4"
      >
        {status === 'loading' ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : tab === 'connections' ? (
          usableConnections.length > 0 ? (
            <div className="space-y-3">
              {usableConnections.map((connection) => {
                const pet = petById(connection.petId);
                if (!pet) return null;
                return (
                  <ConnectionCard
                    key={connection.id}
                    connection={connection}
                    pet={pet}
                    ownPet={ownPetById(connection.fromPetId)}
                    onViewProfile={() => setProfilePetId(pet.id)}
                  />
                );
              })}
            </div>
          ) : (
            <MatchesEmpty
              icon={Link2}
              title="No connections yet"
              description="Accept a received interest and it will appear here. Connections never reveal contact details."
              actionLabel={counts.received > 0 ? 'See received interests' : undefined}
              onAction={counts.received > 0 ? () => setTab('received') : undefined}
            />
          )
        ) : (
          (() => {
            const list =
              tab === 'received'
                ? sections.received
                : tab === 'sent'
                  ? sections.sent
                  : sections.history;

            if (list.length === 0) {
              return tab === 'received' ? (
                <MatchesEmpty
                  icon={Inbox}
                  title="No received interests"
                  description="When another owner expresses interest in one of your pets, it will appear here for you to accept or decline."
                />
              ) : tab === 'sent' ? (
                <MatchesEmpty
                  icon={Send}
                  title="No interests sent"
                  description="Send an interest from Discover and it will show up here while it is pending."
                  actionLabel="Go to Discover"
                  to="/discover"
                />
              ) : (
                <MatchesEmpty
                  icon={Archive}
                  title="No history yet"
                  description="Declined and withdrawn interests are kept here rather than deleted."
                />
              );
            }

            return (
              <div className="space-y-3">
                {list.map((interest) => {
                  const pet = petById(interest.petId);
                  if (!pet) return null;
                  return (
                    <InterestCard
                      key={interest.id}
                      interest={interest}
                      pet={pet}
                      ownPet={ownPetById(interest.fromPetId)}
                      onViewProfile={() => setProfilePetId(pet.id)}
                      onAccept={() =>
                        setPendingAction({
                          kind: 'accept',
                          interestId: interest.id,
                          petName: pet.name,
                        })
                      }
                      onDecline={() =>
                        setPendingAction({
                          kind: 'decline',
                          interestId: interest.id,
                          petName: pet.name,
                        })
                      }
                      onWithdraw={() =>
                        setPendingAction({
                          kind: 'withdraw',
                          interestId: interest.id,
                          petName: pet.name,
                        })
                      }
                    />
                  );
                })}
              </div>
            );
          })()
        )}
      </div>

      {/*
        One dialog at a time. Opening report from the profile closes the
        profile first, so two `aria-modal` dialogs and two focus traps are
        never active together.
      */}
      <PetProfileDialog
        pet={profilePet}
        compatibility={compatibilityFor(profilePetId)}
        relationship={
          profilePetId
            ? relationshipFor(profilePetId)
            : { status: null, direction: null }
        }
        onClose={() => setProfilePetId(null)}
        onAccept={() => {
          const interest = sections.received.find(
            (item) => item.petId === profilePetId,
          );
          if (interest && profilePet) {
            setPendingAction({
              kind: 'accept',
              interestId: interest.id,
              petName: profilePet.name,
            });
            setProfilePetId(null);
          }
        }}
        onDecline={() => {
          const interest = sections.received.find(
            (item) => item.petId === profilePetId,
          );
          if (interest && profilePet) {
            setPendingAction({
              kind: 'decline',
              interestId: interest.id,
              petName: profilePet.name,
            });
            setProfilePetId(null);
          }
        }}
        onWithdrawInterest={() => {
          const interest = sections.sent.find(
            (item) => item.petId === profilePetId,
          );
          if (interest && profilePet) {
            setPendingAction({
              kind: 'withdraw',
              interestId: interest.id,
              petName: profilePet.name,
            });
            setProfilePetId(null);
          }
        }}
        onReport={() => {
          setReportPetId(profilePetId);
          setProfilePetId(null);
        }}
        onBlock={() => {
          if (profilePetId) handleBlock(profilePetId);
        }}
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

      <ConfirmDialog
        open={pendingAction !== null}
        title={
          pendingAction?.kind === 'accept'
            ? 'Accept this interest?'
            : pendingAction?.kind === 'decline'
              ? 'Decline this interest?'
              : 'Withdraw this interest?'
        }
        description={
          pendingAction?.kind === 'accept'
            ? `This creates a demo connection about ${pendingAction.petName}. It does not share your phone number, email address, exact address or location, and it does not verify anything about the pet or its owner.`
            : pendingAction?.kind === 'decline'
              ? `The interest about ${pendingAction.petName} will be marked declined and moved to History. Nothing is shared and the other owner is not notified.`
              : `Your interest in ${pendingAction?.petName} will be marked withdrawn and moved to History. You can send a new interest later from Discover.`
        }
        confirmLabel={
          pendingAction?.kind === 'accept'
            ? 'Accept interest'
            : pendingAction?.kind === 'decline'
              ? 'Decline interest'
              : 'Withdraw interest'
        }
        destructive={pendingAction?.kind !== 'accept'}
        onConfirm={runPendingAction}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}

function MatchesEmpty({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  to,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  to?: string;
}) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      actionLabel={onAction ? actionLabel : undefined}
      onAction={onAction}
    >
      {/* A styled Link, not a Button wrapping one — a button containing an
          anchor is invalid HTML and confuses assistive tech. */}
      {to && actionLabel ? (
        <div className="flex justify-center">
          <Link
            to={to}
            className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 bg-white px-3 py-1.5 text-[13px] font-medium text-charcoal-700 transition hover:border-clay-200 hover:text-charcoal-900"
          >
            <Heart className="h-3.5 w-3.5" aria-hidden="true" />
            {actionLabel}
          </Link>
        </div>
      ) : null}
    </EmptyState>
  );
}
