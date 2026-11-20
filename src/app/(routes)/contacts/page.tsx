import RootLayout from '../layout';
import ContactsContent, { readContactType } from '../../../components/shared/ContactsContent';
import { PageContainer } from '../_shared/states';

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  return (
    <RootLayout>
      <PageContainer>
        <ContactsContent initialType={readContactType(params.type)} />
      </PageContainer>
    </RootLayout>
  );
}
