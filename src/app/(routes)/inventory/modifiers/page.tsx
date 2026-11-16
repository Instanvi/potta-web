'use client';
import RootLayout from '../../layout';
import { PageContainer, PageHeader } from '../../_shared/states';
import { CatalogList, ModifierCreateForm, loadModifiers } from '../catalog-lists';

export default function ModifiersPage() {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Modifiers"
          description="Add-ons charged on top of an item. Create them here for the whole shop, or on a specific product."
        />
        <ModifierCreateForm />
        <CatalogList
          queryKey="product-modifiers"
          loader={loadModifiers}
          empty="No modifiers yet. Add one above, or create them on a product."
          render={(row) => (
            <div key={row.uuid} className="dashboard-panel p-4">
              <p className="font-medium">{row.name}</p>
              <p className="text-sm text-muted-foreground">
                {row.price}
                {row.product?.name ? ` · ${row.product.name}` : ' · all products'}
                {row.payModifierId ? ' · from Pay' : ''}
              </p>
            </div>
          )}
        />
      </PageContainer>
    </RootLayout>
  );
}
