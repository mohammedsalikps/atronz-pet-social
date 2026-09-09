import { Link2, MessageCircleOff } from 'lucide-react';
import { PetPhoto } from '@/components/discovery/PetPhoto';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ageLabel } from '@/lib/discovery';
import { formatRelativeTime } from '@/lib/feed';
import { speciesLabel } from '@/lib/utils';
import type { Connection, DiscoverablePet, PetProfile } from '@/types';

export interface ConnectionCardProps {
  connection: Connection;
  pet: DiscoverablePet;
  ownPet: PetProfile | null;
  onViewProfile: () => void;
}

/**
 * An accepted connection.
 *
 * Shows both pets and states plainly what acceptance did not do. Messaging is
 * not built, so the control is disabled and labelled rather than pretending a
 * message could be sent.
 */
export function ConnectionCard({
  connection,
  pet,
  ownPet,
  onViewProfile,
}: ConnectionCardProps) {
  return (
    <Card padded={false}>
      <article
        aria-label={`Connection with ${pet.name}`}
        className="p-4"
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Badge tone="positive">
            <Link2 className="h-3 w-3" aria-hidden="true" />
            Connected
          </Badge>
          <time
            dateTime={new Date(connection.createdAt).toISOString()}
            className="text-xs text-charcoal-400"
          >
            {formatRelativeTime(connection.createdAt)}
          </time>
        </div>

        {/* Both pets, side by side. */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <Avatar
              name={ownPet?.name ?? 'Your pet'}
              size="lg"
              shape="rounded"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-charcoal-900">
                {ownPet?.name ?? 'Your pet'}
              </p>
              <p className="truncate text-xs text-charcoal-500">
                {ownPet ? `${speciesLabel(ownPet.species)} · ${ownPet.breed}` : 'Your side'}
              </p>
            </div>
          </div>

          <Link2
            className="h-4 w-4 shrink-0 text-charcoal-400"
            aria-hidden="true"
          />

          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <PetPhoto
              photo={pet.photos[0]}
              fallbackAlt={`No photo shared for ${pet.name}`}
              className="h-12 w-12 shrink-0 rounded-xl border border-cream-200"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-charcoal-900">
                {pet.name}
              </p>
              <p className="truncate text-xs text-charcoal-500">
                {speciesLabel(pet.species)} · {ageLabel(pet)}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-3 break-words rounded-xl bg-cream-50 px-3 py-2 text-xs leading-relaxed text-charcoal-500">
          Accepting shared no phone number, email address, exact address or
          location. {pet.ownerName} is in {pet.city} — city only.
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
          {/*
            Messaging is not built. A disabled control that says so is honest;
            a live-looking button that does nothing is not.
          */}
          <Button
            variant="secondary"
            size="sm"
            icon={MessageCircleOff}
            disabled
            block
            className="sm:w-auto"
            title="Messaging arrives in a later step"
          >
            Messaging coming next
          </Button>
        </div>
      </article>
    </Card>
  );
}
