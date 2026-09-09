import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  POST_BODY_LIMIT,
  POST_BODY_WARN_AT,
  VISIBILITY_OPTIONS,
  validateDraft,
} from '@/lib/feed';
import { cn } from '@/lib/utils';
import type { NewPostDraft, PetProfile, PostVisibility } from '@/types';

export interface CreatePostDialogProps {
  open: boolean;
  pets: PetProfile[];
  onClose: () => void;
  onPublish: (draft: NewPostDraft) => void;
}

const EMPTY_DRAFT: NewPostDraft = {
  body: '',
  petId: '',
  imageUrl: '',
  // The narrower option is the default.
  visibility: 'followers',
};

/**
 * The composer.
 *
 * Bottom sheet on mobile, dialog on desktop — both from the shared Modal.
 * Validation runs on submit, and the context validates the draft again before
 * it creates a post.
 */
export function CreatePostDialog({
  open,
  pets,
  onClose,
  onPublish,
}: CreatePostDialogProps) {
  const [draft, setDraft] = useState<NewPostDraft>(EMPTY_DRAFT);
  const [submitted, setSubmitted] = useState(false);

  // Fresh draft each time it opens, defaulted to the owner's first pet.
  useEffect(() => {
    if (!open) return;
    setDraft({ ...EMPTY_DRAFT, petId: pets[0]?.id ?? '' });
    setSubmitted(false);
  }, [open, pets]);

  const validation = validateDraft(draft);
  const showErrors = submitted && !validation.valid;
  const remaining = POST_BODY_LIMIT - draft.body.length;
  const overLimit = remaining < 0;

  const patch = (next: Partial<NewPostDraft>) =>
    setDraft((current) => ({ ...current, ...next }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (!validation.valid) return;
    onPublish(draft);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create a post"
      description="Share a moment with the Atronz community."
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} block className="sm:w-auto">
            Cancel
          </Button>
          <Button
            icon={Send}
            onClick={handleSubmit}
            block
            className="sm:w-auto"
            disabled={overLimit}
          >
            Publish
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label
            htmlFor="post-body"
            className="block text-sm font-medium text-charcoal-800"
          >
            What is happening?
          </label>
          <textarea
            id="post-body"
            value={draft.body}
            onChange={(event) => patch({ body: event.target.value })}
            rows={4}
            aria-invalid={showErrors && validation.errors.body ? true : undefined}
            aria-describedby="post-body-count post-body-error"
            placeholder="A walk, a milestone, a small disaster — anything about your pet."
            className="mt-1.5 w-full resize-none rounded-2xl border border-cream-300 bg-white px-3 py-2.5 text-sm leading-relaxed text-charcoal-800 transition placeholder:text-charcoal-400 hover:border-clay-200"
          />
          <div className="mt-1.5 flex items-start justify-between gap-3">
            <p
              id="post-body-error"
              role={showErrors && validation.errors.body ? 'alert' : undefined}
              className={cn(
                'text-xs',
                showErrors && validation.errors.body
                  ? 'text-red-700'
                  : 'text-charcoal-400',
              )}
            >
              {showErrors && validation.errors.body
                ? validation.errors.body
                : 'Text or an image is required.'}
            </p>
            <p
              id="post-body-count"
              className={cn(
                'shrink-0 text-xs tabular-nums',
                overLimit
                  ? 'font-semibold text-red-700'
                  : draft.body.length >= POST_BODY_WARN_AT
                    ? 'text-amber-700'
                    : 'text-charcoal-400',
              )}
            >
              {draft.body.length}/{POST_BODY_LIMIT}
            </p>
          </div>
        </div>

        <div>
          <label
            htmlFor="post-pet"
            className="block text-sm font-medium text-charcoal-800"
          >
            Which pet is this about?
          </label>
          {pets.length === 0 ? (
            <p className="mt-1.5 rounded-2xl border border-dashed border-cream-300 bg-cream-50 px-3 py-2.5 text-sm text-charcoal-500">
              Add a pet to your profile before posting.
            </p>
          ) : (
            <select
              id="post-pet"
              value={draft.petId}
              onChange={(event) => patch({ petId: event.target.value })}
              aria-invalid={showErrors && validation.errors.pet ? true : undefined}
              aria-describedby={
                showErrors && validation.errors.pet ? 'post-pet-error' : undefined
              }
              className="mt-1.5 h-11 w-full rounded-2xl border border-cream-300 bg-white px-3 text-sm text-charcoal-800 transition hover:border-clay-200"
            >
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} · {pet.breed}
                </option>
              ))}
            </select>
          )}
          {showErrors && validation.errors.pet ? (
            <p id="post-pet-error" role="alert" className="mt-1.5 text-xs text-red-700">
              {validation.errors.pet}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="post-image"
            className="block text-sm font-medium text-charcoal-800"
          >
            Image link <span className="font-normal text-charcoal-400">(optional)</span>
          </label>
          <input
            id="post-image"
            type="url"
            inputMode="url"
            value={draft.imageUrl}
            onChange={(event) => patch({ imageUrl: event.target.value })}
            aria-describedby="post-image-hint"
            placeholder="https://example.com/photo.jpg"
            className="mt-1.5 h-11 w-full rounded-2xl border border-cream-300 bg-white px-3 text-sm text-charcoal-800 transition placeholder:text-charcoal-400 hover:border-clay-200"
          />
          <p id="post-image-hint" className="mt-1.5 text-xs text-charcoal-400">
            Uploads are not available yet. Leave this blank and the post shows a
            placeholder tile instead — a link that fails to load falls back to
            the same tile.
          </p>
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-charcoal-800">
            Who can see this?
          </legend>
          <div className="mt-1.5 space-y-2">
            {VISIBILITY_OPTIONS.map((option) => (
              <VisibilityChoice
                key={option.id}
                option={option}
                checked={draft.visibility === option.id}
                onSelect={() => patch({ visibility: option.id })}
              />
            ))}
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}

function VisibilityChoice({
  option,
  checked,
  onSelect,
}: {
  option: { id: PostVisibility; label: string; description: string };
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-2.5 rounded-2xl border p-3 transition',
        checked
          ? 'border-clay-300 bg-clay-50'
          : 'border-cream-300 bg-white hover:border-clay-200',
      )}
    >
      <input
        type="radio"
        name="post-visibility"
        value={option.id}
        checked={checked}
        onChange={onSelect}
        className="mt-0.5 h-4 w-4 shrink-0 accent-clay-700"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-charcoal-800">
          {option.label}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-charcoal-500">
          {option.description}
        </span>
      </span>
    </label>
  );
}
