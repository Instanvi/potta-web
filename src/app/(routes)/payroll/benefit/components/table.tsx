'use client';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import SliderBenefit from './sliderBenefit';
import BenefitTable, { Benefit } from './benefitTable';
import Search from '@potta/components/search';
import CustomLoader from '@potta/components/loader';
import {
  useBenefitsManagement,
  useBenefitDetail,
  useDeleteBenefitMutation,
} from '../hooks/useBenefitsQuery';

// Import action components
import ViewBenefit from '../actions/viewBenefit';
import DeleteBenefit from '../actions/deleteBenefit';

const TableBenefit = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBenefitId, setSelectedBenefitId] = useState<string | null>(
    null
  );

  // Action states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editBenefitId, setEditBenefitId] = useState<string | null>(null);

  // TanStack Query hooks
  const {
    benefits,
    isFetching,
    currentPage,
    totalPages,
    pageSize,
    handlePageChange,
    handleSearch,
  } = useBenefitsManagement();

  const { benefit: selectedBenefit, isLoading: benefitLoading } =
    useBenefitDetail(selectedBenefitId || '');
  const { benefit: editBenefit, isLoading: editBenefitLoading } =
    useBenefitDetail(editBenefitId || '');
  const deleteBenefitMutation = useDeleteBenefitMutation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    handleSearch(term);
  };

  // Handle benefit actions
  const handleViewBenefit = (id: string) => {
    setSelectedBenefitId(id);
    setShowViewModal(true);
  };

  const handleEditBenefit = (id: string) => {
    setEditBenefitId(id);
    // The SliderBenefit component will handle opening the slider
  };

  const handleDeleteBenefit = (id: string) => {
    setSelectedBenefitId(id);
    setShowDeleteModal(true);
  };

  const handleRowClick = (benefit: Benefit) => {
    setSelectedBenefitId(benefit.uuid);
    setShowViewModal(true);
  };

  // Action handlers
  const handleCloseView = () => {
    setShowViewModal(false);
    setSelectedBenefitId(null);
  };

  const handleEditComplete = () => {
    setEditBenefitId(null);
    // No need to manually refresh - TanStack Query handles it
  };

  const handleEditClose = () => {
    setEditBenefitId(null);
  };

  const handleCloseDelete = () => {
    setShowDeleteModal(false);
    setSelectedBenefitId(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedBenefitId) {
      try {
        await deleteBenefitMutation.mutateAsync(selectedBenefitId);
        setShowDeleteModal(false);
        setSelectedBenefitId(null);
        // No need to manually refresh - TanStack Query handles it
      } catch (error) {
        console.error('Delete error:', error);
        // Error handling is done in the mutation hook
      }
    }
  };

  return (
    <div className="w-full p-6 pl-12">
      <div className="flex justify-between items-center mb-6">
        <Search
          placeholder="Search Benefits"
          onChange={handleSearchChange}
          value={searchTerm}
        />
        <SliderBenefit
          isEditMode={!!editBenefitId}
          editBenefitId={editBenefitId || undefined}
          editBenefit={editBenefit}
          onComplete={handleEditComplete}
          onClose={handleEditClose}
        />
      </div>

      <BenefitTable
        benefits={benefits || []}
        onViewBenefit={handleViewBenefit}
        onEditBenefit={handleEditBenefit}
        onDeleteBenefit={handleDeleteBenefit}
        onRowClick={handleRowClick}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        isLoading={isFetching}
      />

      {/* Action Modals */}
      <ViewBenefit
        isOpen={showViewModal}
        onClose={handleCloseView}
        benefit={selectedBenefit || null}
      />

      <DeleteBenefit
        isOpen={showDeleteModal}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        benefit={selectedBenefit || null}
      />
    </div>
  );
};

export default TableBenefit;
