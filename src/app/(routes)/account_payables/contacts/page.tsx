import RootLayout from '../../layout';
import ContactsContent, { readContactType } from '../../../../components/shared/ContactsContent';
import { PageContainer, PageHeader } from '../../_shared/states';

export default async function PayableContactsPage({
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
          description="Suppliers you buy from, and the customers you sell to."
        />
        <ContactsContent initialType={readContactType(params.type)} />
      </PageContainer>
    </RootLayout>
  );
}
