'use client';
import Link from 'next/link';
import { Can } from '@/components/auth/can';
import RootLayout from '../../../layout';
import { PageContainer, PageHeader } from '../../../_shared/states';
import BillForm from './components/BillForm';

export default function NewBillPage() {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="New bill"
          description="Record a vendor bill. It stays a draft until someone approves it."
          actions={
            <Link href="/account_payables/bills" className="text-sm text-muted-foreground hover:text-primary">
              <i className="ri-arrow-left-line mr-1" />
              Back to bills
            </Link>
          }
        />
        <Can
          resource="Bill"
          action="create"
          fallback={<p className="text-sm text-muted-foreground">You do not have permission to create bills.</p>}
        >
          <BillForm />
        </Can>
      </PageContainer>
    </RootLayout>
  );
}
