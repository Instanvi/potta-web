'use client';
import { useRouter } from 'next/navigation';
import Slider from '@potta/components/slideover';
import BillForm from '../new/components/BillForm';

/** "New bill" in the same half-screen slide-over as the other create forms. */
const NewBillSheet = ({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) => {
  const router = useRouter();
  return (
    <Slider open={open} setOpen={setOpen} edit={false} title="New bill">
      {open && (
        <BillForm
          variant="sheet"
          onDone={(billId) => {
            setOpen(false);
            if (billId) router.replace(`/account_payables/bills?id=${billId}`);
          }}
        />
      )}
    </Slider>
  );
};

export default NewBillSheet;
