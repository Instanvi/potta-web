import React, { useState, useEffect } from 'react';
import Slider from '@potta/components/slideover';
import Input from '@potta/components/input';
import Button from '@potta/components/button';
import SearchableSelect from '@potta/components/searchableSelect';
import { DateInput } from '@potta/components/customDatePicker';
import TextArea from '@potta/components/textArea';
import CurrencyInput from '@potta/components/currencyInput';
import { useCreatePayslip } from '../hooks/useCreatePayslip';
import { useDeductions } from '../../deductions/hooks/useDeductions';
import { useBenefits } from '../../benefit/hooks/useBenefits';
import { employeeApi } from '../../utils/api';
import toast from 'react-hot-toast';
import { payslipSchema } from '../utils/validations';

interface AddPayslipSlideoverProps {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const statusOptions = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Final', value: 'FINAL' },
];

const AddPayslipSlideover: React.FC<AddPayslipSlideoverProps> = ({
  open,
  setOpen,
}) => {
  const [employeeOptions, setEmployeeOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employee_id, setEmployeeId] = useState<string[]>([]);
  const [pay_period_start, setPayPeriodStart] = useState('');
  const [pay_period_end, setPayPeriodEnd] = useState('');
  const [pay_date, setPayDate] = useState('');
  const [base_salary, setBaseSalary] = useState('');
  const [hours_worked, setHoursWorked] = useState('');
  const [overtime_earnings, setOvertimeEarnings] = useState('');
  const [benefit_ids, setBenefitIds] = useState<string[]>([]);
  const [deduction_ids, setDeductionIds] = useState<string[]>([]);
  const [taxable_income, setTaxableIncome] = useState('');
  const [taxes_applied, setTaxesApplied] = useState<string>('{}');
  const [net_pay, setNetPay] = useState('');
  const [currency, setCurrency] = useState('XAF');
  const [status, setStatus] = useState('DRAFT');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Fetch employees
  useEffect(() => {
    async function fetchEmployees() {
      setLoadingEmployees(true);
      try {
        const res = await employeeApi.filterEmployees({
          limit: 100,
          sortBy: ['createdAt:DESC'],
        });
        const responseData= res.data;
        console.log("employee data", res.data)
        if (responseData) {
          setEmployeeOptions(
            responseData.data.map((emp: any) => ({
              label:
                `${emp.first_name || emp.firstName || ''} ${
                  emp.last_name || emp.lastName || ''
                }`.trim() || 'Employee',
              value: emp.id || emp._id || emp.uuid,
            }))
          );
        }
      } catch (err) {
        setEmployeeOptions([]);
      } finally {
        setLoadingEmployees(false);
      }
    }
    if (open) fetchEmployees();
  }, [open]);

  // console.log('employees', employeeOptions);
  // Fetch deductions
  const { data: deductionsData, isLoading: loadingDeductions } = useDeductions({
    page: 1,
    limit: 100,
  });
  const deductionOptions = (deductionsData?.data || []).map((d: any) => ({
    label: d.name,
    value: d.id || d.uuid,
  }));

  // Fetch benefits
  const { benefits: benefitsData, loading: loadingBenefits } = useBenefits({
    page: 1,
    limit: 100,
  });
  const benefitOptions = (benefitsData || []).map((b: any) => ({
    label: b.name,
    value: b.uuid,
  }));

  const createPayslip = useCreatePayslip();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    let taxesAppliedObj = {};
    try {
      taxesAppliedObj = taxes_applied ? JSON.parse(taxes_applied) : {};
    } catch {
      setFormErrors((f) => ({ ...f, taxes_applied: 'Invalid JSON' }));
      return;
    }
    const payload = {
      employee_id,
      pay_period_start: pay_period_start ? pay_period_start.toISOString() : '',
      pay_period_end: pay_period_end ? pay_period_end.toISOString() : '',
      pay_date: pay_date ? pay_date.toISOString() : '',
      base_salary: base_salary === '' ? 0 : Number(base_salary),
      hours_worked: hours_worked === '' ? 0 : Number(hours_worked),
      overtime_earnings:
        overtime_earnings === '' ? 0 : Number(overtime_earnings),
      benefit_ids,
      deduction_ids,
      taxable_income: taxable_income === '' ? 0 : Number(taxable_income),
      taxes_applied: taxesAppliedObj,
      net_pay: net_pay === '' ? 0 : Number(net_pay),
      currency,
      status,
    };
    try {
      await payslipSchema.validate(payload, { abortEarly: false });
    } catch (validationError: any) {
      const errors: Record<string, string> = {};
      if (validationError.inner && validationError.inner.length > 0) {
        validationError.inner.forEach((err: any) => {
          if (err.path) errors[err.path] = err.message;
        });
      } else if (validationError.path) {
        errors[validationError.path] = validationError.message;
      }
      setFormErrors(errors);
      return;
    }
    setLoading(true);
    try {
      await createPayslip.mutateAsync(payload);
      toast.success('Payslip created successfully!');
      setOpen(false);
      setEmployeeId([]);
      setPayPeriodStart('');
      setPayPeriodEnd('');
      setPayDate('');
      setBaseSalary('');
      setHoursWorked('');
      setOvertimeEarnings('');
      setBenefitIds([]);
      setDeductionIds([]);
      setTaxableIncome('');
      setTaxesApplied('{}');
      setNetPay('');
      setCurrency('XAF');
      setStatus('DRAFT');
      setFormErrors({});
    } catch (err) {
      toast.error('Failed to create payslip.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Slider
      edit={false}
      buttonText="payslips"
      open={open}
      setOpen={setOpen}
      title="Add Payslip"
    >
      <form
        className="grid grid-cols-2 gap-4 w-full max-w-4xl p-4"
        onSubmit={handleSubmit}
      >
        <div className="col-span-2">
          <SearchableSelect
            label="Employee(s)"
            options={employeeOptions}
            selectedValue={employee_id}
            onChange={setEmployeeId}
            required
            error={formErrors.employee_id}
            placeholder="Select employee(s)"
            isLoading={loadingEmployees}
            multiple
          />
        </div>
        <DateInput
          label="Pay Period Start"
          name="pay_period_start"
          value={pay_period_start ? new Date(pay_period_start) : undefined}
          onChange={(date) =>
            setPayPeriodStart(date ? date.toISOString().slice(0, 10) : '')
          }
          placeholder="Select start date"
          required
        />
        <DateInput
          label="Pay Period End"
          name="pay_period_end"
          value={pay_period_end ? new Date(pay_period_end) : undefined}
          onChange={(date) =>
            setPayPeriodEnd(date ? date.toISOString().slice(0, 10) : '')
          }
          placeholder="Select end date"
          required
        />
        <DateInput
          label="Pay Date"
          name="pay_date"
          value={pay_date ? new Date(pay_date) : undefined}
          onChange={(date) =>
            setPayDate(date ? date.toISOString().slice(0, 10) : '')
          }
          placeholder="Select pay date"
          required
        />
        <CurrencyInput
          label="Base Salary"
          value={base_salary}
          onChange={(e) => setBaseSalary(e.target.value)}
          currency={currency}
          error={formErrors.base_salary}
          required
        />
        <Input
          label="Hours Worked"
          name="hours_worked"
          type="number"
          value={hours_worked}
          onchange={(e) => setHoursWorked(e.target.value)}
          errors={formErrors.hours_worked}
          min={0}
        />
        <CurrencyInput
          label="Overtime Earnings"
          value={overtime_earnings}
          onChange={(e) => setOvertimeEarnings(e.target.value)}
          currency={currency}
          error={formErrors.overtime_earnings}
        />
        <SearchableSelect
          label="Benefits"
          options={benefitOptions}
          selectedValue={benefit_ids}
          onChange={setBenefitIds}
          multiple
          error={formErrors.benefit_ids}
          placeholder="Select benefits"
          isLoading={loadingBenefits}
        />
        <SearchableSelect
          label="Deductions"
          options={deductionOptions}
          selectedValue={deduction_ids}
          onChange={setDeductionIds}
          multiple
          error={formErrors.deduction_ids}
          placeholder="Select deductions"
          isLoading={loadingDeductions}
        />
        <CurrencyInput
          label="Taxable Income"
          value={taxable_income}
          onChange={(e) => setTaxableIncome(e.target.value)}
          currency={currency}
          error={formErrors.taxable_income}
        />
        <CurrencyInput
          label="Net Pay"
          value={net_pay}
          onChange={(e) => setNetPay(e.target.value)}
          currency={currency}
          error={formErrors.net_pay}
        />
        <CurrencyInput
          label="Currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          currency={currency}
          error={formErrors.currency}
        />
        <SearchableSelect
          label="Status"
          options={statusOptions}
          selectedValue={status}
          onChange={setStatus}
          required
          error={formErrors.status}
          placeholder="Select status"
          isLoading={loadingBenefits}
        />
        <div className="col-span-2">
          <TextArea
            label="Taxes Applied (JSON)"
            name="taxes_applied"
            value={taxes_applied}
            onchange={(e) => setTaxesApplied(e.target.value)}
            placeholder="{ }"
            errors={formErrors.taxes_applied}
            height
          />
        </div>
        <div className="col-span-2 w-full flex justify-end mt-8">
          <Button
            text="Save Payslip"
            type="submit"
            isLoading={loading}
            disabled={loading}
          />
        </div>
      </form>
    </Slider>
  );
};

export default AddPayslipSlideover;
