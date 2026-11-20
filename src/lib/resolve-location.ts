import type { App, Hierarchy, OrganizationAssignment } from '@/types/auth';

function trimId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const id = value.trim();
  return id || null;
}

function locationFromHierarchy(hierarchy?: Hierarchy | null): string | null {
  if (!hierarchy) return null;
  return (
    trimId(hierarchy.location?.id) ??
    trimId(hierarchy.treePosition?.accessControl?.locationId) ??
    trimId(hierarchy.location_id)
  );
}

function locationFromAssignments(assignments?: OrganizationAssignment[] | null): string | null {
  if (!assignments?.length) return null;
  const active = assignments.find((a) => a?.isActive && trimId(a.location?.id));
  const any = active ?? assignments.find((a) => trimId(a?.location?.id));
  return trimId(any?.location?.id);
}

function defaultLocationFromApp(app?: App | null): string | null {
  const config = app?.config;
  if (!config || typeof config !== 'object') return null;
  return (
    trimId(config.default_location_id) ??
    trimId(config.defaultLocationId) ??
    trimId(config.location_id) ??
    trimId(config.locationId)
  );
}

/** Order: selected -> hierarchy -> assignments -> app default. Never falls back to the organization id. */
export function resolveLocationId(sources: {
  selectedLocationId?: string | null;
  hierarchy?: Hierarchy | null;
  organizationAssignments?: OrganizationAssignment[] | null;
  activeApp?: App | null;
  apps?: App[] | null;
}): string | null {
  const selected = trimId(sources.selectedLocationId);
  if (selected) return selected;
  const apps = sources.apps ?? [];
  const preferredApp = apps.find((a) => a.isDefault) ?? apps[0] ?? null;
  return (
    locationFromHierarchy(sources.hierarchy) ??
    locationFromAssignments(sources.organizationAssignments) ??
    defaultLocationFromApp(sources.activeApp) ??
    defaultLocationFromApp(preferredApp)
  );
}
