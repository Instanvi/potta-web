'use client';

import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CaretUpDown, Check, MapPin } from '@phosphor-icons/react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';
import { useAuthContextStore } from '@/store/use-auth-context-store';
import { cn } from '@/lib/utils';

interface LocationOption {
  id: string;
  name: string;
}

/** Picks the location sent as `x-location-id`; potta-backend scopes every query and posting to it. */
export function LocationSwitcher({ className }: { className?: string }) {
  const queryClient = useQueryClient();
  const locationId = useAuthContextStore((s) => s.locationId);
  const hierarchy = useAuthContextStore((s) => s.hierarchy);
  const assignments = useAuthContextStore((s) => s.organizationAssignments);
  const setLocationId = useAuthContextStore((s) => s.setLocationId);

  const locations = useMemo<LocationOption[]>(() => {
    const byId = new Map<string, LocationOption>();
    if (hierarchy?.location?.id) {
      byId.set(hierarchy.location.id, { id: hierarchy.location.id, name: hierarchy.location.name });
    }
    for (const a of assignments) {
      if (a.isActive !== false && a.location?.id && !byId.has(a.location.id)) {
        byId.set(a.location.id, { id: a.location.id, name: a.location.name });
      }
    }
    return [...byId.values()];
  }, [hierarchy, assignments]);

  const active = locations.find((l) => l.id === locationId);

  const select = (loc: LocationOption) => {
    if (loc.id === locationId) return;
    setLocationId(loc.id);
    void queryClient.invalidateQueries();
    toast.success(`Switched to ${loc.name}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-10 max-w-[220px] items-center justify-between gap-2 rounded border border-black/[0.08] bg-white px-2.5 text-left hover:bg-gray-50',
            className,
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <MapPin weight="bold" className="size-3.5 shrink-0 text-green-700" />
            <span className="flex min-w-0 flex-col leading-none">
              <span className="truncate text-xs font-medium">{active?.name ?? 'All locations'}</span>
              <span className="text-[10px] text-gray-500">Location context</span>
            </span>
          </span>
          <CaretUpDown className="size-3.5 shrink-0 text-gray-500" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-white" align="end">
        <DropdownMenuLabel className="text-xs text-gray-500">Switch location</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {locations.length === 0 ? (
          <div className="px-2 py-3 text-xs text-gray-500">No locations available for this session.</div>
        ) : (
          locations.map((loc) => (
            <DropdownMenuItem
              key={loc.id}
              onClick={() => select(loc)}
              className="flex cursor-pointer items-center justify-between gap-2 text-xs"
            >
              <span className="truncate">{loc.name}</span>
              {loc.id === locationId ? <Check className="size-3.5 shrink-0 text-green-700" weight="bold" /> : null}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
