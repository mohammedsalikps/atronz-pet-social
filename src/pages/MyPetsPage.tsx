import { useCallback, useMemo, useState } from 'react';
import { Check, PawPrint, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { PetFormDialog } from '@/components/pets/PetFormDialog';
import { SafetyNotice } from '@/components/common/SafetyNotice';
import { PageHeading } from '@/components/layout/PageHeading';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAppData } from '@/context/appData';
import { useToast } from '@/context/toast';
import {
  petSubtitle,
  speciesLabel,
  vaccinationLabel,
  vaccinationTone,
} from '@/lib/utils';
import type { PetDraft } from '@/types';

/**
 * My Pets — the owner's own pets.
 *
 * Deletion is the interesting case: other modules hold references to a pet, so
 * the impact is computed and shown before the user confirms, then repaired
 * rather than left dangling.
 */
export function MyPetsPage() {
  const {
    pets,
    status,
    activePetId,
    setActivePet,
    addPet,
    updatePet,
    previewPetDeletion,
    deletePet,
  } = useAppData();
  const { showToast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const editPet = editId ? (pets.find((pet) => pet.id === editId) ?? null) : null;
  const deleteImpact = useMemo(
    () => (deleteId ? previewPetDeletion(deleteId) : null),
    [deleteId, previewPetDeletion],
  );

  const openAdd = useCallback(() => {
    setEditId(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((petId: string) => {
    setEditId(petId);
    setFormOpen(true);
  }, []);

  const handleSubmit = useCallback(
    (draft: PetDraft) => {
      if (editId) {
        const updated = updatePet(editId, draft);
        setFormOpen(false);
        setEditId(null);
        if (!updated) {
          showToast({
            tone: 'warning',
            title: 'Changes not saved',
            description: 'Check the highlighted fields and try again.',
          });
          return;
        }
        showToast({
          tone: 'success',
          title: 'Pet updated',
          description: `${updated.name}'s details were saved on this device.`,
        });
        setAnnouncement(`Saved changes to ${updated.name}.`);
        return;
      }

      const created = addPet(draft);
      setFormOpen(false);
      if (!created) {
        showToast({
          tone: 'info',
          title: 'Pet not added',
          description:
            'A pet with that name and breed already exists, or a field needs fixing.',
        });
        setAnnouncement('Pet not added. It may already exist.');
        return;
      }
      showToast({
        tone: 'success',
        title: 'Pet added',
        description: `${created.name} is on your profile. Discoverability stays off until you turn it on.`,
      });
      setAnnouncement(
        `Added ${created.name}. Discoverability is off until you turn it on.`,
      );
    },
    [editId, addPet, updatePet, showToast],
  );

  const handleSetActive = useCallback(
    (petId: string) => {
      const pet = pets.find((item) => item.id === petId);
      setActivePet(petId);
      setAnnouncement(`${pet?.name ?? 'Pet'} is now your active pet.`);
    },
    [pets, setActivePet],
  );

  const handleConfirmDelete = useCallback(() => {
    if (!deleteId) return;
    const impact = deletePet(deleteId);
    setDeleteId(null);
    if (!impact) {
      showToast({
        tone: 'warning',
        title: 'Nothing to remove',
        description: 'That pet is no longer on your profile.',
      });
      return;
    }

    const cleanup: string[] = [];
    if (impact.pendingInterests > 0) {
      cleanup.push(
        `${impact.pendingInterests} pending ${impact.pendingInterests === 1 ? 'interest' : 'interests'} withdrawn`,
      );
    }
    if (impact.activeBookings > 0) {
      cleanup.push(
        `${impact.activeBookings} booking ${impact.activeBookings === 1 ? 'request' : 'requests'} withdrawn`,
      );
    }
    if (impact.detachedRecords > 0) {
      cleanup.push(
        `${impact.detachedRecords} past ${impact.detachedRecords === 1 ? 'record' : 'records'} kept without the pet link`,
      );
    }

    const summary =
      cleanup.length > 0
        ? `Cleanup: ${cleanup.join(', ')}.`
        : 'Nothing else referenced this pet.';

    showToast({
      tone: 'info',
      title: `${impact.petName} removed`,
      description: summary,
    });
    setAnnouncement(`Removed ${impact.petName}. ${summary}`);
  }, [deleteId, deletePet, showToast]);

  return (
    <div>
      <PageHeading
        eyebrow="You"
        title="My Pets"
        description="The pets on your profile. Each one stays hidden from Discover until you opt it in."
        action={
          <Button size="sm" icon={Plus} onClick={openAdd}>
            Add a pet
          </Button>
        }
      />

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {status === 'loading' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 2 }, (_, index) => (
            <Skeleton key={index} className="h-[220px] rounded-2xl" />
          ))}
        </div>
      ) : pets.length === 0 ? (
        <EmptyState
          icon={PawPrint}
          title="No pets on your profile yet"
          description="Add a pet to post about them, appear in Discover, or send an adoption or booking request."
          actionLabel="Add a pet"
          onAction={openAdd}
        />
      ) : (
        <>
          {/* Active pet is what other screens default to; never left dangling. */}
          {activePetId === null ? (
            <div className="mb-4 rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-charcoal-600">
              No active pet is selected. Choose one below so other screens know
              which pet to use by default.
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {pets.map((pet) => {
              const active = pet.id === activePetId;
              return (
                <Card key={pet.id} className={active ? 'border-clay-300' : undefined}>
                  <article aria-label={`${pet.name}, ${pet.breed}`}>
                    <div className="flex items-start gap-3">
                      <Avatar name={pet.name} size="xl" shape="rounded" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start gap-2">
                          <h2 className="min-w-0 flex-1 break-words text-base font-semibold tracking-tight text-charcoal-900">
                            {pet.name}
                          </h2>
                          <Badge>{speciesLabel(pet.species)}</Badge>
                          {active ? <Badge tone="accent">Active</Badge> : null}
                        </div>
                        <p className="mt-0.5 break-words text-sm text-charcoal-500">
                          {petSubtitle(pet)}
                        </p>
                        <p className="mt-1 break-words text-xs text-charcoal-400">
                          {pet.city} — city only
                        </p>
                        {pet.bio ? (
                          <p className="mt-2 line-clamp-2 break-words text-sm leading-relaxed text-charcoal-600">
                            {pet.bio}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-cream-200 pt-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${vaccinationTone(pet.vaccination)}`}
                      >
                        {vaccinationLabel(pet.vaccination)}
                      </span>
                      <Badge tone={pet.neutered ? 'positive' : 'neutral'}>
                        {pet.neutered ? 'Neutered' : 'Not neutered'}
                      </Badge>
                      <Badge tone={pet.openToMating ? 'accent' : 'neutral'}>
                        {pet.openToMating
                          ? 'Shown in Discover'
                          : 'Hidden from Discover'}
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Pencil}
                        onClick={() => openEdit(pet.id)}
                        block
                        className="sm:w-auto"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={active ? Check : Star}
                        onClick={() => handleSetActive(pet.id)}
                        disabled={active}
                        aria-pressed={active}
                        block
                        className="sm:w-auto"
                      >
                        {active ? 'Active pet' : 'Set active'}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => setDeleteId(pet.id)}
                        block
                        className="sm:w-auto"
                      >
                        Remove
                      </Button>
                    </div>
                  </article>
                </Card>
              );
            })}
          </div>
        </>
      )}

      <SafetyNotice title="Owner-provided details, city level only" className="mt-4">
        Vaccination, neutering and behaviour details are your own description
        and are shown to others as unverified. Atronz stores no address, no
        coordinates and no contact details for you or your pets, and makes no
        health claim about any of them.
      </SafetyNotice>

      <PetFormDialog
        open={formOpen}
        pet={editPet}
        onClose={() => {
          setFormOpen(false);
          setEditId(null);
        }}
        onSubmit={handleSubmit}
      />

      {/* The impact is spelled out before the user confirms, not after. */}
      <ConfirmDialog
        open={deleteImpact !== null}
        title={`Remove ${deleteImpact?.petName ?? 'this pet'}?`}
        description={
          deleteImpact
            ? [
                `${deleteImpact.petName} will be removed from your profile.`,
                deleteImpact.pendingInterests > 0
                  ? `${deleteImpact.pendingInterests} pending ${deleteImpact.pendingInterests === 1 ? 'interest' : 'interests'} sent on their behalf will be withdrawn.`
                  : '',
                deleteImpact.activeBookings > 0
                  ? `${deleteImpact.activeBookings} active booking ${deleteImpact.activeBookings === 1 ? 'request' : 'requests'} for them will be withdrawn.`
                  : '',
                deleteImpact.detachedRecords > 0
                  ? `${deleteImpact.detachedRecords} past ${deleteImpact.detachedRecords === 1 ? 'record' : 'records'} will be kept as history, without the pet link.`
                  : '',
                'Nothing else is deleted, and this cannot be undone in this session.',
              ]
                .filter(Boolean)
                .join(' ')
            : ''
        }
        confirmLabel="Remove pet"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
