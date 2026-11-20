'use client';

import { useCallback, useEffect, useState } from 'react';
import RootLayout from '@/app/(routes)/layout';
import { ErrorState, PageContainer, Panel, StatCard } from '@/app/(routes)/_shared/states';
import { Button } from '@/components/shadcn/button';
import axios from 'config/axios.config';
import { booksApi, extractBooksRows } from '@/lib/books-api';

export function InventoryOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [itemCount, setItemCount] = useState(0);
  const [poOpen, setPoOpen] = useState(0);
  const [receiptCount, setReceiptCount] = useState(0);
  const [shipmentCount, setShipmentCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsRes, poRes, receipts, shipments] = await Promise.all([
        axios.get('/Item', { params: { page: 1, limit: 1 } }).catch(() => null),
        booksApi.list('purchase-order', {}, { page: 1, limit: 50 }).catch(() => null),
        booksApi.list('item-receipt', {}, { page: 1, limit: 1 }).catch(() => null),
        booksApi.list('shipment', {}, { page: 1, limit: 1 }).catch(() => null),
      ]);

      const itemsMeta = itemsRes?.data?.meta ?? itemsRes?.data;
      setItemCount(
        Number(itemsMeta?.totalItems ?? itemsMeta?.total ?? extractBooksRows(itemsRes?.data).length) || 0
      );

      const pos = extractBooksRows(poRes);
      setPoOpen(
        pos.filter((p) => {
          const s = String(p.status ?? '').toLowerCase();
          return s && !['received', 'closed', 'cancelled', 'canceled'].includes(s);
        }).length || pos.length
      );

      const receiptMeta = (receipts as any)?.meta;
      setReceiptCount(Number(receiptMeta?.totalItems ?? extractBooksRows(receipts).length) || 0);

      const shipMeta = (shipments as any)?.meta;
      setShipmentCount(Number(shipMeta?.totalItems ?? extractBooksRows(shipments).length) || 0);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <RootLayout>
      <PageContainer>
        <div className="mb-4 flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            Refresh
          </Button>
        </div>
        {error ? (
          <ErrorState error={error} onRetry={() => void load()} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Items" value={loading ? '…' : itemCount} hint="Products & services" />
            <StatCard label="Open POs" value={loading ? '…' : poOpen} hint="Purchase orders" />
            <StatCard label="Item receipts" value={loading ? '…' : receiptCount} />
            <StatCard label="Shipments" value={loading ? '…' : shipmentCount} />
          </div>
        )}
        <Panel className="mt-6 px-6 py-8 text-sm text-muted-foreground">
          Inventory KPIs from Item and purchase-order APIs. Use the sidebar for receipts, shipments, and stock
          movements.
        </Panel>
      </PageContainer>
    </RootLayout>
  );
}
