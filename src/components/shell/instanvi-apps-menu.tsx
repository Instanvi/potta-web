'use client';

import { DotsNine } from '@phosphor-icons/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';
import { INSTANVI_APPS, SUPER_APP_URL } from '@/lib/constants/apps';

/** Jump to another Instanvi app; each app's /auth-callback picks up the hub session. */
export function InstanviAppsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Instanvi apps"
          className="flex h-10 w-10 items-center justify-center rounded hover:bg-gray-50"
        >
          <DotsNine size={22} className="text-gray-700" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-white p-2">
        <DropdownMenuLabel className="text-xs text-gray-500">Instanvi apps</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="grid grid-cols-3 gap-1 pt-1">
          {INSTANVI_APPS.map((app) => (
            <DropdownMenuItem key={app.id} asChild className="cursor-pointer p-0">
              <a href={app.url} className="flex flex-col items-center gap-1.5 rounded px-2 py-3 hover:bg-gray-50">
                <img src={app.logo} alt="" width={28} height={28} className="h-7 w-7" />
                <span className="text-xs font-medium text-gray-800">{app.name}</span>
              </a>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer text-xs">
          <a href={SUPER_APP_URL}>All apps</a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
