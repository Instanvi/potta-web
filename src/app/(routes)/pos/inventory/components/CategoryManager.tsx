'use client';

import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import type { ProductCategory } from '../_utils/types';
import { DataTable, useDataTableHandle } from '@potta/components/ui/data-table';
import { DataTableViewOptions } from '@potta/components/ui/data-table-view-options';
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
import { ListToolbar } from '../../../_shared/states';
import ButtonLegacy from '@potta/components/button';
import { ExportButton } from '@potta/components/export-button';
import { fetchAllPages } from '@potta/lib/fetch-all-pages';
import { productCategoryApi } from '../_utils/api';
import { FIELD_INPUT } from '@potta/lib/field-styles';
import { cn } from '@potta/lib/utils';

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

  const [search, setSearch] = useState('');
  const { table, onTableChange } = useDataTableHandle();

  const closeCategorySheet = () => {
    setModalOpen(false);
    setEditMode(false);
    setEditId(null);
    reset();
  };

  const rows = data?.data || [];

  const columns: ColumnDef<ProductCategory>[] = useMemo(
    () => [
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
        enableHiding: false,
        header: 'Actions',
        cell: ({ row: { original } }) => (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Category actions"
                  className="inline-flex size-8 items-center justify-center rounded-full p-0 transition-colors hover:bg-black/[0.04]"
                >
                  <i className="ri-more-2-fill text-base text-muted-foreground" />
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
          </div>
        ),
      },
    ],
    [handleEdit, setDeleteId],
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q),
    );
  }, [rows, search]);

  return (
    <div className="w-full">
      <ListToolbar
        className="mb-4"
        actions={
          <>
            {table ? <DataTableViewOptions table={table} /> : null}
            <ExportButton
              filename="categories"
              rows={filteredRows}
              columns={[
                { key: 'name', header: 'Name' },
                { key: 'description', header: 'Description' },
                {
                  key: 'products',
                  header: 'Products',
                  value: (r) => r.productCount ?? r.productsCount ?? 0,
                },
              ]}
              fetchAllRows={() =>
                fetchAllPages<ProductCategory>((page, limit) =>
                  productCategoryApi.getAll({
                    page,
                    limit,
                    ...(search.trim() ? { search: search.trim() } : {}),
                  }),
                )
              }
            />
            <Button type="button" size="sm" onClick={handleOpenModal}>
              Add Category
            </Button>
          </>
        }
      >
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories…"
          className={cn(FIELD_INPUT, 'max-w-xs')}
        />
      </ListToolbar>

      <DataTable
        columns={columns}
        data={search.trim() ? filteredRows : rows}
        isLoading={isLoading}
        showViewOptions={false}
        onTableChange={onTableChange}
        {...(search.trim()
          ? {}
          : tableProps(data?.meta, rows.length))}
        storageKey="pos-categories-table"
      />

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
          side="right"
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
              outlined
            />
            <Input
              label="Description"
              type="text"
              name="description"
              register={register}
              errors={errors.description}
              outlined
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
