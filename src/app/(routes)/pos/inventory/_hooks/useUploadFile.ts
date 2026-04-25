import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { productApi } from '../_utils/api';

interface UploadImageResponse {
  link: string;
  name: string;
  size: number;
  type: string;
  id: string;
}

const useUploadImage = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const uploadMutation = useMutation<UploadImageResponse, Error, File>({
    mutationFn: async (file: File) => {
      return await productApi.uploadImage(file);
    },
    onSuccess: (data) => {
      setUploadProgress(100);
    },
    onError: (error) => {
      setUploadProgress(0);
      console.error('Image upload failed:', error);
    }
  });

  const uploadImage = (file: File) => {
    setUploadProgress(0);
    return uploadMutation.mutate(file);
  };

  const uploadImageAsync = async (file: File) => {
    setUploadProgress(0);
    return await uploadMutation.mutateAsync(file);
  };

  return {
    uploadImage,
    uploadImageAsync,
    uploadProgress,
    isUploading: uploadMutation.isPending,
    isError: uploadMutation.isError,
    error: uploadMutation.error,
    data: uploadMutation.data,
  };
};

export default useUploadImage;