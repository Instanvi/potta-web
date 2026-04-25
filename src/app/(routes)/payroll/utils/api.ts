import axios from "config/axios.config";

// Employee API
export const employeeApi = {
  filterEmployees: (params = {}) => {
    return axios.post('/employees/filter', params);
  },
  getEmployeeById: (id: number) => {
    return axios.get(`/employees/${id}`);
  },
};

// Timesheet API
export const timesheetApi = {
  filterTimesheets: (params = {}) => {
    return axios.post('/timesheets/filter', params);
  },
  createTimesheet: (data = {}) => {
    return axios.post('/timesheets', data);
  },
  updateTimesheet: (id: number, data = {}) => {
    return axios.patch(`/timesheets/${id}`, data);
  },
  approveTimesheet: (id: number) => {
    return axios.put(`/timesheets/approve/${id}`);
  },
  rejectTimesheet: (id: number) => {
    return axios.put(`/timesheets/reject/${id}`);
  },
};

// Shift API
export const shiftApi = {
  filterShifts: (params = {}) => {
    return axios.post('/shifts/filter', params);
  },
  createShift: (data = {}) => {
    return axios.post('/shifts', data);
  },
  updateShift: (id: number, data = {}) => {
    return axios.patch(`/shifts/${id}`, data);
  },
  deleteShift: (id: number) => {
    return axios.delete(`/shifts/${id}`);
  },
};
