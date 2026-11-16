'use client';
import RootLayout from '../../layout';
import { PageContainer, PageHeader } from '../../_shared/states';
import { CatalogList, UnitCreateForm, loadUnits } from '../catalog-lists';

export default function UnitsPage() {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Units"
          description="Sellable units for counting and packing items. Add them here or when you create an item."
        />
        <UnitCreateForm />
        <CatalogList
          queryKey="units"
          loader={loadUnits}
          empty="No units yet. Add one above, or create them on a product."
          render={(row) => (
            <div key={row.uuid} className="dashboard-panel p-4">
              <p className="font-medium">
                {row.name} ({row.symbol})
              </p>
              <p className="text-sm text-muted-foreground">
                Factor {row.factor}
                {row.payUnitId ? ' · from Pay' : row.orgId ? '' : ' · global'}
              </p>
            </div>
          )}
        />
      </PageContainer>
    </RootLayout>
  );
}
