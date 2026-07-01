import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StageShellProps {
  title: string;
  subtitle: string;
  badge?: string;
  code?: string;
  tone?: string;
  children: ReactNode;
}

export function StageShell({ title, subtitle, badge, code, tone = 'bg-blue-600', children }: StageShellProps) {
  return (
    <Card className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {code ? (
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-base font-bold text-white ${tone}`}>
              {code}
            </div>
          ) : null}
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-sm leading-relaxed text-slate-500">{subtitle}</p>
          </div>
        </div>
        {badge ? <Badge className="shrink-0 rounded-md bg-slate-100 text-slate-700">{badge}</Badge> : null}
      </div>
      {children}
    </Card>
  );
}
