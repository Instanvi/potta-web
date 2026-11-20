import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import type { ProductCategory } from '../_utils/types';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';
import { Button } from '@potta/components/shadcn/button';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@potta/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@potta/components/shadcn/dropdown';
import Input from '@potta/components/input';
import { useProductCategoryManager } from '../_hooks/useProductCategoryManager';
import { EmptyState, PageHeader, Panel } from '../../../_shared/states';
import ButtonLegacy from '@potta/components/button';

const CategoryManager = () => {
  const {
    modalOpen,
    setModalOpen,
    editMode,
    setEditMode,
    setEditId,
    deleteId,
    setDeleteId,
    data,
    isLoading,
    tableProps,
    register,
    handleSubmit,
    reset,
    errors,
    handleOpenModal,
    handleEdit,
    handleDelete,
    onSubmit,
    createCategory,
  } = useProductCategoryManager();

  const closeCategorySheet = () => {
    setModalOpen(false);
    setEditMode(false);
    setEditId(null);
    reset();
  };

  const rows = data?.data || [];

  const columns: ColumnDef<ProductCategory>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row: { original } }) => original.description || '—',
    },
    {
      id: 'products',
      header: 'Products',
      cell: ({ row: { original } }) =>
        original.productCount ?? original.productsCount ?? 0,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row: { original } }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-[2px] p-2 transition-colors hover:bg-black/[0.04]"
            >
              <i className="ri-more-2-fill text-xl text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => handleEdit(original)}>
              <i className="ri-edit-line mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteId(original.uuid)}
              className="text-destructive"
            >
              <i className="ri-delete-bin-line mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="w-full">
      <PageHeader
        title="Categories"
        actions={
          <Button type="button" size="sm" onClick={handleOpenModal}>
            Add Category
          </Button>
        }
      />

      {isLoading ? (
        <Panel className="px-6 py-16 text-center text-sm text-muted-foreground">
          Loading…
        </Panel>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No categories yet"
          action={
            <Button type="button" size="sm" onClick={handleOpenModal}>
              Add Category
            </Button>
          }
        />
      ) : (
        <Panel className="overflow-hidden p-0">
          <DataGrid
            columns={columns}
            data={rows}
            isLoading={false}
            {...tableProps(data?.meta, rows.length)}
          />
        </Panel>
      )}

      <Sheet
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            closeCategorySheet();
          }
        }}
      >
        <SheetContent
          side="left"
          className="flex h-full w-full flex-col bg-white p-0"
        >
          <SheetHeader className="border-b border-black/10 bg-white px-6 py-5">
            <SheetTitle>
              {editMode ? 'Edit Category' : 'Add Category'}
            </SheetTitle>
          </SheetHeader>
          <form
            id="category-form-sheet"
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 space-y-4 overflow-y-auto bg-white px-6 py-5"
          >
            <Input
              label="Name"
              type="text"
              name="name"
              register={register}
              errors={errors.name}
              required
            />
            <Input
              label="Description"
              type="text"
              name="description"
              register={register}
              errors={errors.description}
            />
          </form>
          <SheetFooter className="mt-0 border-t border-black/10 px-6 py-3">
            <ButtonLegacy
              text="Cancel"
              type="button"
              theme="gray"
              onClick={closeCategorySheet}
            />
            <ButtonLegacy
              text={
                createCategory.isPending
                  ? 'Saving...'
                  : editMode
                    ? 'Save Changes'
                    : 'Save'
              }
              type="button"
              onClick={handleSubmit(onSubmit)}
              isLoading={createCategory.isPending}
            />
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="dashboard-panel w-full max-w-md p-8">
            <h3 className="mb-4 text-xl font-medium tracking-tight">Delete Category</h3>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this category?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <ButtonLegacy
                text="Cancel"
                type="button"
                theme="gray"
                onClick={() => setDeleteId(null)}
              />
              <ButtonLegacy
                text="Delete"
                type="button"
                theme="red"
                onClick={handleDelete}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
