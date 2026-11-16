'use client';
import RootLayout from '../../layout';
import { PageContainer, PageHeader } from '../../_shared/states';
import { CatalogList, loadModifiers } from '../catalog-lists';

export default function ModifiersPage() {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader title="Modifiers" description="Organization-wide add-ons mirrored from Pay." />
        <CatalogList
          queryKey="product-modifiers"
          loader={loadModifiers}
          render={(row) => (
            <div key={row.uuid} className="dashboard-panel p-4">
              <p className="font-medium">{row.name}</p>
              <p className="text-sm text-muted-foreground">{row.price}</p>
            </div>
          )}
        />
      </PageContainer>
    </RootLayout>
  );
}
