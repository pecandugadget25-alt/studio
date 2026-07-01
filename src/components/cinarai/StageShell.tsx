import { ReactNode } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StageShellProps {
  title: string;
  subtitle: string;
  badge?: string;
  code?: string;
  tone?: string;
  current?: boolean;
  completed?: boolean;
  icon?: ReactNode;
  accentClassName?: string;
  buttonClassName?: string;
  progressClassName?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const syntaxSteps = ['C', 'I', 'N', 'A', 'R', 'A', 'I'];

export function StageShell({
  title,
  subtitle,
  badge,
  code,
  tone = 'bg-blue-600',
  current = false,
  completed = false,
  icon,
  accentClassName,
  buttonClassName,
  progressClassName,
  children,
  footer,
}: StageShellProps) {
  return (
    <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition-all duration-300">
      <div className={cn('border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50 p-4 sm:p-5', accentClassName)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {code ? (
              <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-sm', tone)}>
                {icon ?? code}
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

        <div className={cn('mt-4 flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2', progressClassName)}>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            <span>Progress</span>
          </div>
          <div className="flex items-center gap-2">
            {syntaxSteps.map((step) => {
              const isCurrent = step === code;
              const isComplete = completed || step === 'C';
              return (
                <div key={step} className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300', isCurrent ? cn(tone, 'text-white shadow-sm') : isComplete ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400')}>
                  {isComplete && step !== code ? <CheckCircle2 className="h-4 w-4" /> : step}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">{children}</div>
      {footer ? <div className="border-t border-slate-100 bg-slate-50/70 p-4 sm:p-5">{footer}</div> : null}
    </Card>
  );
}
