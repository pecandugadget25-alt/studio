import { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
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
    <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {code ? (
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm ${tone}`}>
                {code}
              </div>
            ) : null}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 sm:text-lg">{title}</h3>
                <Sparkles className="h-4 w-4 shrink-0 text-slate-400" />
              </div>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{subtitle}</p>
            </div>
          </div>
          {badge ? (
            <Badge className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">
              {badge}
            </Badge>
          ) : null}
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </Card>
  );
}
