import { useMutation } from '@tanstack/react-query';
import { createBill } from '../../utils/api';

export default function useCreateBill() {
  return useMutation({
    mutationFn: createBill,
  });
}
