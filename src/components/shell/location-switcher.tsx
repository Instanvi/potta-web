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
import {
  locationLabel,
  useOrganizationLocations,
} from '@/hooks/use-organization-locations';
import { Skeleton } from '@/components/ui/loaders';
import { cn } from '@/lib/utils';

interface LocationOption {
  id: string;
  name: string;
}

type LocNameSource = {
  id: string;
  name?: string | null;
  location_name?: string | null;
};

function isPlaceholderName(name: string | null | undefined) {
  const n = (name ?? '').trim().toLowerCase();
  return !n || n === 'location' || n === 'unnamed location';
}

function optionFromSource(loc: LocNameSource): LocationOption {
  return { id: loc.id, name: locationLabel(loc) };
}

/** Picks the location sent as `x-location-id`; potta-backend scopes every query and posting to it. */
export function LocationSwitcher({ className }: { className?: string }) {
  const queryClient = useQueryClient();
  const locationId = useAuthContextStore((s) => s.locationId);
  const hierarchy = useAuthContextStore((s) => s.hierarchy);
  const assignments = useAuthContextStore((s) => s.organizationAssignments);
  const setLocationId = useAuthContextStore((s) => s.setLocationId);

  const { data: authLocations, isLoading: loadingAll } = useOrganizationLocations();

  const assignmentLocations = useMemo<LocationOption[]>(() => {
    const byId = new Map<string, LocationOption>();
    if (hierarchy?.location?.id) {
      byId.set(hierarchy.location.id, optionFromSource(hierarchy.location));
    }
    for (const a of assignments) {
      if (a.isActive !== false && a.location?.id && !byId.has(a.location.id)) {
        byId.set(a.location.id, optionFromSource(a.location));
      }
    }
    return [...byId.values()];
  }, [hierarchy, assignments]);

  const assignmentNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const loc of assignmentLocations) {
      if (!isPlaceholderName(loc.name)) map.set(loc.id, loc.name);
    }
    return map;
  }, [assignmentLocations]);

  /** Prefer Auth full org list when permitted; otherwise session assignments only. */
  const locations = useMemo<LocationOption[]>(() => {
    if (authLocations && authLocations.length > 0) {
      return authLocations.map((l) => {
        const fromAuth = locationLabel(l);
        const fromSession = assignmentNameById.get(l.id);
        const name = !isPlaceholderName(fromAuth)
          ? fromAuth
          : fromSession || fromAuth;
        return { id: l.id, name };
      });
    }
    return assignmentLocations;
  }, [authLocations, assignmentLocations, assignmentNameById]);

  const active = useMemo(() => {
    if (!locationId) return null;
    const match = locations.find((l) => l.id === locationId);
    if (match && !isPlaceholderName(match.name)) return match;
    const fromSession = assignmentNameById.get(locationId);
    if (fromSession) return { id: locationId, name: fromSession };
    if (match) return match;
    return { id: locationId, name: locationLabel({ id: locationId }) };
  }, [locationId, locations, assignmentNameById]);

  const select = (loc: LocationOption) => {
    if (loc.id === locationId) return;
    setLocationId(loc.id);
    void queryClient.invalidateQueries();
    toast.success(`Switched to ${loc.name}`);
  };

  const showNameSkeleton = Boolean(locationId) && loadingAll && !active?.name;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-12 max-w-[220px] items-center justify-between gap-2 rounded-[2px] bg-transparent px-2.5 text-left hover:bg-black/[0.04]',
            className,
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <MapPin weight="bold" className="size-3.5 shrink-0 text-green-700" />
            <span className="flex min-w-0 flex-col leading-none">
              {showNameSkeleton ? (
                <Skeleton className="h-3 w-24" />
              ) : (
                <span className="truncate text-xs font-medium">
                  {active?.name ?? 'All locations'}
                </span>
              )}
              <span className="mt-0.5 text-[10px] text-gray-500">Location</span>
            </span>
          </span>
          <CaretUpDown className="size-3.5 shrink-0 text-gray-500" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-white" align="end">
        <DropdownMenuLabel className="text-xs text-gray-500">Switch location</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loadingAll && !locations.length ? (
          <div className="space-y-2 px-2 py-3" aria-busy="true">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : locations.length === 0 ? (
          <div className="px-2 py-3 text-xs text-gray-500">No locations available for this session.</div>
        ) : (
          locations.map((loc) => (
            <DropdownMenuItem
              key={loc.id}
              onClick={() => select(loc)}
              className="flex cursor-pointer items-center justify-between gap-2 text-xs"
            >
              <span className="truncate">{loc.name}</span>
              {loc.id === locationId ? (
                <Check className="size-3.5 shrink-0 text-green-700" weight="bold" />
              ) : null}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
