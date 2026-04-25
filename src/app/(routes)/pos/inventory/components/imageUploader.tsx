'use client';
import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Controller, Control } from 'react-hook-form';

interface ImageUploaderProps {
  control?: Control<any>;
  name?: string;
  accept?: { [key: string]: string[] };
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  onFilesChange?: (files: File[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  control,
  name = 'files',
  accept = { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] },
  maxSize = 5242880, // 5MB
  maxFiles = 10,
  multiple = true,
  onFilesChange,
}) => {
  const [previews, setPreviews] = useState<string[]>([]);

  // Standalone drop handler
  const onDropStandalone = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const objectUrls = acceptedFiles.map((file) =>
          URL.createObjectURL(file)
        );
        setPreviews(objectUrls);
        if (onFilesChange) onFilesChange(acceptedFiles);
      }
    },
    [onFilesChange]
  );

  useEffect(() => {
    return () => {
      setPreviews([]);
    };
  }, []);

  if (control) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => {
          const onDrop = useCallback(
            (acceptedFiles: File[]) => {
              if (acceptedFiles.length > 0) {
                const objectUrls = acceptedFiles.map((file) =>
                  URL.createObjectURL(file)
                );
                setPreviews(objectUrls);
                onChange(objectUrls.map((url) => `__file__:${url}`));
                if (onFilesChange) onFilesChange(acceptedFiles);
              }
            },
            [onChange, onFilesChange]
          );

          const { getRootProps, getInputProps, isDragActive } = useDropzone({
            onDrop,
            accept,
            maxSize,
            maxFiles,
            multiple,
          });

          useEffect(() => {
            return () => {
              previews.forEach((url) => URL.revokeObjectURL(url));
            };
          }, [previews]);

          return (
            <div className="w-full mt-5 drop border-dashed border-2 min-h-[20vh] relative">
              <div
                className="w-full h-full flex flex-col justify-center items-center rounded cursor-pointer"
                {...getRootProps()}
              >
                <input {...getInputProps()} />
                {previews.length > 0 ? (
                  <div className="flex flex-wrap gap-4 justify-center items-center w-full p-2">
                    {previews.map((src, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={src}
                          alt={`Preview ${idx + 1}`}
                          className="h-24 w-24 object-cover rounded border"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <div className="text-center">
                      <center>
                        <img
                          src="/icons/dropzone.svg"
                          className="h-16 w-16"
                          alt=""
                        />
                      </center>
                      <br />
                      <p className="text-green-400 -mt-1">
                        Max {maxSize / 1024 / 1024}MB each, up to {maxFiles}{' '}
                        files
                      </p>
                      {isDragActive ? (
                        <p>Drop the files here ...</p>
                      ) : (
                        <p>or Drag and Drop here</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        }}
      />
    );
  }

  // Standalone mode (no control)
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropStandalone,
    accept,
    maxSize,
    maxFiles,
    multiple,
  });

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  return (
    <div className="w-full mt-5 drop border-dashed border-2 min-h-[20vh] relative">
      <div
        className="w-full h-full flex flex-col justify-center items-center rounded cursor-pointer"
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        {previews.length > 0 ? (
          <div className="flex flex-wrap gap-4 justify-center items-center w-full p-2">
            {previews.map((src, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={src}
                  alt={`Preview ${idx + 1}`}
                  className="h-24 w-24 object-cover rounded border"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="text-center">
              <center>
                <img src="/icons/dropzone.svg" className="h-16 w-16" alt="" />
              </center>
              <br />
              <p className="text-green-400 -mt-1">
                Max {maxSize / 1024 / 1024}MB each, up to {maxFiles} files
              </p>
              {isDragActive ? (
                <p>Drop the files here ...</p>
              ) : (
                <p>or Drag and Drop here</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
