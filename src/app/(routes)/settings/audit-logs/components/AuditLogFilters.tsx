'use client';

import React from 'react';
import { X } from '@phosphor-icons/react';
import { Input } from '@potta/components/shadcn/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@potta/components/shadcn/select';
import { DateRangePicker } from '@potta/components/ui/date-picker';
import { AUDIT_ENTITY_TYPES } from '../utils/format';

export interface AuditFilterState {
  entityType: string;
  action: string;
  /** IdP user id (sent to the API) or an email (matched within the loaded page). */
  actor: string;
  from: string;
  to: string;
}

export const EMPTY_AUDIT_FILTERS: AuditFilterState = {
  entityType: '',
  action: '',
  actor: '',
  from: '',
  to: '',
};

const ALL = '__all__';

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {hint ? <span className="text-[11px] text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export default function AuditLogFilters({
  value,
  onChange,
}: {
  value: AuditFilterState;
  onChange: (next: AuditFilterState) => void;
}) {
  const set = (patch: Partial<AuditFilterState>) => onChange({ ...value, ...patch });
  const dirty = Object.values(value).some(Boolean);

  return (
    <div className="dashboard-panel grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:grid-cols-[180px_1fr_1fr_260px_auto] xl:items-start">
      <Field label="Record type">
        <Select value={value.entityType || ALL} onValueChange={(v) => set({ entityType: v === ALL ? '' : v })}>
          <SelectTrigger className="h-10 py-2">
            <SelectValue placeholder="All records" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value={ALL}>All records</SelectItem>
            {AUDIT_ENTITY_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Action contains">
        <Input
          className="h-10 py-2"
          placeholder="e.g. approve, bill.approved"
          value={value.action}
          onChange={(e) => set({ action: e.target.value })}
        />
      </Field>
      <Field
        label="Actor"
        hint={value.actor.includes('@') ? 'Emails are matched within the loaded page.' : undefined}
      >
        <Input
          className="h-10 py-2"
          placeholder="User ID or email"
          value={value.actor}
          onChange={(e) => set({ actor: e.target.value })}
        />
      </Field>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">Date range</span>
        <DateRangePicker
          placeholder="Any date"
          clearable
          value={{ from: value.from, to: value.to }}
          onChange={({ from, to }) => set({ from: from ?? '', to: to ?? '' })}
        />
      </div>
      <div className="flex items-end xl:h-full">
        <button
          type="button"
          disabled={!dirty}
          onClick={() => onChange(EMPTY_AUDIT_FILTERS)}
          className="flex h-10 items-center gap-1.5 rounded-[2px] border border-input bg-background px-3 text-sm text-foreground hover:bg-accent disabled:opacity-40 xl:mt-5"
        >
          <X size={14} />
          Reset
        </button>
      </div>
    </div>
  );
}
