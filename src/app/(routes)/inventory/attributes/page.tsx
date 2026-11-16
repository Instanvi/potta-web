'use client';
import RootLayout from '../../layout';
import { PageContainer, PageHeader } from '../../_shared/states';
import { CatalogList, loadLabels } from '../catalog-lists';

export default function AttributesPage() {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader title="Attributes" description="Variation attributes (Size, Color) mirrored from Pay." />
        <CatalogList
          queryKey="product-labels"
          loader={loadLabels}
          render={(row) => (
            <div key={row.uuid} className="dashboard-panel p-4">
              <p className="font-medium">{row.name}</p>
              <p className="text-sm text-muted-foreground">
                {(row.options ?? []).map((o: any) => o.value).join(', ') || 'No options'}
              </p>
            </div>
          )}
        />
      </PageContainer>
    </RootLayout>
  );
}
