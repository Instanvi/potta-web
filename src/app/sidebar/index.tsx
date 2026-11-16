'use client';

import { useContext, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CaretDoubleLeft, CaretDoubleRight, SignOut, User } from '@phosphor-icons/react';
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
import { NAV_MODULES, getActiveModule, isNavActive, type NavModule } from '@/lib/navigation';
import { useCanOpenRoute } from '@/lib/use-can-open-route';
import { signOutWithAuthApi } from '@/lib/auth-sign-out';

/** Icon rail (module toggler) + links panel, as in instanvi-payroll-expense-fe. */
export const SIDEBAR_RAIL_WIDTH = 56;
export const SIDEBAR_PANEL_WIDTH = 208;

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
        active ? 'bg-white/20 text-white' : 'text-white/75 hover:bg-white/15 hover:text-white'
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
          className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-white/20 text-xs font-medium text-white hover:bg-white/30"
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
  const router = useRouter();
  const context = useContext(ContextData);
  const canOpen = useCanOpenRoute();
  const collapsed = !!context?.toggle;

  const modules = NAV_MODULES.map((m) => ({ ...m, items: m.items.filter((i) => canOpen(i.href)) })).filter(
    (m) => m.items.length > 0
  );
  const routeModule = getActiveModule(pathname);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const highlightedId = routeModule?.id ?? pickedId;
  const active = modules.find((m) => m.id === highlightedId) ?? modules[0];

  const select = (module: NavModule) => {
    setPickedId(module.id);
    if (collapsed) context?.setToggle(false);
    if (routeModule?.id !== module.id) router.push(module.items[0].href);
  };

  const top = modules.filter((m) => m.placement !== 'bottom');
  const bottom = modules.filter((m) => m.placement === 'bottom');

  return (
    <aside className="flex h-screen border-r border-white/15 bg-primary font-sans text-white">
      <div className="flex w-14 shrink-0 flex-col items-center gap-2 border-r border-white/15 py-3">
        <Link href="/" aria-label="Potta" className="mb-2 flex size-10 items-center justify-center rounded-md">
          <img src="/icons/Potta.svg" alt="Potta" className="size-8 object-contain brightness-0 invert" />
        </Link>
        <nav aria-label="Modules" className="flex flex-1 flex-col items-center gap-2">
          {top.map((m) => (
            <RailButton key={m.id} module={m} active={m.id === highlightedId} onSelect={select} />
          ))}
        </nav>
        <div className="flex flex-col items-center gap-2">
          {bottom.map((m) => (
            <RailButton key={m.id} module={m} active={m.id === highlightedId} onSelect={select} />
          ))}
          <button
            type="button"
            title={collapsed ? 'Show menu' : 'Hide menu'}
            aria-label={collapsed ? 'Show menu' : 'Hide menu'}
            onClick={() => context?.setToggle(!collapsed)}
            className="flex size-10 items-center justify-center rounded-md text-white/75 hover:bg-white/15 hover:text-white"
          >
            {collapsed ? <CaretDoubleRight size={18} /> : <CaretDoubleLeft size={18} />}
          </button>
          <UserMenu />
        </div>
      </div>

      {!collapsed && active && (
        <div
          className="flex min-w-0 flex-col"
          style={{ width: SIDEBAR_PANEL_WIDTH }}
        >
          <div className="shrink-0 border-b border-white/15 px-3 py-3">
            <p className="truncate text-sm font-semibold text-white">{active.title}</p>
            <p className="truncate text-[11px] text-white/70" title={active.description}>
              {active.description}
            </p>
          </div>
          <nav aria-label={`${active.title} pages`} className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 py-2">
            {active.items.map((item) => {
              const on = isNavActive(pathname, item);
              const ItemIcon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex h-10 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors',
                    on
                      ? 'bg-white/20 font-medium text-white'
                      : 'text-white/90 hover:bg-white/15 hover:text-white'
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
