import axios from 'config/axios.config';

// Fetch all files/folders
export async function getFiles() {
  const response = await axios.get('/documents'); // Adjust endpoint as needed
  return response.data;
}

// Fetch recent uploads
export async function getRecentUploads(
  userId = 'f7b1b3b0-0b1b-4b3b-8b1b-0b1b3b0b1b3e'
) {
  const response = await axios.get(`/documents/recent/uploads/${userId}`);
  return response.data;
}

// Upload a file (FormData) to a folder
export async function uploadFile(
  formData: FormData,
  folderId?: string,
  type: string = 'generic'
) {
  formData.append('userId', 'f7b1b3b0-0b1b-4b3b-8b1b-0b1b3b0b1b3e');
  formData.append('type', type);
  if (folderId) formData.append('folderId', folderId);
  const response = await axios.post('/documents/upload', formData);
  return response.data;
}

// Get a signed URL to view/download a file
export async function getSignedFileUrl(id: string) {
  const response = await axios.get(`/documents/${id}/download`);
  return response.data.url;
}

// Bulk download: get signed URLs for multiple documents
export async function bulkDownloadDocuments(ids: string[]) {
  const response = await axios.post('/documents/bulk-download', { ids });
  return response.data.urls;
}

// Create a folder
export async function createFolder({
  name,
  parentId,
  userId,
}: {
  name: string;
  parentId?: string;
  userId: string;
}) {
  const response = await axios.post('/documents/folder', {
    name,
    parentId,
    userId,
  });
  return response.data;
}

// Delete a file
export async function deleteFile(id: string, userId: string) {
  const response = await axios.delete(`/documents/${id}`, { data: { userId } });
  return response.data;
}

// Delete a folder (and all its contents)
export async function deleteFolder(id: string) {
  const response = await axios.delete(`/documents/folder/${id}`);
  return response.data;
}

// Rename or move a file/folder
export async function renameOrMove(
  id: string,
  data: { name?: string; parentId?: string; userId: string }
) {
  const response = await axios.patch(`/documents/${id}`, data);
  return response.data;
}

// Upload a generic document
export async function uploadDocument(formData: FormData) {
  const response = await axios.post('/documents/upload', formData);
  return response.data;
}

// Upload a document for a product
export async function uploadProductDocument(
  productId: string,
  formData: FormData
) {
  const response = await axios.post(`/documents/upload/${productId}`, formData);
  return response.data;
}

// List documents for a user
export async function getUserDocuments(userId: string) {
  const response = await axios.get('/documents/my', { params: { userId } });
  return response.data;
}

// Unified delete for file or folder
type DeleteType = 'file' | 'folder';
export async function deleteFileOrFolder(
  id: string,
  type: DeleteType = 'file',
  userId?: string
) {
  if (type === 'folder') {
    return deleteFolder(id);
  }
  // Use a default userId if not provided (for demo)
  return deleteFile(id, userId || 'demo-user');
}

// Unified rename for file or folder
export async function renameFileOrFolder(
  id: string,
  name: string,
  userId?: string
) {
  // Use a default userId if not provided (for demo)
  return renameOrMove(id, { name, userId: userId || 'demo-user' });
}

// Simple create folder (name only, always use the provided userId, and parentId if provided)
export async function createFolderSimple(name: string, parentId?: string) {
  return createFolder({
    name,
    parentId,
    userId: 'f7b1b3b0-0b1b-4b3b-8b1b-0b1b3b0b1b3e',
  });
}

// Get folder details, including its files and subfolders
export async function getFolderDetails(id: string) {
  const response = await axios.get(`/documents/folder/${id}`);
  return response.data;
}

// Bulk upload files (array of files)
export async function bulkUploadFiles(
  files: File[],
  folderId?: string,
  type: string = 'generic'
) {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  formData.append('userId', 'f7b1b3b0-0b1b-4b3b-8b1b-0b1b3b0b1b3e');
  formData.append('type', type);
  if (folderId) formData.append('folderId', folderId);
  const response = await axios.post('/documents/upload/bulk', formData);
  return response.data;
}
