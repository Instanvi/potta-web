import { MenuItem } from './custom-navbar';
import { NAV_MODULES } from '@/lib/navigation';

/** Navbar layout menu, generated from the same module config as the sidebar. */
export const menuStructure: MenuItem[] = NAV_MODULES.map(
  (module) =>
    ({
      title: module.title,
      children: module.items.map((item) => ({ title: item.title, href: item.href })),
    }) as MenuItem,
);
