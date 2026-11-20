import * as yup from 'yup';

export const payslipSchema = yup.object().shape({
  employee_id: yup.string().required('Employee is required'),
  pay_period_start: yup.date().required('Start date is required'),
  pay_period_end: yup.date().required('End date is required'),
  pay_date: yup.date().required('Pay date is required'),
  base_salary: yup.number().required('Base salary is required'),
  hours_worked: yup.number().required('Hours worked is required'),
  overtime_earnings: yup.number().required('Overtime earnings is required'),
  benefit_ids: yup.array().of(yup.string()),
  deduction_ids: yup.array().of(yup.string()),
  taxable_income: yup.number().required('Taxable income is required'),
  taxes_applied: yup.object(),
  net_pay: yup.number().required('Net pay is required'),
  currency: yup.string().required('Currency is required'),
  status: yup.string().required('Status is required'),
});

export interface PayslipPayload {
  employee_id: string;
  pay_period_start: string;
  pay_period_end: string;
  pay_date: string;
  base_salary: number;
  hours_worked: number;
  overtime_earnings: number;
  benefit_ids: string[];
  deduction_ids: string[];
  taxable_income: number;
  taxes_applied: Record<string, any>;
  net_pay: number;
  currency: string;
  status: string;
}
