import { useNavigate } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Card className="mx-auto max-w-lg text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-clay-50 text-clay-700">
        <Compass className="h-6 w-6" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-lg font-semibold tracking-tight text-charcoal-900">
        This page does not exist
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-charcoal-500">
        The link may be old, or the section may not be built yet.
      </p>
      <Button icon={Home} onClick={() => navigate('/feed')} className="mt-5">
        Back to Home
      </Button>
    </Card>
  );
}
