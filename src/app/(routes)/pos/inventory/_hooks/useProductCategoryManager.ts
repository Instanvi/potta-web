import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { productCategoryApi } from '../_utils/api';
import useGetAllProductCategories from './useGetAllProductCategories';
import useCreateProductCategory from './useCreateProductCategory';
import { productCategorySchema } from '../_utils/validation';

export function useProductCategoryManager() {
  const [modalOpen, setModalOpen] = useState(false);
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data, isLoading } = useGetAllProductCategories();
  const createCategory = useCreateProductCategory();
  const queryClient = useQueryClient();

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
      await productCategoryApi.delete(deleteId);
      setDeleteId(null);
      toast.success('Category deleted!');
      queryClient.invalidateQueries({ queryKey: ['get-all-product-category'] });
    }
  };

  const onSubmit = async (form: { name: string; description: string }) => {
    try {
      await productCategorySchema.validate(form, { abortEarly: false });
      if (editMode && editId) {
        await productCategoryApi.update(editId, form);
        setModalOpen(false);
        setEditMode(false);
        setEditId(null);
        reset();
        toast.success('Category updated!');
        queryClient.invalidateQueries({
          queryKey: ['get-all-product-category'],
        });
        return;
      }
      createCategory.mutate(form, {
        onSuccess: () => {
          setModalOpen(false);
          reset();
          toast.success('Category created!');
          queryClient.invalidateQueries({
            queryKey: ['get-all-product-category'],
          });
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
  };
}
