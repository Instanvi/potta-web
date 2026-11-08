'use client';

import React, { useContext, useState } from 'react';
import { ClockCounterClockwise, PaperPlaneTilt, ShieldWarning } from '@phosphor-icons/react';
import { ContextData } from '@potta/components/providers/DataProvider';
import { Can, useCan } from '@/components/auth/can';
import AuditLogsPanel from './components/AuditLogsPanel';
import NotificationLogsPanel from './components/NotificationLogsPanel';

type Tab = 'audit' | 'notifications';

function NoAccess({ what }: { what: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 border border-black/10 bg-white px-6 py-20 text-center">
      <span className="flex h-12 w-12 items-center justify-center bg-gray-100 text-gray-500">
        <ShieldWarning size={24} />
      </span>
      <p className="text-sm font-medium text-black">You don&apos;t have access to {what}</p>
      <p className="max-w-sm text-xs text-gray-500">Ask an organization admin to grant you the permission, then reload this page.</p>
    </div>
  );
}

export default function AuditLogsPage() {
  const context = useContext(ContextData);
  const { canAccess } = useCan();
  const canAudit = canAccess('AuditLog', 'view');
  const canNotifications = canAccess('NotificationLog', 'view');
  const [tab, setTab] = useState<Tab>('audit');
  const active: Tab = tab === 'audit' && !canAudit && canNotifications ? 'notifications' : tab;

  const tabs: { id: Tab; label: string; Icon: typeof ClockCounterClockwise }[] = [
    { id: 'audit', label: 'Audit log', Icon: ClockCounterClockwise },
    { id: 'notifications', label: 'Notifications sent', Icon: PaperPlaneTilt },
  ];

  return (
    <div className={`min-h-full space-y-5 bg-[var(--main-bg)] p-6 ${context?.layoutMode === 'sidebar' ? 'pl-10' : ''}`}>
      <div>
        <h1 className="text-xl font-semibold text-black">Audit log</h1>
        <p className="text-sm text-gray-500">Who changed what in your books, and which notifications Potta sent.</p>
      </div>

      <div className="flex border-b border-black/10">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm ${
              active === id ? 'border-[#154406] font-medium text-[#154406]' : 'border-transparent text-gray-500 hover:text-black'
            }`}
          >
            <Icon size={16} weight={active === id ? 'fill' : 'regular'} />
            {label}
          </button>
        ))}
      </div>

      {active === 'audit' ? (
        <Can resource="AuditLog" action="view" fallback={<NoAccess what="the audit log" />}>
          <AuditLogsPanel />
        </Can>
      ) : (
        <Can resource="NotificationLog" action="view" fallback={<NoAccess what="the notification log" />}>
          <NotificationLogsPanel />
        </Can>
      )}
    </div>
  );
}
