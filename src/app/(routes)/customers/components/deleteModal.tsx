import Button from "@potta/components/button";
import Modal from "@potta/components/modal";
import { useState } from "react";
import useDeleteCustomer from "../hooks/useDeleteCustomer";
import toast from "react-hot-toast";

interface DeleteProps {
  customerID: string;
  open?: boolean;  // Optional controlled open state
  setOpen?: (open: boolean) => void;  // Optional setter from parent
}

const DeleteModal: React.FC<DeleteProps> = ({ customerID,  open: controlledOpen,
  setOpen: setControlledOpen }) => {
  const mutation = useDeleteCustomer();
// Local state as fallback if no controlled state is provided
  const [localOpen, setLocalOpen] = useState(false);

  // Determine which open state to use
  const isOpen = controlledOpen ?? localOpen;
  const setIsOpen = setControlledOpen ?? setLocalOpen;
  const handleDelete = () => {
    mutation.mutate(customerID, {
      onSuccess: () => {
        setIsOpen(false)
        toast.success("Customer deleted successfully!");
      }, // Renamed to avoid naming conflict
      onError: (error) => {
        console.log(error);
        setIsOpen(false)
        toast.error("Failed to delete customer, please try again later.");
      },
    });
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    <Modal button={false} title="Delete Customer" width="full" open={isOpen} setOpen={setIsOpen}>
      <div className="p-4">
        <p>Are you sure you want to delete this Customer?</p>
        <div className="text-center md:text-right mt-4 md:flex md:justify-end space-x-4">
          <Button onClick={handleDelete} isLoading={mutation.isPending} type="button" text="Delete" theme="red" />
          <Button text="Cancel" type="button" theme="gray" color={true} onClick={() => setIsOpen(false)} />
        </div>
      </div>
    </Modal>
  );
};


export default DeleteModal;
