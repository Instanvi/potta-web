import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  files: File[];
  setFiles: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  label?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  files,
  setFiles,
  maxFiles = 5,
  maxSizeMB = 5,
  label,
}) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles([...files, ...acceptedFiles]);
    },
    [files, setFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxFiles,
    maxSize: maxSizeMB * 1024 * 1024,
  });

  useEffect(() => {
    // Generate previews for new files
    const objectUrls = files.map((file) => URL.createObjectURL(file));
    setPreviews(objectUrls);
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  return (
    <div className="w-full mt-2">
      {label && <div className="mb-2 font-medium text-gray-900">{label}</div>}
      <div className="border-dashed border-2  bg-gray-50 min-h-[120px]">
        <div
          className="w-full h-full flex flex-col justify-center items-center rounded cursor-pointer py-4"
          {...getRootProps()}
        >
          <input {...getInputProps()} ref={fileInputRef} />
          {previews.length > 0 ? (
            <div className="flex flex-wrap gap-4 justify-center items-center w-full p-2">
              {previews.map((src, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={src}
                    alt={`Preview ${idx + 1}`}
                    className="h-20 w-20 object-cover rounded border"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <img
                src="/icons/dropzone.svg"
                className="h-12 w-12 mb-2"
                alt="Upload"
              />
              <p className="text-green-400 text-sm">
                Max {maxSizeMB}MB each, up to {maxFiles} files
              </p>
              {isDragActive ? (
                <p>Drop the files here ...</p>
              ) : (
                <p>Click or drag files to upload</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
