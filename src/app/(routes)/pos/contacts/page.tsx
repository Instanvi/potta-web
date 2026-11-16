import RootLayout from '../../layout';
import ContactsContent, { readContactType } from '../../../../components/shared/ContactsContent';
import { PageContainer, PageHeader } from '../../_shared/states';

export default async function PosContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Contacts"
          description="Shoppers and suppliers for the till. Filter by customers, vendors, or both."
        />
        <ContactsContent initialType={readContactType(params.type)} />
      </PageContainer>
    </RootLayout>
  );
}
