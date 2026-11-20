import Button from "@potta/components/button";
import Modal from "@potta/components/modal";
import { useState } from "react";
import useDeleteVendor from "../hooks/useDeleteVendor";
import toast from "react-hot-toast";

interface DeleteProps {
  vendorID: string;
  open?: boolean;  // Optional controlled open state
  setOpen?: (open: boolean) => void;  // Optional setter from parent
}

const DeleteModal: React.FC<DeleteProps> = ({ vendorID,  open: controlledOpen,
  setOpen: setControlledOpen }) => {
  const mutation = useDeleteVendor();
// Local state as fallback if no controlled state is provided
  const [localOpen, setLocalOpen] = useState(false);

  // Determine which open state to use
  const isOpen = controlledOpen ?? localOpen;
  const setIsOpen = setControlledOpen ?? setLocalOpen;
  const handleDelete = () => {
    mutation.mutate(vendorID, {
      onSuccess: () => {
        setIsOpen(false)
        toast.success("Vendor deleted successfully!");
      }, // Renamed to avoid naming conflict
      onError: (error) => {
        console.log(error);
        setIsOpen(false)
        toast.error("Failed to delete vendor, please try again later.");
      },
    });
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    <Modal button={false} title="Delete Vendor" width="full" open={isOpen} setOpen={setIsOpen}>
      <div className="p-4">
        <p>Are you sure you want to delete this Vendor?</p>
        <div className="text-center md:text-right mt-4 md:flex md:justify-end space-x-4">
          <Button onClick={handleDelete} isLoading={mutation.isPending} type="button" text="Delete" theme="red" />
          <Button text="Cancel" type="button" theme="gray" color={true} onClick={() => setIsOpen(false)} />
        </div>
      </div>
    </Modal>
  );
};


export default DeleteModal;
