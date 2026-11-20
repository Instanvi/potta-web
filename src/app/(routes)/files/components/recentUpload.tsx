import React, { useEffect, useState } from 'react';
import { getRecentUploads, getSignedFileUrl } from '../utils/api';
import { Skeleton } from '@potta/components/shadcn/skeleton';

const RecentUploadSkeleton = () => (
  <div>
    <h3 className="mb-2">Recent Uploads</h3>
    <div className="h-full mt-5 relative border-l pl-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="mb-8 flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded bg-gradient-to-br from-gray-200 to-gray-300" />
          <div className="flex-1">
            <Skeleton className="w-24 h-4 mb-2 bg-gradient-to-br from-gray-200 to-gray-300" />
            <Skeleton className="w-16 h-3 bg-gradient-to-br from-gray-200 to-gray-300" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const RecentUpload = () => {
  const [uploads, setUploads] = useState<any[]>([]);
  const [urls, setUrls] = useState<{ [id: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUploads() {
      setLoading(true);
      setError(null);
      try {
        const data = await getRecentUploads();
        setUploads(data.files || []);
        // Fetch signed URLs for images
        const urlMap: { [id: string]: string } = {};
        await Promise.all(
          (data.files || []).map(async (file: any) => {
            if (file.mimeType && file.mimeType.startsWith('image')) {
              urlMap[file.uuid] = await getSignedFileUrl(file.uuid);
            }
          })
        );
        setUrls(urlMap);
      } catch {
        setError('Failed to load recent uploads');
      } finally {
        setLoading(false);
      }
    }
    fetchUploads();
  }, []);

  if (loading) return <RecentUploadSkeleton />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h3>Recent Uploads</h3>
      <div className="h-full mt-5 relative border-l pl-5">
        {uploads.length === 0 && <div>No recent uploads</div>}
        {uploads.map((file) => (
          <div key={file.uuid} className="mb-6 flex items-center space-x-3">
            {file.mimeType &&
            file.mimeType.startsWith('image') &&
            urls[file.uuid] ? (
              <img
                src={urls[file.uuid]}
                alt={file.originalName}
                className="h-10 w-10 object-cover rounded"
              />
            ) : (
              <img
                src="/icons/File.svg"
                alt="file"
                className="h-10 w-10 object-contain"
              />
            )}
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">
                {file.uploadedAt
                  ? new Date(file.uploadedAt).toLocaleString()
                  : ''}
              </div>
              <span className="truncate text-xs" title={file.originalName}>
                {file.originalName.slice(0, 20)}..
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentUpload;
