import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, PawPrint, ShieldCheck, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAppData } from '@/context/appData';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { cn, formatCount } from '@/lib/utils';

/** Avatar button in the top header plus the account panel it opens. */
export function ProfileButton({ className }: { className?: string }) {
  const { owner, pets, status } = useAppData();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setNotice(null);
  }, []);
  useOnClickOutside(containerRef, close, open);

  if (status === 'loading' || !owner) {
    return <Skeleton className={cn('h-10 w-10 rounded-full', className)} />;
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Account menu"
        className="rounded-full ring-1 ring-cream-300 transition hover:ring-clay-200"
      >
        <Avatar name={owner.name} size="md" />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Account"
          className="absolute right-0 z-40 mt-2 w-[min(17rem,calc(100vw-2rem))] animate-fade-in overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-pop"
        >
          <div className="flex items-center gap-3 border-b border-cream-200 px-4 py-3.5">
            <Avatar name={owner.name} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-charcoal-800">
                {owner.name}
              </p>
              <p className="truncate text-xs text-charcoal-500">
                {owner.handle}
              </p>
              <p className="mt-1 inline-flex rounded-full bg-clay-50 px-2 py-0.5 text-[11px] font-medium text-clay-700">
                {owner.city}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-b border-cream-200 px-4 py-3 text-center">
            <Stat label="Pets" value={String(pets.length)} />
            <Stat label="Followers" value={formatCount(owner.followers)} />
            <Stat label="Following" value={formatCount(owner.following)} />
          </div>

          <div className="p-1.5">
            <MenuItem
              icon={UserRound}
              label="View profile"
              onClick={() => {
                close();
                navigate('/profile');
              }}
            />
            <MenuItem
              icon={PawPrint}
              label="Manage pets"
              onClick={() => {
                close();
                navigate('/pets');
              }}
            />
            <MenuItem
              icon={ShieldCheck}
              label="Privacy controls"
              onClick={() =>
                setNotice('Privacy controls open with the profile module.')
              }
            />
            <MenuItem
              icon={LogOut}
              label="Sign out"
              onClick={() =>
                setNotice('Accounts are not connected in this preview.')
              }
            />
          </div>

          {notice ? (
            <p className="border-t border-cream-200 bg-cream-50 px-4 py-2.5 text-xs text-charcoal-500">
              {notice}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-cream-50 py-2">
      <p className="text-base font-semibold text-charcoal-800">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-charcoal-400">
        {label}
      </p>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm text-charcoal-700 transition hover:bg-cream-100"
    >
      <Icon className="h-4 w-4 text-charcoal-400" aria-hidden="true" />
      {label}
    </button>
  );
}
