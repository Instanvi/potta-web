'use client';

import React, { useState } from 'react';
import { Can, useCan } from '@/components/auth/can';
import { EmptyState, PageContainer, PageHeader, Tabs } from '../../_shared/states';
import AuditLogsPanel from './components/AuditLogsPanel';
import NotificationLogsPanel from './components/NotificationLogsPanel';

type Tab = 'audit' | 'notifications';

const TABS: { id: Tab; label: string }[] = [
  { id: 'audit', label: 'Audit log' },
  { id: 'notifications', label: 'Notifications sent' },
];

function NoAccess({ what }: { what: string }) {
  return (
    <EmptyState
      title={`You don't have access to ${what}`}
      description="Ask an organization admin to grant you the permission, then reload this page."
    />
  );
}

export default function AuditLogsPage() {
  const { canAccess } = useCan();
  const canAudit = canAccess('AuditLog', 'view');
  const canNotifications = canAccess('NotificationLog', 'view');
  const [tab, setTab] = useState<Tab>('audit');
  const active: Tab = tab === 'audit' && !canAudit && canNotifications ? 'notifications' : tab;

  return (
    <PageContainer>
      <PageHeader
        title="Audit log"
        description="Who changed what in your books, and which notifications Potta sent."
      />
      <Tabs tabs={TABS} value={active} onChange={setTab} />

      {active === 'audit' ? (
        <Can resource="AuditLog" action="view" fallback={<NoAccess what="the audit log" />}>
          <AuditLogsPanel />
        </Can>
      ) : (
        <Can resource="NotificationLog" action="view" fallback={<NoAccess what="the notification log" />}>
          <NotificationLogsPanel />
        </Can>
      )}
    </PageContainer>
  );
}
