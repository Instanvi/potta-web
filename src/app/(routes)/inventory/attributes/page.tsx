'use client';
import RootLayout from '../../layout';
import { PageContainer, PageHeader } from '../../_shared/states';
import { AttributeCreateForm, CatalogList, loadLabels } from '../catalog-lists';

export default function AttributesPage() {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Attributes"
          description="Variation attributes such as Size and Color. Add them here or when you create an item."
        />
        <AttributeCreateForm />
        <CatalogList
          queryKey="product-labels"
          loader={loadLabels}
          empty="No attributes yet. Add one above, or create them on a product."
          render={(row) => (
            <div key={row.uuid} className="dashboard-panel p-4">
              <p className="font-medium">{row.name}</p>
              <p className="text-sm text-muted-foreground">
                {(row.options ?? []).map((o: any) => o.value).join(', ') || 'No options'}
                {row.payLabelId ? ' · from Pay' : ''}
              </p>
            </div>
          )}
        />
      </PageContainer>
    </RootLayout>
  );
}
