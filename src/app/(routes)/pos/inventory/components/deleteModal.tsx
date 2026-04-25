import Button from '@potta/components/button';
import Modal from '@potta/components/modal';
import { useState } from 'react';

import toast from 'react-hot-toast';
import useDeleteProduct from '../_hooks/useDeleteProduct';
interface DeleteProps {
  productID: string;
  open?: boolean; // Optional controlled open state
  setOpen?: (open: boolean) => void; // Optional setter from parent
}

const DeleteModal: React.FC<DeleteProps> = ({
  productID,
  open: controlledOpen,
  setOpen: setControlledOpen,
}) => {
  const mutation = useDeleteProduct();

  // Local state as fallback if no controlled state is provided
  const [localOpen, setLocalOpen] = useState(false);

  // Determine which open state to use
  const isOpen = controlledOpen ?? localOpen;
  const setIsOpen = setControlledOpen ?? setLocalOpen;
  const handleDelete = () => {
    mutation.mutate(productID, {
      onSuccess: () => {
        setIsOpen(false);
        toast.success('product deleted successfully!');
      },
      onError: (error) => {
        console.log(error);
        setIsOpen(false);
        toast.error('Failed to delete product please try again later');
      },
    });
  };

  return (
    <Modal
      button={false}
      title="Delete product"
      width="full"
      open={isOpen}
      setOpen={setIsOpen}
    >
      <div className="p-4 rounded-none !rounded-none">
        <div>
          <p>Are you sure you want to delete this product?</p>
        </div>
        <div className="text-center md:text-right mt-4 md:flex md:justify-end space-x-4">
          <Button
            onClick={() => {
              handleDelete();
            }}
            isLoading={mutation.isPending}
            type="button"
            text={'Delete'}
            theme="red"
          />
          <Button
            text="Cancel"
            type="button"
            theme="gray"
            color={true}
            onClick={() => setIsOpen(false)}
          />
        </div>
      </div>
    </Modal>
  );
};
export default DeleteModal;
