import * as React from 'react';
import type { ReactNode } from 'react';
import { AlertCircle, Archive, Check, CheckCircle2, Clock3, Info, type LucideIcon } from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

export type PlazzaTone = 'good' | 'warn' | 'bad' | 'info' | 'neutral';
export type PlazzaButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type PlazzaButtonSize = 'default' | 'sm' | 'icon';

const toneClasses: Record<PlazzaTone, string> = {
  good: 'border-[hsl(var(--accent)/.5)] bg-[hsl(var(--accent)/.5)] text-[hsl(var(--accent-foreground))]',
  warn: 'border-[hsl(var(--chart-4)/.45)] bg-[hsl(var(--chart-4)/.35)] text-[hsl(var(--secondary))]',
  bad: 'border-[hsl(var(--destructive)/.5)] bg-[hsl(var(--destructive)/.8)] text-white',
  info: 'border-[hsl(var(--chart-3)/.2)] bg-[hsl(var(--chart-3)/.12)] text-[hsl(var(--chart-3))]',
  neutral: 'border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]',
};

const boundaryClasses: Record<'neutral' | 'warn' | 'success', string> = {
  neutral: 'border-[hsl(var(--border))] bg-[hsl(var(--muted)/.35)]',
  warn: 'border-[hsl(var(--chart-4)/.45)] bg-[hsl(var(--chart-4)/.08)]',
  success: 'border-[hsl(var(--accent)/.5)] bg-[hsl(var(--accent)/.1)]',
};

export function plazzaButtonClass({ variant = 'primary', size = 'default', className }: { variant?: PlazzaButtonVariant; size?: PlazzaButtonSize; className?: string } = {}) {
  return cn('plazza-button focus-ring', `plazza-button--${variant}`, size !== 'default' && `plazza-button--${size}`, className);
}

export const PlazzaButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: PlazzaButtonVariant; size?: PlazzaButtonSize }>(
  ({ className, variant, size, type = 'button', ...props }, ref) => <button ref={ref} type={type} className={plazzaButtonClass({ variant, size, className })} {...props} />,
);
PlazzaButton.displayName = 'PlazzaButton';

export function Boundary({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'warn' | 'success' }) {
  return <div className={cn('flex items-start gap-2 border px-3 py-2 text-[11px] leading-5', boundaryClasses[tone])}>
    <Info size={14} className="mt-0.5 shrink-0 text-[hsl(var(--primary))]" aria-hidden="true" />
    <span>{children}</span>
  </div>;
}

export function StatusBadge({ label, tone = 'neutral', icon: Icon = Info }: { label: string; tone?: PlazzaTone; icon?: LucideIcon }) {
  return <span className={cn('inline-flex items-center gap-1.5 border px-2 py-1 text-[10px] font-bold uppercase tracking-wider', toneClasses[tone])}>
    <Icon size={12} aria-hidden="true" />
    <span>{label}</span>
  </span>;
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-7 flex flex-col gap-4 border-b hairline pb-6 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      <p className="eyebrow mb-2">{eyebrow}</p>
      <h1 className="display text-4xl font-semibold uppercase leading-[.95] sm:text-6xl">{title}</h1>
      {description && <p className="mt-3 max-w-2xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{description}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>;
}

export function Metric({ label, value, note, tone = 'info' }: { label: string; value: string; note: string; tone?: Extract<PlazzaTone, 'good' | 'warn' | 'info'> }) {
  const Icon = tone === 'good' ? Check : tone === 'warn' ? AlertCircle : Info;
  return <div className="ops-metric border hairline bg-[hsl(var(--card))] p-5">
    <div className="flex items-center justify-between gap-3">
      <p className="eyebrow">{label}</p>
      <StatusBadge label={tone === 'good' ? 'OK' : tone === 'warn' ? 'ATTN' : 'INFO'} tone={tone} icon={Icon} />
    </div>
    <p className="mono mt-5 text-2xl font-bold numeric-value">{value}</p>
    <p className="mt-2 text-[11px] text-[hsl(var(--muted-foreground))]">{note}</p>
  </div>;
}

type InputFieldProps = {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  error?: string | boolean;
  disabled?: boolean;
  id?: string;
  testId?: string;
};

function fieldId(label: string, prefix: string) {
  return `${prefix}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'value'}`;
}

export function InputField({ label, value, onChange, placeholder, type = 'text', autoComplete, required = false, error, disabled = false, id, testId }: InputFieldProps) {
  const inputId = id ?? fieldId(label, 'field');
  const errorText = typeof error === 'string' ? error : error ? 'Champ à vérifier / تحقق من الحقل' : '';
  const controlled = value !== undefined && onChange !== undefined;
  return <label className="block">
    <span className="mb-2 flex items-center gap-1 text-xs font-bold">{label}{required && <span className="text-[hsl(var(--primary))]">*</span>}</span>
    <input id={inputId} type={type} autoComplete={autoComplete ?? (type === 'password' ? 'current-password' : undefined)} required={required} {...(controlled ? { value, onChange: (event) => onChange(event.target.value) } : {})} placeholder={placeholder} disabled={disabled} aria-invalid={Boolean(error)} aria-describedby={errorText ? `${inputId}-error` : undefined} data-testid={testId ?? `input-${inputId}`} className={cn('plazza-field focus-ring w-full', error ? 'border-[hsl(var(--destructive))]' : '')} />
    {errorText && <span id={`${inputId}-error`} className="mt-1 block text-[11px] text-[hsl(var(--destructive))]" role="alert">{errorText}</span>}
  </label>;
}

export function SelectField({ label, value, onChange, options, disabled = false, error, id }: { label: string; value: string; onChange: (value: string) => void; options: Array<[string, string]>; disabled?: boolean; error?: string | boolean; id?: string }) {
  const selectId = id ?? fieldId(label, 'select');
  const errorText = typeof error === 'string' ? error : error ? 'Champ à vérifier / تحقق من الحقل' : '';
  return <label className="block">
    <span className="mb-2 block text-xs font-bold">{label}</span>
    <select id={selectId} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} aria-invalid={Boolean(error)} aria-describedby={errorText ? `${selectId}-error` : undefined} className={cn('plazza-field focus-ring w-full', error ? 'border-[hsl(var(--destructive))]' : '')}>
      {options.map(([option, text]) => <option value={option} key={option}>{text}</option>)}
    </select>
    {errorText && <span id={`${selectId}-error`} className="mt-1 block text-[11px] text-[hsl(var(--destructive))]" role="alert">{errorText}</span>}
  </label>;
}

export function OpsTable({ rows, columns = ['Référence', 'Statut', 'Dernière mise à jour'], empty = false }: { rows: Array<Array<string>>; columns?: string[]; empty?: boolean }) {
  if (empty) return <div className="border hairline p-10 text-center">
    <Archive className="mx-auto text-[hsl(var(--primary))]" size={24} aria-hidden="true" />
    <p className="mt-4 font-bold">Aucune donnée autoritaire / لا توجد بيانات معتمدة</p>
    <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">Le service local n’a pas de résultat à afficher / لا توجد نتيجة محلية لعرضها.</p>
  </div>;
  const isolate = (value: string) => /\d/.test(value) ? 'numeric-value' : undefined;
  return <div className="overflow-x-auto border hairline bg-[hsl(var(--card))]">
    <table className="w-full min-w-[640px] text-start text-xs">
      <thead className="bg-[hsl(var(--muted)/.55)]"><tr>{columns.map((column) => <th key={column} className="px-4 py-3 text-start text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, rowIndex) => <tr key={`${row[0]}-${rowIndex}`} className="border-t hairline"><td className="px-4 py-4 font-bold"><bdi className={isolate(row[0])}>{row[0]}</bdi></td>{row.slice(1).map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`} className="px-4 py-4 text-[hsl(var(--muted-foreground))]"><bdi className={isolate(cell)}>{cell}</bdi></td>)}</tr>)}</tbody>
    </table>
  </div>;
}

export function EmptyState({ title, text, action, onAction, link, icon: Icon = Archive }: { title: string; text: string; action: string; onAction?: () => void; link?: string; icon?: LucideIcon }) {
  const content = <span className="flex items-center gap-2">{action}<span aria-hidden="true">→</span></span>;
  return <div className="border hairline bg-[hsl(var(--muted)/.3)] px-6 py-16 text-center">
    <div className="mx-auto grid h-12 w-12 place-items-center border hairline text-[hsl(var(--primary))]"><Icon size={20} aria-hidden="true" /></div>
    <h2 className="display mt-5 text-3xl uppercase">{title}</h2>
    <p className="mx-auto mt-2 max-w-md text-sm text-[hsl(var(--muted-foreground))]">{text}</p>
    {link ? <Link href={link} className={plazzaButtonClass({ variant: 'secondary', className: 'mx-auto mt-6' })} data-testid="link-empty-action">{content}</Link> : <PlazzaButton variant="secondary" onClick={onAction} className="mx-auto mt-6" data-testid="button-empty-action">{content}</PlazzaButton>}
  </div>;
}

export function StatePanel({ title, text, tone = 'neutral', action }: { title: string; text: string; tone?: 'neutral' | 'warn' | 'success'; action?: ReactNode }) {
  const Icon = tone === 'warn' ? AlertCircle : tone === 'success' ? CheckCircle2 : Clock3;
  return <div className={cn('flex flex-col gap-3 border px-4 py-3 text-xs sm:flex-row sm:items-center', boundaryClasses[tone])} role="status">
    <Icon size={16} className="shrink-0 text-[hsl(var(--primary))]" aria-hidden="true" />
    <span className="font-bold">{title}</span>
    <span className="text-[hsl(var(--muted-foreground))]">{text}</span>
    {action && <span className="sm:ms-auto">{action}</span>}
  </div>;
}