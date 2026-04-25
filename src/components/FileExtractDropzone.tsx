import React, {
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useRef,
} from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface FileExtractDropzoneProps {
  onExtract: (file: File) => Promise<void>;
  extracting: boolean;
  children: ReactNode;
  onDummyExtract?: () => void;
}

const FileExtractDropzone: React.FC<FileExtractDropzoneProps> = ({
  onExtract,
  extracting,
  children,
  onDummyExtract,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const dragLeaveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Global drag and drop handlers with drag counter and debounce
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragCounter((prev) => prev + 1);
    if (dragLeaveTimeout.current) {
      clearTimeout(dragLeaveTimeout.current);
      dragLeaveTimeout.current = null;
    }
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragCounter((prev) => {
      const newCount = prev - 1;
      if (newCount <= 0) {
        // Debounce hiding the overlay to prevent flicker
        if (dragLeaveTimeout.current) clearTimeout(dragLeaveTimeout.current);
        dragLeaveTimeout.current = setTimeout(() => {
          setDragActive(false);
          setDragCounter(0);
        }, 100);
      }
      return newCount;
    });
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragCounter(0);
      setDragActive(false);
      if (dragLeaveTimeout.current) {
        clearTimeout(dragLeaveTimeout.current);
        dragLeaveTimeout.current = null;
      }
      if (
        e.dataTransfer &&
        e.dataTransfer.files &&
        e.dataTransfer.files.length > 0
      ) {
        if (onDummyExtract) onDummyExtract();
        onExtract(e.dataTransfer.files[0]);
      }
    },
    [onExtract, onDummyExtract]
  );

  useEffect(() => {
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
      if (dragLeaveTimeout.current) clearTimeout(dragLeaveTimeout.current);
    };
  }, [handleDragOver, handleDragLeave, handleDrop]);

  return (
    <div className="relative">
      <div
        className={
          dragActive
            ? 'pointer-events-none filter blur-sm transition-all duration-300 ease-in-out'
            : 'transition-all duration-300 ease-in-out'
        }
      >
        {children}
      </div>
    </div>
  );
};

export default FileExtractDropzone;
