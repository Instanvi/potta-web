'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle, CircleNotch, Info, WarningCircle } from '@phosphor-icons/react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@potta/components/shadcn/dialog';
import { Button } from '@potta/components/shadcn/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@potta/components/shadcn/select';
import { useAuthContextStore } from '@/store/use-auth-context-store';
import { PAY_EXPORT_MAX_POLL_MS, useExportToPay, usePayExportStatuses } from '../_hooks/usePayExport';
import { isFailedItem, isTerminalStatus, type PayExportResult } from '../_utils/payExportApi';
import type { Product } from '../_utils/types';

const ENDPOINT_LABELS: Record<string, string> = {
  'sync/categories/upsert-batch': 'Categories',
  'sync/products/upsert-batch': 'Products',
  'sync/desktop/bundle/upsert-batch': 'Bundles',
  'sync/desktop/bundle_component/upsert-batch': 'Bundle components',
};

function apiError(error: unknown): string {
  const message = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  if (Array.isArray(message)) return message.join(', ');
  if (typeof message === 'string' && message) return message;
  return (error as Error)?.message || 'Import to Pay failed';
}

function useLocationOptions() {
  const hierarchy = useAuthContextStore((s) => s.hierarchy);
  const assignments = useAuthContextStore((s) => s.organizationAssignments);
  return useMemo(() => {
    const byId = new Map<string, { id: string; name: string }>();
    if (hierarchy?.location?.id) byId.set(hierarchy.location.id, { id: hierarchy.location.id, name: hierarchy.location.name });
    for (const a of assignments) {
      if (a.isActive !== false && a.location?.id && !byId.has(a.location.id)) {
        byId.set(a.location.id, { id: a.location.id, name: a.location.name });
      }
    }
    return [...byId.values()];
  }, [hierarchy, assignments]);
}

function StateIcon({ status, timedOut }: { status?: string; timedOut: boolean }) {
  if (status === 'completed') return <CheckCircle size={16} weight="fill" className="text-green-700" />;
  if (status && isTerminalStatus(status)) return <WarningCircle size={16} weight="fill" className="text-red-600" />;
  if (timedOut) return <Info size={16} className="text-amber-600" />;
  return <CircleNotch size={16} className="animate-spin text-gray-500" />;
}

export default function ImportToPayModal({
  open,
  setOpen,
  selectedProducts,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedProducts: Product[];
}) {
  const currentLocationId = useAuthContextStore((s) => s.locationId);
  const locations = useLocationOptions();
  const [targetLocationId, setTargetLocationId] = useState<string>('');
  const [result, setResult] = useState<PayExportResult | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const announced = useRef(false);
  const exportMutation = useExportToPay();

  useEffect(() => {
    if (open) {
      setTargetLocationId(currentLocationId ?? locations[0]?.id ?? '');
      setResult(null);
      setStartedAt(null);
      setTimedOut(false);
      announced.current = false;
      exportMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (startedAt === null) return;
    const t = setTimeout(() => setTimedOut(true), PAY_EXPORT_MAX_POLL_MS);
    return () => clearTimeout(t);
  }, [startedAt]);

  const requests = result?.requests ?? [];
  const statuses = usePayExportStatuses(requests, result?.payLocationId || targetLocationId || undefined, startedAt);
  const settled = requests.length > 0 && statuses.every((s) => isTerminalStatus(s.data?.status) || s.isError);
  const failedItems = statuses.flatMap((s, i) =>
    (s.data?.results ?? []).filter(isFailedItem).map((item) => ({ ...item, endpoint: requests[i]?.endpoint })),
  );
  const anyFailed = statuses.some((s) => s.isError || s.data?.status === 'failed') || failedItems.length > 0;

  useEffect(() => {
    if (!settled || announced.current) return;
    announced.current = true;
    if (anyFailed) toast.error('Import to Pay finished with errors. See the details.');
    else toast.success('Products imported to Pay');
  }, [settled, anyFailed]);

  const scopeIds = selectedProducts.map((p) => p.uuid).filter(Boolean);
  const targetName = locations.find((l) => l.id === targetLocationId)?.name;

  const start = () => {
    exportMutation.mutate(
      { productIds: scopeIds.length ? scopeIds : undefined, targetLocationId: targetLocationId || undefined },
      {
        onSuccess: (data) => {
          setResult(data);
          if (data.requests.length) {
            setStartedAt(Date.now());
            toast.info(`Sent ${data.products} product${data.products === 1 ? '' : 's'} to Pay; tracking progress…`);
          } else {
            toast.success('Products imported to Pay');
          }
        },
        onError: (e) => toast.error(apiError(e)),
      },
    );
  };

  const busy = exportMutation.isPending || (startedAt !== null && !settled && !timedOut);

  return (
    <Dialog open={open} onOpenChange={(o) => (!exportMutation.isPending ? setOpen(o) : undefined)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-white sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Import to Pay</DialogTitle>
          <DialogDescription>
            Copy your Potta products, categories and bundles into the Instanvi Pay catalogue of a location.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            <div className="border border-black/10 bg-[var(--main-bg)] px-3 py-2.5 text-sm">
              {scopeIds.length ? (
                <>
                  <span className="font-medium">{scopeIds.length}</span> selected product{scopeIds.length === 1 ? '' : 's'}
                  {selectedProducts.length <= 3 ? (
                    <span className="text-gray-500"> ({selectedProducts.map((p) => p.name).join(', ')})</span>
                  ) : null}
                </>
              ) : (
                <>All enabled products (select rows in the table to import only some)</>
              )}
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-600">Target Pay location</span>
              {locations.length ? (
                <Select value={targetLocationId} onValueChange={setTargetLocationId}>
                  <SelectTrigger className="h-10 py-2">
                    <SelectValue placeholder="Choose a location" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {locations.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                        {l.id === currentLocationId ? ' (current)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-xs text-gray-500">No locations in this session; the current location will be used.</p>
              )}
            </label>

            <div className="flex gap-2 border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
              <Info size={16} className="mt-0.5 shrink-0" />
              <p>
                You also need the Pay permission <span className="font-mono font-medium">PaymentSync:upsert</span> on the
                target location. Re-running an unchanged import is safe; Pay skips items it already has.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Products', value: result.products },
                { label: 'Categories', value: result.categories },
                { label: 'Bundles', value: result.bundles },
              ].map((s) => (
                <div key={s.label} className="border border-black/10 bg-[var(--main-bg)] px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">{s.label}</p>
                  <p className="text-lg font-medium tabular-nums text-black">{s.value}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Sent to {locations.find((l) => l.id === result.payLocationId)?.name ?? targetName ?? 'the selected location'}.
            </p>

            {requests.length ? (
              <ul className="divide-y divide-black/[0.06] border border-black/10">
                {requests.map((r, i) => {
                  const s = statuses[i];
                  const status = s?.data?.status;
                  const results = s?.data?.results ?? [];
                  const failed = results.filter(isFailedItem).length;
                  return (
                    <li key={`${r.endpoint}-${r.idempotencyKey}`} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                      <StateIcon status={s?.isError ? 'failed' : status} timedOut={timedOut} />
                      <span className="flex-1">
                        {ENDPOINT_LABELS[r.endpoint] ?? r.endpoint}
                        <span className="ml-1.5 text-xs text-gray-500">
                          {r.count} item{r.count === 1 ? '' : 's'}
                        </span>
                      </span>
                      <span className="text-xs capitalize text-gray-600">
                        {s?.isError
                          ? 'status unavailable'
                          : status
                            ? `${status}${results.length ? ` · ${results.length - failed}/${results.length} ok` : ''}`
                            : 'waiting'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : null}

            {timedOut && !settled ? (
              <p className="text-xs text-amber-700">
                Pay is still processing. The import continues in the background; check the Pay catalogue later.
              </p>
            ) : null}

            {failedItems.length ? (
              <div className="border border-red-200">
                <p className="border-b border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800">
                  {failedItems.length} item{failedItems.length === 1 ? '' : 's'} failed
                </p>
                <ul className="max-h-48 divide-y divide-red-100 overflow-y-auto">
                  {failedItems.map((item, i) => (
                    <li key={`${item.external_id ?? item.id ?? i}-${i}`} className="px-3 py-2 text-xs">
                      <p className="font-mono text-gray-700">
                        {ENDPOINT_LABELS[item.endpoint ?? ''] ?? item.endpoint} · {item.external_id ?? item.id ?? '—'}
                      </p>
                      <p className="text-red-700">{item.error || item.status}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}

        <DialogFooter className="gap-2">
          {!result ? (
            <>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={exportMutation.isPending}>
                Cancel
              </Button>
              <Button className="bg-green-700 hover:bg-green-800" onClick={start} disabled={exportMutation.isPending}>
                {exportMutation.isPending ? 'Importing…' : 'Import to Pay'}
              </Button>
            </>
          ) : (
            <Button variant={busy ? 'outline' : 'default'} onClick={() => setOpen(false)}>
              {busy ? 'Close (keeps running)' : 'Done'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
