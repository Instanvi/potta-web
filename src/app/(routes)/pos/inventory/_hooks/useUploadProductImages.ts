import { useMutation } from '@tanstack/react-query';
import { uploadProductImages } from '../_utils/uploadApi';

export function useUploadProductImages() {
  return useMutation({
    mutationFn: uploadProductImages,
  });
}
