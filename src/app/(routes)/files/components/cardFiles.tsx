'use client';
import React, { useEffect, useState } from 'react';
import {
  getFiles,
  bulkDownloadDocuments,
  deleteFileOrFolder,
  renameFileOrFolder,
  createFolderSimple,
  getFolderDetails,
} from '../utils/api';
import Button from '@potta/components/button';
import { Skeleton } from '@potta/components/shadcn/skeleton';
import CustomLoader from '@potta/components/loader';
import FileManagerSkeleton from '@potta/components/file-manager-skeleton';
import Input from '@potta/components/input';

interface CardFileProps {
  refresh?: number;
  groupBy?: string;
  viewType?: 'grid' | 'list';
  creatingFolder?: boolean;
  setCreatingFolder?: (v: boolean) => void;
  currentFolderId?: string | null;
  onEnterFolder?: (id: string, name: string) => void;
  onUploadClick?: () => void;
  onCreateFolder?: (name: string) => Promise<void>;
}

const CardFile: React.FC<CardFileProps> = ({
  refresh,
  groupBy,
  viewType = 'grid',
  creatingFolder = false,
  setCreatingFolder,
  currentFolderId = null,
  onEnterFolder,
  onUploadClick,
  onCreateFolder,
}) => {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [signedUrls, setSignedUrls] = useState<{ [uuid: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [urlLoading, setUrlLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'file' | 'folder' | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        if (currentFolderId) {
          const details = await getFolderDetails(currentFolderId);
          setFolders(details.childFolders || []);
          setFiles(details.files || []);
        } else {
          const data = await getFiles();
          setFiles(data.files || []);
          setFolders(data.folders || []);
        }
      } catch (err: any) {
        setError('Failed to load files');
        console.error('Fetch files error', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [refresh, refreshKey, currentFolderId]);

  useEffect(() => {
    async function fetchBulkSignedUrls() {
      if (!files.length) return;
      setUrlLoading(true);
      try {
        const ids = files.map((file: any) => file.uuid);
        const urls: string[] = await bulkDownloadDocuments(ids);
        const urlMap: { [uuid: string]: string } = {};
        files.forEach((file: any, idx: number) => {
          urlMap[file.uuid] = urls[idx] || '';
        });
        setSignedUrls(urlMap);
      } catch (err) {
        setSignedUrls({});
        console.error('Bulk signing error', err);
      } finally {
        setUrlLoading(false);
      }
    }
    fetchBulkSignedUrls();
  }, [files]);

  const handleDelete = async (id: string, type: 'file' | 'folder') => {
    setActionLoading(true);
    try {
      await deleteFileOrFolder(id, type);
      setRefreshKey((k) => k + 1);
    } catch {
      alert('Delete failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRename = (id: string, currentName: string) => {
    setRenamingId(id);
    setRenameValue(currentName);
  };

  const handleRenameSubmit = async (id: string) => {
    setActionLoading(true);
    try {
      await renameFileOrFolder(id, renameValue);
      setRenamingId(null);
      setRenameValue('');
      setRefreshKey((k) => k + 1);
    } catch {
      alert('Rename failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = (id: string, type: 'file' | 'folder') => {
    setDeleteId(id);
    setDeleteType(type);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId || !deleteType) return;
    setActionLoading(true);
    try {
      await deleteFileOrFolder(deleteId, deleteType);
      setDeleteId(null);
      setDeleteType(null);
      setRefreshKey((k) => k + 1);
    } catch {
      alert('Delete failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteId(null);
    setDeleteType(null);
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName) return;
    setActionLoading(true);
    try {
      if (onCreateFolder) {
        await onCreateFolder(newFolderName);
      }
      setNewFolderName('');
      setCreatingFolder && setCreatingFolder(false);
      setRefreshKey((k) => k + 1);
    } catch {
      alert('Create folder failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelect = (id: string) => {
    setSelected((sel) =>
      sel.includes(id) ? sel.filter((s) => s !== id) : [...sel, id]
    );
  };

  const handleBulkDownload = async () => {
    if (!selected.length) return;
    setActionLoading(true);
    try {
      const urls: string[] = await bulkDownloadDocuments(selected);
      urls.forEach((url) => window.open(url, '_blank'));
    } catch {
      alert('Bulk download failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFolderDoubleClick = async (folder: any) => {
    if (onEnterFolder) {
      onEnterFolder(folder.uuid || folder.id, folder.name);
    }
  };

  // Filtering logic
  const filteredFiles = files.filter((file: any) => {
    let pass = true;
    if (groupBy && groupBy !== 'All Time') {
      // Example: filter by yesterday
      if (groupBy === 'Yesterday') {
        const fileDate = file.uploadedAt ? new Date(file.uploadedAt) : null;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        pass =
          pass &&
          fileDate &&
          fileDate.toDateString() === yesterday.toDateString();
      }
    }
    return pass;
  });
  const filteredFolders = folders; // Add folder filtering if needed

  // Helper to check if current folder is empty
  const isEmpty = filteredFiles.length === 0 && filteredFolders.length === 0;

  if (loading || urlLoading) return <FileManagerSkeleton />;
  if (error) return <div className="px-4 text-red-500">{error}</div>;

  if (viewType === 'list') {
    // List view: show folders and files in a single column with details
    return (
      <div className="px-4">
        <div className="w-full border rounded bg-white overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {creatingFolder && (
                <tr>
                  <td className="px-4 py-2">
                    <i className="ri-folder-add-line text-green-600"></i> Folder
                  </td>
                  <td className="px-4 py-2">
                    <form
                      className="flex items-center gap-2"
                      onSubmit={handleCreateFolder}
                    >
                      <Input
                        type="text"
                        name="folder"
                        value={newFolderName}
                        onchange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Folder name"
                        className="!w-fit"
                        inputClass="!mt-0"
                      />
                      <Button
                        type="submit"
                        text={'Create'}
                        disabled={actionLoading}
                      />
                      <button
                        type="button"
                        className="ml-2 text-gray-500"
                        onClick={() =>
                          setCreatingFolder && setCreatingFolder(false)
                        }
                      >
                        Cancel
                      </button>
                    </form>
                  </td>
                  <td></td>
                  <td></td>
                </tr>
              )}
              {filteredFolders.map((folder: any) => (
                <tr
                  key={folder.uuid || folder.id}
                  onDoubleClick={() => handleFolderDoubleClick(folder)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="px-4 py-2">
                    <i className="ri-folder-fill text-yellow-500"></i> Folder
                  </td>
                  <td className="px-4 py-2">
                    {renamingId === (folder.uuid || folder.id) ? (
                      <form
                        className="flex items-center gap-1 bg-white/90 shadow px-2 py-1 rounded-md border"
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleRenameSubmit(folder.uuid || folder.id);
                        }}
                      >
                        <input
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          className="border border-gray-300 rounded-md px-2 py-1 text-xs w-24 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="text-green-600 hover:text-green-800 px-1"
                        >
                          <i className="ri-check-line"></i>
                        </button>
                        <button
                          type="button"
                          className="text-gray-500 hover:text-gray-700 px-1"
                          onClick={() => setRenamingId(null)}
                        >
                          <i className="ri-close-line"></i>
                        </button>
                      </form>
                    ) : (
                      folder.name || 'Folder'
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500">
                    {folder.createdAt
                      ? new Date(folder.createdAt).toLocaleDateString()
                      : ''}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex space-x-2">
                      <div className="bg-black/60 flex items-center p-1 space-x-1">
                        <button
                          onClick={() =>
                            handleRename(folder.uuid || folder.id, folder.name)
                          }
                          title="Rename"
                          className="text-white hover:text-green-400 text-lg"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteClick(
                              folder.uuid || folder.id,
                              'folder'
                            )
                          }
                          title="Delete"
                          className="text-white hover:text-red-400 text-lg"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredFiles.map((file: any) => (
                <tr key={file.uuid}>
                  <td className="px-4 py-2">
                    <i className="ri-file-3-line text-blue-500"></i> File
                  </td>
                  <td className="px-4 py-2">
                    {renamingId === file.uuid ? (
                      <form
                        className="flex items-center gap-1 bg-white/90 shadow px-2 py-1 rounded-md border"
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleRenameSubmit(file.uuid);
                        }}
                      >
                        <input
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          className="border border-gray-300 rounded-md px-2 py-1 text-xs w-24 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="text-green-600 hover:text-green-800 px-1"
                        >
                          <i className="ri-check-line"></i>
                        </button>
                        <button
                          type="button"
                          className="text-gray-500 hover:text-gray-700 px-1"
                          onClick={() => setRenamingId(null)}
                        >
                          <i className="ri-close-line"></i>
                        </button>
                      </form>
                    ) : (
                      file.originalName
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500">
                    {file.uploadedAt
                      ? new Date(file.uploadedAt).toLocaleDateString()
                      : ''}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex space-x-2">
                      <div className="bg-black/60 rounded-md flex items-center p-1 space-x-1">
                        <button
                          onClick={() =>
                            handleRename(file.uuid, file.originalName)
                          }
                          title="Rename"
                          className="text-white hover:text-green-400 text-lg"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(file.uuid, 'file')}
                          title="Delete"
                          className="text-white hover:text-red-400 text-lg"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isEmpty && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-400 mb-4">This folder is empty.</p>
            <Button
              type="button"
              text={'Upload Files'}
              onClick={onUploadClick}
            />
          </div>
        )}
        {!!deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white  p-6 w-80">
              <h3 className="text-lg font-medium mb-2 text-red-600">
                Delete {deleteType === 'folder' ? 'Folder' : 'File'}?
              </h3>
              <p className="mb-4">
                Are you sure you want to delete this {deleteType}? This action
                cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-1  bg-gray-200"
                  onClick={handleDeleteCancel}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-1  bg-red-600 text-white"
                  onClick={handleDeleteConfirm}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default: grid view
  return (
    <div className="px-4">
      <div className="flex mb-4 items-center  space-x-2">
        {/* New Folder button moved to Filter */}
      </div>
      {viewType === 'grid' && creatingFolder && (
        <form
          className="mb-4 flex items-center space-x-2"
          onSubmit={handleCreateFolder}
        >
          <Input
            type="text"
            name="folder"
            value={newFolderName}
            onchange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            className=" !w-fit"
            inputClass="!mt-0"
          />
          <Button type="submit" text={'Create'} disabled={actionLoading} />
          <button
            type="button"
            className="ml-2 text-gray-500"
            onClick={() => setCreatingFolder && setCreatingFolder(false)}
          >
            Cancel
          </button>
        </form>
      )}
      {/* Folders */}
      {filteredFolders.length > 0 && (
        <div className="grid grid-cols-6 gap-8 mb-8">
          {filteredFolders.map((folder: any) => (
            <div
              key={folder.uuid || folder.id}
              className="group w-full h-36 flex flex-col justify-center relative items-center border"
              onDoubleClick={() => handleFolderDoubleClick(folder)}
              style={{ cursor: 'pointer' }}
            >
              <input
                type="checkbox"
                className="absolute top-2 left-2"
                checked={selected.includes(folder.uuid || folder.id)}
                onChange={() => handleSelect(folder.uuid || folder.id)}
              />
              <img src="/icons/folder.svg" alt="folder" className="-mt-2" />
              {renamingId === (folder.uuid || folder.id) ? (
                <form
                  className="absolute bottom-2 left-1/3 ml-2 flex items-center gap-1 bg-white/90 shadow px-2 py-1 rounded-md border"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRenameSubmit(folder.uuid || folder.id);
                  }}
                >
                  <input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    className="border border-gray-300  px-2 py-1 text-xs w-24 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="text-green-600 hover:text-green-800 px-1"
                  >
                    <i className="ri-check-line"></i>
                  </button>
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 px-1"
                    onClick={() => setRenamingId(null)}
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </form>
              ) : (
                <p className="absolute bottom-2 left-1/3 ml-2">
                  {folder.name.length > 10
                    ? `${folder.name.slice(0, 10)}..`
                    : folder.name || 'Folder'}
                </p>
              )}
              <div className="absolute top-2 right-2 flex space-x-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-black/60 rounded-md flex items-center p-1 space-x-1">
                  <button
                    onClick={() =>
                      handleRename(folder.uuid || folder.id, folder.name)
                    }
                    title="Rename"
                    className="text-white hover:text-green-400 text-lg"
                  >
                    <i className="ri-edit-line"></i>
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteClick(folder.uuid || folder.id, 'folder')
                    }
                    title="Delete"
                    className="text-white hover:text-red-400 text-lg"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-400 mb-4">This folder is empty.</p>
          <Button type="button" text={'Upload Files'} onClick={onUploadClick} />
        </div>
      )}
      {/* Files */}
      <div className="grid grid-cols-6 gap-8">
        {filteredFiles.map((file: any) => (
          <div
            key={file.uuid}
            className="group w-full h-36 flex flex-col justify-center relative items-center border"
          >
            <input
              type="checkbox"
              className="absolute top-2 left-2"
              checked={selected.includes(file.uuid)}
              onChange={() => handleSelect(file.uuid)}
            />
            {file.mimeType &&
            file.mimeType.startsWith('image') &&
            signedUrls[file.uuid] ? (
              <img
                src={signedUrls[file.uuid]}
                alt={file.originalName}
                className="-mt-2 h-24 w-auto object-contain"
              />
            ) : (
              <img
                src="/icons/File.svg"
                alt="file"
                className="-mt-2 h-24 w-auto object-contain"
              />
            )}
            <div className="absolute bottom-2 left-1/3 ml-2 text-xs truncate w-24">
              {renamingId === file.uuid ? (
                <form
                  className="flex items-center gap-1 bg-white/90 shadow px-2 py-1 rounded-md border"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRenameSubmit(file.uuid);
                  }}
                >
                  <input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-xs w-24 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="text-green-600 hover:text-green-800 px-1"
                  >
                    <i className="ri-check-line"></i>
                  </button>
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 px-1"
                    onClick={() => setRenamingId(null)}
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </form>
              ) : (
                file.originalName
              )}
            </div>
            <div className="absolute top-2 right-2 flex space-x-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-black/60 rounded-md flex items-center p-1 space-x-1">
                <button
                  onClick={() => handleRename(file.uuid, file.originalName)}
                  title="Rename"
                  className="text-white hover:text-green-400 text-lg"
                >
                  <i className="ri-edit-line"></i>
                </button>
                <button
                  onClick={() => handleDeleteClick(file.uuid, 'file')}
                  title="Delete"
                  className="text-white hover:text-red-400 text-lg"
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Delete confirmation modal */}
      {!!deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 w-80">
            <h3 className="text-lg font-medium mb-2 text-red-600">
              Delete {deleteType === 'folder' ? 'Folder' : 'File'}?
            </h3>
            <p className="mb-4">
              Are you sure you want to delete this {deleteType}? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-1  bg-gray-200"
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>
              <button
                className="px-4 py-1  bg-red-600 text-white"
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardFile;
