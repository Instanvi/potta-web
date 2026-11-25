import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productCategoryApi } from '../_utils/api';
import useGetAllProductCategories from './useGetAllProductCategories';
import useCreateProductCategory from './useCreateProductCategory';
import { productCategorySchema } from '../_utils/validation';
import { useServerPagination } from '@/hooks/use-server-pagination';

export function useProductCategoryManager() {
  const [modalOpen, setModalOpen] = useState(false);
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { page, limit, tableProps } = useServerPagination({ pageSize: 20 });
  const { data, isLoading } = useGetAllProductCategories({ page, limit });
  const createCategory = useCreateProductCategory();
  const queryClient = useQueryClient();
  const invalidateCategories = () =>
    queryClient.invalidateQueries({ queryKey: ['get-all-product-category'] });

  const updateCategory = useMutation({
    mutationKey: ['update-product-category'],
    mutationFn: ({
      uuid,
      data,
    }: {
      uuid: string;
      data: { name: string; description: string };
    }) => productCategoryApi.update(uuid, data),
    onSuccess: invalidateCategories,
  });

  const deleteCategory = useMutation({
    mutationKey: ['delete-product-category'],
    mutationFn: (uuid: string) => productCategoryApi.delete(uuid),
    onSuccess: invalidateCategories,
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<{ name: string; description: string }>({
    defaultValues: { name: '', description: '' },
  });

  const handleOpenModal = () => {
    setEditMode(false);
    setEditId(null);
    reset();
    setModalOpen(true);
  };

  const handleEdit = (row: {
    uuid: string;
    name: string;
    description: string;
  }) => {
    setEditMode(true);
    setEditId(row.uuid);
    setValue('name', row.name);
    setValue('description', row.description);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteCategory.mutateAsync(deleteId);
        setDeleteId(null);
        toast.success('Category deleted!');
      } catch {
        toast.error('Failed to delete category');
      }
    }
  };

  const onSubmit = async (form: { name: string; description: string }) => {
    try {
      await productCategorySchema.validate(form, { abortEarly: false });
      if (editMode && editId) {
        await updateCategory.mutateAsync({ uuid: editId, data: form });
        setModalOpen(false);
        setEditMode(false);
        setEditId(null);
        reset();
        toast.success('Category updated!');
        return;
      }
      createCategory.mutate(form, {
        onSuccess: () => {
          setModalOpen(false);
          reset();
          toast.success('Category created!');
        },
        onError: (err: any) => {
          // Set error on the form (show as toast or set error state if needed)
        },
      });
    } catch (err: any) {
      // Set error on the form (show as toast or set error state if needed)
    }
  };

  return {
    modalOpen,
    setModalOpen,
    openPopover,
    setOpenPopover,
    editMode,
    setEditMode,
    editId,
    setEditId,
    deleteId,
    setDeleteId,
    data,
    isLoading,
    tableProps,
    register,
    handleSubmit,
    setValue,
    reset,
    errors,
    handleOpenModal,
    handleEdit,
    handleDelete,
    onSubmit,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
