// _utils/uploadApi.ts
import axios from 'config/axios.config';

export async function uploadProductImages({
  productId,
  files,
  userId,
  type = 'PRODUCT_IMAGE',
}: {
  productId: string;
  files: File[];
  userId: string;
  type?: string;
}) {
  if (!files.length) throw new Error('No files provided');
  const formData = new FormData();
  if (files.length === 1) {
    formData.append('file', files[0]);
  } else {
    files.forEach((file) => formData.append('files', file));
  }
  formData.append('userId', userId);
  formData.append('type', type);

  const endpoint =
    files.length === 1
      ? `/documents/upload/${productId}`
      : `/documents/upload/${productId}/bulk`;

  try {
    const res = await axios.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ||
        err?.response?.data ||
        err.message ||
        'Failed to upload image(s)'
    );
  }
}
