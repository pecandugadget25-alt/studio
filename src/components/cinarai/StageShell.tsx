import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StageShellProps {
  title: string;
  subtitle: string;
  badge?: string;
  children: ReactNode;
}

export function StageShell({ title, subtitle, badge, children }: StageShellProps) {
  return (
    <Card className="rounded-[2rem] border-none bg-white p-4 shadow-lg shadow-orange-100/70 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        {badge ? <Badge className="rounded-full bg-orange-100 text-orange-700">{badge}</Badge> : null}
      </div>
      {children}
    </Card>
  );
}
