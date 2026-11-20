'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { peopleApi } from '../../../utils/api';
import { useQueryClient } from '@tanstack/react-query';

// Define benefit type
interface Benefit {
  uuid: string;
  name: string;
  type: string;
  rate: string;
  provider: string;
}

// Define deduction type
interface Deduction {
  id: string;
  motif: string;
  type: string;
  rate: string;
}

export const useEmployeeBenefits = (personId?: string) => {
  const [initialBenefits, setInitialBenefits] = useState<Benefit[]>([]);
  const [selectedBenefits, setSelectedBenefits] = useState<Benefit[]>([]);
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [personData, setPersonData] = useState<any>(null);
  const queryClient = useQueryClient();

  // Check if benefits have changed
  const checkForChanges = useCallback(() => {
    // If lengths are different, there are changes
    if (initialBenefits.length !== selectedBenefits.length) {
      setHasChanges(true);
      return;
    }

    // Check if all initial benefits are still selected
    const hasChanges = initialBenefits.some(
      (initialBenefit) =>
        !selectedBenefits.some(
          (selectedBenefit) => selectedBenefit.uuid === initialBenefit.uuid
        )
    );

    setHasChanges(hasChanges);
  }, [initialBenefits, selectedBenefits]);

  // Fetch employee benefits if personId is provided
  useEffect(() => {
    if (!personId) return;

    const fetchEmployeeBenefits = async () => {
      setLoading(true);
      try {
        // Get the employee data
        const response = await peopleApi.getPerson(personId);

        // Store the full person data for later use when updating
        setPersonData(response);

        // If the employee has benefits, store them
        if (response && response.benefits && Array.isArray(response.benefits)) {
          // Set both initial and selected benefits
          setInitialBenefits(response.benefits);
          setSelectedBenefits(response.benefits);
        } else {
          // Reset benefits if none found
          setInitialBenefits([]);
          setSelectedBenefits([]);
        }
      } catch (error) {
        console.error('Error fetching employee benefits:', error);
        // Reset benefits if error
        setInitialBenefits([]);
        setSelectedBenefits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeBenefits();
  }, [personId]);

  // Check for changes whenever selected benefits change
  useEffect(() => {
    checkForChanges();
  }, [selectedBenefits, checkForChanges]);

  // Add a benefit
  const addBenefit = (benefit: Benefit) => {
    // Check if benefit is already selected
    if (!selectedBenefits.some((item) => item.uuid === benefit.uuid)) {
      setSelectedBenefits((prev) => [...prev, benefit]);
      // setHasChanges is now handled by the useEffect
    }
  };

  // Remove a benefit
  const removeBenefit = (benefitId: string) => {
    setSelectedBenefits((prev) =>
      prev.filter((benefit) => benefit.uuid !== benefitId)
    );
    // setHasChanges is now handled by the useEffect
  };

  // Add a deduction
  const addDeduction = (deduction: Deduction) => {
    setDeductions((prev) => [...prev, deduction]);
    setHasChanges(true);
  };

  // Remove a deduction
  const removeDeduction = (deductionId: string) => {
    setDeductions((prev) =>
      prev.filter((deduction) => deduction.id !== deductionId)
    );
    setHasChanges(true);
  };
  // Save benefits
  const saveBenefits = async () => {
    if (!personId) {
      toast.error('Cannot save benefits: Employee ID is missing');
      return;
    }

    setSaving(true);
    try {
      // Extract just the benefit IDs
      const benefitIds = selectedBenefits.map((benefit) => benefit.uuid);

      // First, get the current person data to preserve other fields
      let currentPersonData;
      if (personData) {
        currentPersonData = personData;
      } else {
        // Fetch current data if we don't have it
        currentPersonData = await peopleApi.getPerson(personId);
      }

      // Extract paid time off IDs if they exist
      const paidTimeOffIds =
        currentPersonData.paid_time_off &&
        Array.isArray(currentPersonData.paid_time_off)
          ? currentPersonData.paid_time_off.map((pto: any) => pto.uuid)
          : [];

      // Create an update payload that only changes the benefits field
      // but preserves the paid time off IDs
      const updatePayload = {
        benefits: benefitIds,
        // Send just the IDs of paid time off records
        paidTimeOff: paidTimeOffIds,
      };

      console.log('Updating person with payload:', updatePayload);

      // Update the employee with just the benefits array
      await peopleApi.updatePerson(personId, updatePayload);

      // toast.success('Benefits saved successfully');

      // Update initial benefits to match current selection
      setInitialBenefits([...selectedBenefits]);
      setHasChanges(false);

      // Set complete flag to true
      setIsComplete(true);
      // Invalidate TanStack Query for employee benefits
      queryClient.invalidateQueries(['employeeBenefits', personId]);
    } catch (error) {
      console.error('Error saving benefits:', error);
      toast.error('Failed to save benefits');
    } finally {
      setSaving(false);
    }
  };

  return {
    selectedBenefits,
    deductions,
    loading,
    saving,
    hasChanges,
    isComplete,
    addBenefit,
    removeBenefit,
    addDeduction,
    removeDeduction,
    saveBenefits,
  };
};
