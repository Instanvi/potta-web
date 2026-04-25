export interface NewShiftModalProps {
  onClose: () => void;
  onSuccess: () => void;
  roles?: { value: string; label: string }[];
  isLoadingRoles?: boolean;
  selectedDate?: any;
  selectedEmployeeId?: string;
}

// Define the shift payload structure to match the API
export interface ShiftPayload {
  name: string;
  start_time: string; // Format: "2025-04-20T08:00:00Z"
  end_time: string; // Format: "2025-04-20T16:00:00Z"
  employeeId: string;
  recurrence_pattern: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  break_minutes: number;
  applies_to_roles: string[];
  color: string; // New color field
}
