'use client';
import React, { useState, useEffect } from 'react';
import RootLayout from '../../layout';
import { toast } from 'react-hot-toast';
import Button from '@potta/components/button';
import ShiftView from '../timesheet/components/ShiftView';
import NewShiftModal from '../timesheet/components/NewShiftModal';
import axios from 'config/axios.config';

// Define the role interface to match the API response
interface Role {
  uuid: string;
  name: string;
  description?: string;
  is_active: boolean;
  is_default: boolean;
}

// Define the API response structure
interface RolesResponse {
  data: Role[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
    sortBy: [string, string][];
  };
  links: {
    current: string;
  };
}

const Shifts = () => {
  // State for modal
  const [showNewShiftModal, setShowNewShiftModal] = useState(false);
  // State for roles
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  // Fetch roles when component mounts
  useEffect(() => {
    fetchRoles();
  }, []);

  // Function to fetch roles from the API
  const fetchRoles = async () => {
    setIsLoadingRoles(true);
    try {
      const response = await axios.post<RolesResponse>('/roles/filter', {
        page: 1,
        limit: 100,
        sortBy: ['name:ASC'],
        is_active: true,
      });

      if (response.data && response.data.data) {
        // Transform roles to the format expected by the Select component
        const formattedRoles = response.data.data
          .filter((role) => role.is_active) // Only include active roles
          .map((role) => ({
            value: role.uuid,
            label: role.name,
          }));

        setRoles(formattedRoles);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      // Set default roles if API fails
      setRoles([
        { value: 'admin', label: 'Admin' },
        { value: 'manager', label: 'Manager' },
        { value: 'staff', label: 'Staff' },
        { value: 'supervisor', label: 'Supervisor' },
      ]);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  // Handle successful shift creation
  const handleShiftSuccess = () => {
    setShowNewShiftModal(false);

    // You could refresh the shift view here if needed
  };

  return (
    <RootLayout>
      <div className="px-14 pt-2">
        {/* Shifts content */}
        <ShiftView buttonClick={() => setShowNewShiftModal(true)} />
      </div>

      {showNewShiftModal && (
        <NewShiftModal
          onClose={() => setShowNewShiftModal(false)}
          onSuccess={handleShiftSuccess}
          roles={roles}
          isLoadingRoles={isLoadingRoles}
        />
      )}
    </RootLayout>
  );
};

export default Shifts;
