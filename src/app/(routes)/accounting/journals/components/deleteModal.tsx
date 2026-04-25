import Button from '@potta/components/button';
import Modal from '@potta/components/modal';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { journalApi } from '../utils/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface DeleteProps {
  journalID: string;
  open?: boolean; // Optional controlled open state
  setOpen?: (open: boolean) => void; // Optional setter from parent
}

const DeleteModal: React.FC<DeleteProps> = ({
  journalID,
  open: controlledOpen,
  setOpen: setControlledOpen,
}) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Local state as fallback if no controlled state is provided
  const [localOpen, setLocalOpen] = useState(false);

  // Determine which open state to use
  const isOpen = controlledOpen ?? localOpen;
  const setIsOpen = setControlledOpen ?? setLocalOpen;

  const deleteJournal = useMutation({
    mutationFn: (journalId: string) => journalApi.delete(journalId),
    onSuccess: () => {
      toast.success('Journal deleted successfully!');
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['get-all-journals'] });
      router.refresh();
    },
    onError: (error) => {
      console.error('Error deleting journal:', error);
      toast.error('Failed to delete journal, please try again later.');
    },
  });

  const handleDelete = () => {
    deleteJournal.mutate(journalID);
  };

  return (
    <Modal
      button={false}
      title="Delete Journal"
      width="full"
      open={isOpen}
      setOpen={setIsOpen}
    >
      <div className="p-4">
        <p>Are you sure you want to delete this Journal?</p>
        <div className="text-center md:text-right mt-4 md:flex md:justify-end space-x-4">
          <Button
            onClick={handleDelete}
            isLoading={deleteJournal.isPending}
            type="button"
            text="Delete"
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
