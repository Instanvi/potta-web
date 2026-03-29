'use client';
import React, { useState, useCallback, useEffect } from 'react';
import RootLayout from '../../layout';
import Search from '@potta/components/search';
import SliderSchedule from './components/sliderSchedule';
import { useFetchPTOPolicies } from './hooks/useFetchPTOPolicies';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PTODetailSlider from './components/PTODetailSlider';
import PTOCard from './components/PTOCard';
import PottaLoader from '@potta/components/pottaloader';
import { useContext } from 'react';
import { ContextData } from '@potta/components/providers/DataProvider';

// Create a client
const queryClient = new QueryClient();

const PtoContent = () => {
  const context = useContext(ContextData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPtoId, setSelectedPtoId] = useState<string | null>(null);
  const [isDetailSliderOpen, setIsDetailSliderOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8); // 8 cards per page

  const { data: ptoPolicies, isLoading, error } = useFetchPTOPolicies();

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Handle PTO card click
  const handlePTOCardClick = useCallback((ptoId: string) => {
    console.log('Card clicked, setting PTO ID:', ptoId);
    setSelectedPtoId(ptoId);
    setIsDetailSliderOpen(true);
  }, []);

  // When slider closes, reset the selected PTO ID
  const handleSliderClose = useCallback((isOpen: boolean) => {
    console.log('Setting slider open state:', isOpen);
    setIsDetailSliderOpen(isOpen);
    if (!isOpen) {
      // Reset selected PTO ID when slider closes
      setTimeout(() => {
        setSelectedPtoId(null);
      }, 300); // Small delay to ensure slider animation completes
    }
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // if (isLoading) {
  //   return (
  //     <div className="fixed z-[9999] backdrop-blur-sm top-0 left-0 h-screen w-screen grid place-content-center">
  //       <PottaLoader />
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="text-red-500">
        Error loading PTO policies. Please try again.
      </div>
    );
  }

  // Filter policies based on search query
  const filteredPolicies = ptoPolicies?.filter((pto) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const typeName = pto.type.toLowerCase();

    return typeName.includes(query);
  });

  // Calculate pagination
  const totalPolicies = filteredPolicies?.length || 0;
  const totalPages = Math.ceil(totalPolicies / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPolicies = filteredPolicies?.slice(startIndex, endIndex) || [];

  return (
    <div
      className={`${
        context?.layoutMode === 'sidebar' ? 'w-full p-5 pl-12' : 'w-full p-5'
      }`}
    >
      {/* Header Section */}
      <div className="mb-2">
        <div className="flex justify-between items-center">
          <Search
            placeholder="Search PTO policies..."
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            className="!w-fit"
            value={searchQuery}
          />
          <SliderSchedule />
        </div>
      </div>

      {/* PTO cards grid with scrolling */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto pr-2">
          {currentPolicies && currentPolicies.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentPolicies.map((pto) => (
                  <PTOCard
                    key={pto.uuid}
                    pto={pto}
                    onClick={handlePTOCardClick}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <i className="ri-arrow-left-s-line mr-1"></i>
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Next
                      <i className="ri-arrow-right-s-line ml-1"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* Page Info */}
              {totalPages > 1 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  Showing {startIndex + 1} to{' '}
                  {Math.min(endIndex, totalPolicies)} of {totalPolicies} PTO
                  policies
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col justify-center items-center h-full space-y-4">
              <div className="text-gray-400 text-6xl">
                <i className="ri-calendar-line"></i>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No PTO policies found
                </h3>
                <p className="text-gray-500">
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Create your first PTO policy to get started'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PTO Detail Slider */}
      <PTODetailSlider
        ptoId={selectedPtoId}
        open={isDetailSliderOpen}
        setOpen={handleSliderClose}
      />
    </div>
  );
};

const Pto = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayout>
        <PtoContent />
      </RootLayout>
    </QueryClientProvider>
  );
};

export default Pto;
