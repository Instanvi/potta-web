'use client';
import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ClockCounterClockwise, GearSix, type Icon } from '@phosphor-icons/react';
import RootLayout from './(routes)/layout';
import { PageContainer } from './(routes)/_shared/states';
import { HomeSkeleton } from './component/HomeSkeleton';
import { AppIcon } from '@/components/app-icon';
import { NAV_MODULES, type NavItem } from '@/lib/navigation';
import { useCanOpenRoute } from '@/lib/use-can-open-route';

interface HomeSection {
  id: string;
  title: string;
  items: Pick<NavItem, 'title' | 'href' | 'icon' | 'appIcon'>[];
}

const SETTINGS_SECTION: HomeSection = {
  id: 'settings',
  title: 'Settings',
  items: [
    { title: 'Config', href: '/settings', icon: GearSix },
    { title: 'Audit log', href: '/settings/audit-logs', icon: ClockCounterClockwise },
  ],
};

/** Square launcher tile: icon centered over its label (payroll-expense action tile look). */
const HomeTile = ({ item }: { item: HomeSection['items'][number] }) => {
  const PhosphorIcon: Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="dashboard-panel group flex aspect-square flex-col items-center justify-center gap-2.5 p-3 text-center transition-colors hover:border-primary/30 hover:bg-brand-subtle/40"
    >
      <span className="flex size-11 items-center justify-center rounded-[2px] bg-muted text-primary transition-colors group-hover:bg-brand-subtle">
        {item.appIcon ? <AppIcon src={item.appIcon} className="size-5" /> : <PhosphorIcon size={22} />}
      </span>
      <span className="line-clamp-2 text-xs font-medium leading-tight text-foreground">{item.title}</span>
    </Link>
  );
};

const HomePage = () => {
  const [mounted, setMounted] = React.useState(false);
  const { data: session } = useSession();
  const canOpen = useCanOpenRoute();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const sections: HomeSection[] = [
    ...NAV_MODULES.map((module) => ({
      id: module.id,
      title: module.title,
      items: module.items.filter((item) => canOpen(item.href)),
    })),
    { ...SETTINGS_SECTION, items: SETTINGS_SECTION.items.filter((item) => canOpen(item.href)) },
  ].filter((section) => section.items.length > 0);

  const firstName = session?.user?.name?.split(' ')[0];

  return (
    <RootLayout>
      <PageContainer>
        {!mounted ? (
          <HomeSkeleton />
        ) : (
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
            <div>
              <h2 className="text-lg font-medium text-foreground">
                {firstName ? `Welcome back, ${firstName}` : 'Welcome to Potta'}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">Where do you want to go?</p>
            </div>
            {sections.length === 0 ? (
              <div className="dashboard-panel px-6 py-16 text-center text-sm text-muted-foreground">
                You don&apos;t have access to any module yet. Ask an administrator for permissions.
              </div>
            ) : (
              sections.map((section) => (
                <section key={section.id} className="flex flex-col gap-2.5">
                  <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {section.title}
                  </h3>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7">
                    {section.items.map((item) => (
                      <HomeTile key={item.href} item={item} />
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        )}
      </PageContainer>
    </RootLayout>
  );
};

export default HomePage;
