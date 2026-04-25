import { Skeleton } from './shadcn/skeleton';

// Folder skeleton: wide rectangle with a tab
const FolderIconSkeleton = () => (
  <div className="relative w-20 h-14 mb-2 flex items-end justify-center">
    {/* Folder body */}
    <Skeleton className="absolute left-0 bottom-0 w-20 h-10 rounded-b-md bg-gradient-to-br from-gray-200 to-gray-300 shadow-sm" />
    {/* Folder tab */}
    <Skeleton className="absolute left-2 top-0 w-8 h-3 rounded-t bg-gradient-to-br from-gray-100 to-gray-300 shadow-sm" />
  </div>
);

// File skeleton: vertical rectangle with a folded corner
const FileIconSkeleton = () => (
  <div className="relative w-16 h-20 mb-2 flex items-end justify-center">
    {/* File body */}
    <Skeleton className="w-16 h-20 rounded bg-gradient-to-br from-gray-200 to-gray-300 shadow-sm" />
    {/* Folded corner (triangle) */}
    <div className="absolute right-0 top-0 w-5 h-5 overflow-hidden">
      <div
        className="w-4 h-4 bg-gradient-to-br from-gray-100 to-gray-300 rotate-45 origin-bottom-left"
        style={{ marginLeft: '8px', marginTop: '-2px' }}
      />
    </div>
  </div>
);

const FileManagerSkeleton: React.FC = () => {
  return (
    <div className="px-4">
      {/* Folders Skeleton */}
      <div className="grid grid-cols-6 gap-8 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="w-full h-36 flex flex-col justify-center items-center border  "
          >
            <FolderIconSkeleton />
          </div>
        ))}
      </div>
      {/* Files Skeleton */}
      <div className="grid grid-cols-6 gap-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="w-full h-36 flex flex-col justify-center items-center border   "
          >
            <FileIconSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileManagerSkeleton;
