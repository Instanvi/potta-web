'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import RootLayout from '@/app/(routes)/layout';
import { EmptyState, ErrorState, ListToolbar, PageContainer, PageHeader, Panel } from '@/app/(routes)/_shared/states';
import { useCreateEmployee, useGetEmployees } from '@/app/(routes)/accounting/employees/hooks';
import {
  createEmployeeSchema,
  type CreateEmployeePayload,
} from '@/app/(routes)/accounting/employees/utils/validations';
import { Button } from '@/components/shadcn/button';
import Input from '@/components/input';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { FIELD_INPUT } from '@/lib/field-styles';
import { cellValue, rowId } from '@/lib/books-api';
import { cn } from '@/lib/utils';

const COLUMNS = [
  { key: 'first_name', label: 'First name' },
  { key: 'last_name', label: 'Last name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' },
  { key: 'job_title', label: 'Job title' },
];

const defaultValues: CreateEmployeePayload = {
  first_name: '',
  last_name: '',
  email: '',
  job_title: '',
  status: 'active',
};

export function PayrollEmployeesPage() {
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const { data: rows = [], isLoading, isFetching, error, refetch } = useGetEmployees({
    page: 1,
    limit: 50,
    search,
  });
  const createMutation = useCreateEmployee();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateEmployeePayload>({
    resolver: yupResolver(createEmployeeSchema),
    defaultValues,
  });

  useEffect(() => {
    if (createOpen) reset(defaultValues);
  }, [createOpen, reset]);

  const onSubmit = (values: CreateEmployeePayload) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        setCreateOpen(false);
        reset(defaultValues);
      },
    });
  };

  const applySearch = () => setSearch(searchInput.trim());

  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Employees"
          actions={
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void refetch()}
                disabled={isFetching}
              >
                Refresh
              </Button>
              <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
                New
              </Button>
            </>
          }
        />
        <ListToolbar>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applySearch()}
            placeholder="Search employees…"
            className={cn(FIELD_INPUT, 'max-w-sm')}
          />
        </ListToolbar>

        <div className="mt-4">
          {error ? (
            <ErrorState error={error} onRetry={() => void refetch()} />
          ) : isLoading ? (
            <Panel className="px-6 py-16 text-center text-sm text-muted-foreground">Loading…</Panel>
          ) : rows.length === 0 ? (
            <EmptyState
              title="No employees"
              description="Payroll API returned no rows, or the service is unreachable."
            />
          ) : (
            <Panel className="overflow-x-auto p-0">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10">
                    {COLUMNS.map((c) => (
                      <th key={c.key} className="px-4 py-3 font-medium text-muted-foreground">
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={rowId(row)} className="border-b border-black/10">
                      {COLUMNS.map((c) => (
                        <td key={c.key} className="px-4 py-3">
                          {cellValue(row, c.key)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          )}
        </div>

        <Sheet open={createOpen} onOpenChange={setCreateOpen}>
          <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-md">
            <SheetHeader>
              <SheetTitle>New employee</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <Input
                type="text"
                name="first_name"
                label="First name"
                placeholder="Jane"
                required
                register={register}
                errors={errors.first_name}
              />
              <Input
                type="text"
                name="last_name"
                label="Last name"
                placeholder="Doe"
                required
                register={register}
                errors={errors.last_name}
              />
              <Input
                type="email"
                name="email"
                label="Email"
                placeholder="jane@example.com"
                required
                register={register}
                errors={errors.email}
              />
              <Input
                type="text"
                name="job_title"
                label="Job title"
                placeholder="Accountant"
                register={register}
                errors={errors.job_title}
              />
              <SheetFooter className="mt-6 px-0 sm:justify-end">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Saving…' : 'Create'}
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </PageContainer>
    </RootLayout>
  );
}
