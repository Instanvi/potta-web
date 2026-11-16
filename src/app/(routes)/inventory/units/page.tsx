'use client';
import RootLayout from '../../layout';
import { PageContainer, PageHeader } from '../../_shared/states';
import { CatalogList, loadUnits } from '../catalog-lists';

export default function UnitsPage() {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader title="Units" description="Sellable units mirrored from Pay." />
        <CatalogList
          queryKey="units"
          loader={loadUnits}
          render={(row) => (
            <div key={row.uuid} className="dashboard-panel p-4">
              <p className="font-medium">
                {row.name} ({row.symbol})
              </p>
              <p className="text-sm text-muted-foreground">Factor {row.factor}</p>
            </div>
          )}
        />
      </PageContainer>
    </RootLayout>
  );
}
