'use client';
import React, { useState, useRef, DragEvent, useContext } from 'react';
import Filter from './components/filter';
import CardFile from './components/cardFiles';
import RecentUpload from './components/recentUpload';
import Slideover from '@potta/components/slideover';
import Button from '@potta/components/button';
import RootLayout from '../layout';

import { uploadFile, createFolderSimple, bulkUploadFiles } from './utils/api';
import Select from '@potta/components/select';
import { ContextData } from '@potta/components/providers/DataProvider';

const Files = () => {
  const context = useContext(ContextData);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [refreshFiles, setRefreshFiles] = useState(0);
  const [groupBy, setGroupBy] = useState('All Time');
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderStack, setFolderStack] = useState<
    { id: string; name: string }[]
  >([]);
  const [currentFolderName, setCurrentFolderName] =
    useState<string>('All Files');
  const [uploadType, setUploadType] = useState('MANUAL');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleGroupByChange = (value: string) => setGroupBy(value);
  const handleViewTypeChange = (type: 'grid' | 'list') => setViewType(type);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadError(null);
    setUploading(true);
    if (bulkMode) {
      if (!selectedFiles.length) {
        setUploadError('Please select files');
        setUploading(false);
        return;
      }
      try {
        await bulkUploadFiles(
          selectedFiles,
          currentFolderId || undefined,
          uploadType
        );
        setUploadOpen(false);
        setSelectedFiles([]);
        setBulkMode(false);
        setRefreshFiles((r) => r + 1);
      } catch (err: any) {
        setUploadError('Bulk upload failed');
      } finally {
        setUploading(false);
      }
      return;
    }
    // single upload
    const fileInput = fileInputRef.current;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      setUploadError('Please select a file');
      setUploading(false);
      return;
    }
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    try {
      await uploadFile(formData, currentFolderId || undefined, uploadType);
      setUploadOpen(false);
      setRefreshFiles((r) => r + 1); // trigger CardFile refresh
    } catch (err: any) {
      setUploadError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleEnterFolder = (id: string, name: string) => {
    setFolderStack((stack) => [
      ...stack,
      { id: currentFolderId || '', name: currentFolderName },
    ]);
    setCurrentFolderId(id);
    setCurrentFolderName(name);
  };

  const handleBack = () => {
    setFolderStack((stack) => {
      const newStack = [...stack];
      const prev = newStack.pop();
      setCurrentFolderId(prev?.id || '');
      setCurrentFolderName(prev?.name || 'All Files');
      return newStack;
    });
  };

  const uploadTypeOptions = [
    { value: 'MANUAL', label: 'Manual' },
    { value: 'SPEC_SHEET', label: 'Spec Sheet' },
    { value: 'CERT', label: 'Certificate' },
    { value: 'PRODUCT_IMAGE', label: 'Product Image' },
  ];

  const handleRemoveFile = (name: string) => {
    setSelectedFiles((files) => files.filter((f) => f.name !== name));
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  return (
    <RootLayout>
      <div
        className={`${
          context?.layoutMode === 'sidebar' ? 'pl-8' : 'pl-2'
        } pr-6 flex w-full mt-5`}
      >
        <div className="w-[80%]">
          <div className="flex justify-between items-center mb-4 px-4">
            <Filter
              groupBy={groupBy}
              onGroupByChange={handleGroupByChange}
              viewType={viewType}
              onViewTypeChange={handleViewTypeChange}
              onNewFolderClick={() => setCreatingFolder(true)}
              currentFolderName={currentFolderName}
              onBack={folderStack.length > 0 ? handleBack : undefined}
            />
            <Button
              text={'Upload'}
              type="button"
              onClick={() => setUploadOpen(true)}
            />
          </div>
          <div className="mt-5">
            <CardFile
              refresh={refreshFiles}
              groupBy={groupBy}
              viewType={viewType}
              creatingFolder={creatingFolder}
              setCreatingFolder={setCreatingFolder}
              currentFolderId={currentFolderId}
              onEnterFolder={handleEnterFolder}
              onUploadClick={() => setUploadOpen(true)}
              onCreateFolder={async (name: string) => {
                await createFolderSimple(name, currentFolderId || undefined);
                setRefreshFiles((r) => r + 1);
              }}
            />
          </div>
        </div>
        <div className="w-[20%]">
          <RecentUpload />
        </div>
      </div>
      <Slideover
        title="Upload Files"
        edit={false}
        open={uploadOpen}
        setOpen={(open) => {
          setUploadOpen(open);
          if (!open) {
            setBulkMode(false);
            setSelectedFiles([]);
            setUploadError(null);
            setIsDragActive(false);
          }
        }}
      >
        <div className="max-w-5xl">
          <div className="w-full flex justify-center mt-2 mb-4">
            <div className="flex items-center gap-2 bg-gray-100 rounded px-2 py-1">
              <button
                type="button"
                className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-150 ${
                  !bulkMode ? 'bg-green-600 text-white shadow' : 'text-gray-700'
                }`}
                onClick={() => setBulkMode(false)}
              >
                Single
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-150 ${
                  bulkMode ? 'bg-green-600 text-white shadow' : 'text-gray-700'
                }`}
                onClick={() => setBulkMode(true)}
              >
                Bulk
              </button>
            </div>
          </div>
          <div className=" w-[500px]">
            <div className="w-full">
              <form
                className="w-full   flex flex-col items-center justify-center gap-6"
                onSubmit={handleUpload}
              >
                <div className="w-full">
                  <label className="mb-2 text-gray-900 font-medium block text-base">
                    {bulkMode ? 'Select Files' : 'Select File'}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  {bulkMode ? (
                    <div
                      className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors duration-150 ${
                        isDragActive
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-300 bg-white'
                      }`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() =>
                        document.getElementById('bulk-file-input')?.click()
                      }
                    >
                      <input
                        id="bulk-file-input"
                        type="file"
                        name="files"
                        multiple
                        required={selectedFiles.length === 0}
                        className="hidden"
                        onChange={(e) =>
                          setSelectedFiles(
                            e.target.files ? Array.from(e.target.files) : []
                          )
                        }
                      />
                      <div className="flex flex-col items-center justify-center">
                        <i className="ri-upload-cloud-2-line text-3xl text-green-600 mb-2"></i>
                        <span className="text-gray-700 text-sm mb-1">
                          Drag & drop files here or{' '}
                          <span className="underline text-green-700 cursor-pointer">
                            browse
                          </span>
                        </span>
                        <span className="text-xs text-gray-400">
                          You can select multiple files
                        </span>
                      </div>
                      {selectedFiles.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2 justify-center">
                          {selectedFiles.map((f) => (
                            <div
                              key={f.name}
                              className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-xs shadow border"
                            >
                              <span
                                className="mr-2 truncate max-w-[120px]"
                                title={f.name}
                              >
                                {f.name}
                              </span>
                              <button
                                type="button"
                                className="ml-1 text-gray-400 hover:text-red-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFile(f.name);
                                }}
                              >
                                <i className="ri-close-line"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      ref={fileInputRef}
                      type="file"
                      name="file"
                      required
                      className="w-full py-2.5 px-4 border border-gray-200 rounded-[2px] outline-none mt-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  )}
                </div>
                <div className="w-full ">
                  <Select
                    label="Type"
                    options={uploadTypeOptions}
                    selectedValue={uploadType}
                    onChange={setUploadType}
                    bg="bg-white"
                    name="type"
                    required
                  />
                </div>
                {uploadError && (
                  <div className="w-full max-w-xs">
                    <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm text-center">
                      {uploadError}
                    </div>
                  </div>
                )}
                <Button
                  type="submit"
                  text={
                    uploading
                      ? bulkMode
                        ? 'Uploading Files...'
                        : 'Uploading...'
                      : bulkMode
                      ? 'Upload Files'
                      : 'Upload'
                  }
                  isLoading={uploading}
                  width="full"
                  className="mt-2 w-fit"
                  disabled={uploading}
                />
              </form>
            </div>
          </div>
        </div>
      </Slideover>
    </RootLayout>
  );
};
export default Files;
