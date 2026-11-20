import { useMutation } from '@tanstack/react-query';
import axios from 'axios';


interface CreditNoteData {
  customerId: string;
  issueDate: string;
  creditAmount: number;
  reason: string;
  invoiceId: string;
  salesPersonId: string;
  notes: string;
}

export default function useCreateCreditNote() {
  return useMutation({
    mutationFn: async (data: CreditNoteData) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/credit-note/create`, data);
      return response.data;
    },
  });
}