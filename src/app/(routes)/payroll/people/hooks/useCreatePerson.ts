import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BaseInfoPayload, AddressPayload } from '../utils/types';
import { toast } from 'react-hot-toast';
import { peopleApi } from '../utils/api';

const useCreatePerson = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['create-person'],
    mutationFn: (data: BaseInfoPayload & AddressPayload) => peopleApi.createPerson(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['get-all-people'] });
      toast.success('Person created successfully');
      return data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create person');
      throw error;
    }
  });
};

export default useCreatePerson;