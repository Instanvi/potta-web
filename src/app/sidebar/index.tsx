'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  CaretDoubleLeft,
  CaretDoubleRight,
  PushPin,
  PushPinSlash,
  SignOut,
  User,
} from '@phosphor-icons/react';
import { ContextData } from '@potta/components/providers/DataProvider';
import { AppIcon } from '@/components/app-icon';
import { cn } from '@potta/lib/utils';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';
import {
  NAV_MODULES,
  getActiveModule,
  getActiveNavItem,
  type NavModule,
} from '@/lib/navigation';
import { useCanOpenRoute } from '@/lib/use-can-open-route';
import { signOutWithAuthApi } from '@/lib/auth-sign-out';

/** Icon rail (module toggler) + links panel, as in instanvi-payroll-expense-fe. */
export const SIDEBAR_RAIL_WIDTH = 56;
export const SIDEBAR_PANEL_WIDTH = 208;
const PIN_STORAGE_KEY = 'potta.sidebar.panelPinned';

const RailButton = ({
  module,
  active,
  onSelect,
}: {
  module: NavModule;
  active: boolean;
  onSelect: (module: NavModule) => void;
}) => {
  const ModuleIcon = module.icon;
  return (
    <button
      type="button"
      title={module.title}
      aria-label={module.title}
      aria-pressed={active}
      onClick={() => onSelect(module)}
      className={cn(
        'flex size-10 items-center justify-center rounded-md transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-foreground/70 hover:bg-brand-subtle hover:text-primary'
      )}
    >
      <ModuleIcon size={20} weight={active ? 'fill' : 'regular'} />
    </button>
  );
};

const UserMenu = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const initials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account"
          className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-medium text-white"
        >
          {initials || <User size={16} />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium">{session?.user?.name ?? 'Signed in'}</p>
          <p className="truncate text-xs text-muted-foreground">{session?.user?.email ?? ''}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onClick={() => void signOutWithAuthApi()}>
          <SignOut size={16} className="mr-2" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Sidebars = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const router = useRouter();
  const context = useContext(ContextData);
  const canOpen = useCanOpenRoute();
  const collapsed = !!context?.toggle;
  const [pinned, setPinned] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const next = window.localStorage.getItem(PIN_STORAGE_KEY) === '1';
      setPinned(next);
      if (next) context?.setToggle(false);
    } catch {
      /* ignore */
    }
    return () => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const modules = NAV_MODULES.map((m) => ({
    ...m,
    items: m.items.filter((i) => canOpen(i.href.split('?')[0])),
  })).filter((m) => m.items.length > 0);
  const routeModule = getActiveModule(pathname);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const highlightedId = routeModule?.id ?? pickedId;
  const active = modules.find((m) => m.id === highlightedId) ?? modules[0];
  const activeItem = active
    ? getActiveNavItem(pathname, active.items, search)
    : null;

  const select = (module: NavModule) => {
    setPickedId(module.id);
    if (collapsed) context?.setToggle(false);
    if (routeModule?.id !== module.id) router.push(module.items[0].href);
  };

  const setPinnedPersist = (next: boolean) => {
    setPinned(next);
    try {
      window.localStorage.setItem(PIN_STORAGE_KEY, next ? '1' : '0');
    } catch {
      /* ignore */
    }
    if (next) context?.setToggle(false);
  };

  const openFromHover = () => {
    if (collapsed) context?.setToggle(false);
  };

  const closeIfUnpinned = () => {
    if (!pinned) context?.setToggle(true);
  };

  const handleMouseEnter = () => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  };

  const handleMouseLeave = () => {
    if (pinned) return;
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(() => closeIfUnpinned(), 180);
  };

  const top = modules.filter((m) => m.placement !== 'bottom');
  const bottom = modules.filter((m) => m.placement === 'bottom');

  return (
    <aside
      className="flex h-screen border-r border-black/[0.08] bg-white font-sans"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex w-14 shrink-0 flex-col items-center gap-2 py-3">
        <Link href="/" aria-label="Potta" className="mb-2 flex size-10 items-center justify-center rounded-md">
          <img src="/icons/Potta.svg" alt="Potta" className="size-8 object-contain" />
        </Link>
        <nav aria-label="Modules" className="flex flex-1 flex-col items-center gap-2">
          {top.map((m) => (
            <RailButton key={m.id} module={m} active={m.id === highlightedId} onSelect={select} />
          ))}
        </nav>
        <div className="flex flex-col items-center gap-1">
          {bottom.map((m) => (
            <RailButton key={m.id} module={m} active={m.id === highlightedId} onSelect={select} />
          ))}
          <button
            type="button"
            title={collapsed ? 'Expand menu' : 'Collapse menu'}
            aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
            onMouseEnter={openFromHover}
            onFocus={openFromHover}
            onClick={() => context?.setToggle(!collapsed)}
            className="flex size-10 items-center justify-center rounded-md text-foreground/60 hover:bg-brand-subtle hover:text-primary"
          >
            {collapsed ? <CaretDoubleRight size={18} /> : <CaretDoubleLeft size={18} />}
          </button>
          <button
            type="button"
            title={pinned ? 'Unpin menu' : 'Pin menu open'}
            aria-label={pinned ? 'Unpin menu' : 'Pin menu open'}
            aria-pressed={pinned}
            onClick={() => setPinnedPersist(!pinned)}
            className={cn(
              'flex size-10 items-center justify-center rounded-md transition-colors',
              pinned
                ? 'bg-brand-subtle text-primary'
                : 'text-foreground/60 hover:bg-brand-subtle hover:text-primary'
            )}
          >
            {pinned ? <PushPin size={16} weight="fill" /> : <PushPinSlash size={16} />}
          </button>
          <UserMenu />
        </div>
      </div>

      {!collapsed && active && (
        <div
          className="flex min-w-0 flex-col border-l border-black/[0.06]"
          style={{ width: SIDEBAR_PANEL_WIDTH }}
        >
          <div className="shrink-0 border-b border-black/[0.06] px-3 py-3.5">
            <p className="truncate text-base font-medium tracking-tight text-foreground">
              {active.title}
            </p>
          </div>
          <nav
            aria-label={`${active.title} pages`}
            className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 py-2 font-sans"
          >
            {active.items.map((item) => {
              const on = activeItem?.href === item.href;
              const ItemIcon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex h-10 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors',
                    on
                      ? 'bg-primary font-medium text-primary-foreground'
                      : 'text-foreground hover:bg-brand-subtle hover:text-primary'
                  )}
                >
                  {item.appIcon ? (
                    <AppIcon src={item.appIcon} className="size-5" />
                  ) : (
                    <ItemIcon size={20} weight={on ? 'fill' : 'regular'} />
                  )}
                  <span className="truncate">{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </aside>
  );
};

export default Sidebars;
