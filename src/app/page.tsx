'use client';
import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ArrowRight, GearSix, type Icon } from '@phosphor-icons/react';
import RootLayout from './(routes)/layout';
import { PageContainer } from './(routes)/_shared/states';
import { HomeSkeleton } from './component/HomeSkeleton';
import { NAV_MODULES } from '@/lib/navigation';
import { useCanOpenRoute } from '@/lib/use-can-open-route';

interface ControlCard {
  id: string;
  title: string;
  description: string;
  icon: Icon;
  href: string;
  links: { title: string; href: string }[];
}

const SETTINGS_CARD: ControlCard = {
  id: 'settings',
  title: 'Settings',
  description: 'Organization configuration, locations and the audit log.',
  icon: GearSix,
  href: '/settings',
  links: [
    { title: 'Config', href: '/settings' },
    { title: 'Audit log', href: '/settings/audit-logs' },
  ],
};

const MAX_LINKS = 4;

const ControlCardView = ({ card }: { card: ControlCard }) => {
  const CardIcon = card.icon;
  return (
    <div className="dashboard-panel group flex flex-col gap-4 p-5 transition-colors hover:border-primary/30 hover:bg-brand-subtle/40">
      <Link href={card.href} className="flex items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-[2px] bg-muted text-primary">
          <CardIcon size={24} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="text-base font-medium text-foreground">{card.title}</span>
            <ArrowRight
              size={16}
              className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
            />
          </span>
          <span className="mt-0.5 block text-sm text-muted-foreground">{card.description}</span>
        </span>
      </Link>
      {card.links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {card.links.slice(0, MAX_LINKS).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex h-7 items-center rounded-[2px] border border-black/[0.08] bg-background px-2 text-xs font-medium text-foreground hover:border-primary/40 hover:text-primary"
            >
              {link.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const HomePage = () => {
  const [mounted, setMounted] = React.useState(false);
  const { data: session } = useSession();
  const canOpen = useCanOpenRoute();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const cards: ControlCard[] = [
    ...NAV_MODULES.map((module) => {
      const links = module.items.filter((item) => canOpen(item.href));
      return {
        id: module.id,
        title: module.title,
        description: module.description,
        icon: module.icon,
        href: links[0]?.href ?? module.items[0].href,
        links: links.map(({ title, href }) => ({ title, href })),
      };
    }).filter((card) => card.links.length > 0),
    ...(canOpen(SETTINGS_CARD.href) ? [SETTINGS_CARD] : []),
  ];

  const firstName = session?.user?.name?.split(' ')[0];

  return (
    <RootLayout>
      <PageContainer>
        {!mounted ? (
          <HomeSkeleton />
        ) : (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-medium text-foreground">
                {firstName ? `Welcome back, ${firstName}` : 'Welcome to Potta'}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">Where do you want to go?</p>
            </div>
            {cards.length === 0 ? (
              <div className="dashboard-panel px-6 py-16 text-center text-sm text-muted-foreground">
                You don&apos;t have access to any module yet. Ask an administrator for permissions.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map((card) => (
                  <ControlCardView key={card.id} card={card} />
                ))}
              </div>
            )}
          </div>
        )}
      </PageContainer>
    </RootLayout>
  );
};

export default HomePage;
