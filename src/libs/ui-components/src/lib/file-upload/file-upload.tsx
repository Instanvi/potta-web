import Image from "next/image";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  files: File[]
  setFiles: (arg: File[]) => void
}

const FileUpload: React.FC<Props> = ({ files, setFiles }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles([...files, ...acceptedFiles]);
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="w-full mt-5 drop border-dashed border-2 h-[20vh]">
      <div
        className=" w-full h-[8vh]  mt-3  flex justify-center items-center rounded"
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <div className="flex justify-center">
          <div className="text-center mt-14">
            <center>
              <img src="/icons/dropzone.svg" height={16} width={16} alt="" />
            </center>
            <br />
            <p className="text-green-400 -mt-1">Max (50px 50px)</p>
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>or Drag and Drop here</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
