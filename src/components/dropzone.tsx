'use client'
import React, { useCallback, useContext } from "react";
import { useDropzone } from "react-dropzone";


interface MyDropzoneProps { }

const MyDropzone: React.FC<MyDropzoneProps> = () => {


    const [files, setFiles] = React.useState<File[]>([]);
    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles([...files, ...acceptedFiles]);
    }, []);

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
                        <center><img src="/icons/dropzone.svg" className="h-16 w-16" alt="" /></center><br />
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

export default MyDropzone;