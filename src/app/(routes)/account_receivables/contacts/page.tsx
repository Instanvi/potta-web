import RootLayout from '../../layout';
import ContactsContent, { readContactType } from '../../../../components/shared/ContactsContent';
import { PageContainer, PageHeader } from '../../_shared/states';

export default async function ReceivableContactsPage({
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
          description="People and businesses you invoice, plus the vendors you buy from."
        />
        <ContactsContent initialType={readContactType(params.type)} />
      </PageContainer>
    </RootLayout>
  );
}
