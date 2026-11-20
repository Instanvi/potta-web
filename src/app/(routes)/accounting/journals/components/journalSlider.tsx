'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Input from '@potta/components/input';
import Slider from '@potta/components/slideover';
import SearchableSelect from '@potta/components/searchableSelect';
import Button from '@potta/components/button';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Calendar } from '@potta/components/shadcn/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@potta/components/shadcn/popover';
import { Button as ShadcnButton } from '@potta/components/shadcn/button';
import { CalendarIcon, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@potta/lib/utils';
import { accountsApi } from '../../utils/api';
import { journalApi } from '../utils/api';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@potta/components/shadcn/dialog';
import CurrencyInput from '@potta/components/currencyInput';
import { Account } from '../../utils/types';

interface JournalLine {
  accountId: string;
  debit: number;
  credit: number;
  description: string;
  transactionId?: string;
}

interface JournalPayload {
  type: string;
  date: Date;
  description: string;
  organizationId: string;
  branchId: string;
  sourceDocumentId?: string;
  sourceDocumentType?: string;
  lines: JournalLine[];
}

const journalSchema = yup.object().shape({
  type: yup.string().required('Type is required'),
  date: yup.date().required('Date is required'),
  description: yup.string().required('Description is required'),
  organizationId: yup.string().required('Organization ID is required'),
  branchId: yup.string().required('Branch ID is required'),
  sourceDocumentId: yup.string(),
  sourceDocumentType: yup.string(),
  lines: yup
    .array()
    .of(
      yup.object().shape({
        accountId: yup.string().required('Account is required'),
        debit: yup.number().min(0, 'Debit must be positive'),
        credit: yup.number().min(0, 'Credit must be positive'),
        description: yup.string().required('Line description is required'),
      })
    )
    .min(2, 'At least two lines are required'),
});

interface JournalSliderProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const JournalSlider: React.FC<JournalSliderProps> = ({
  open: controlledOpen,
  setOpen: setControlledOpen,
}) => {
  const [localOpen, setLocalOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [lines, setLines] = useState<JournalLine[]>([
    { accountId: '', debit: 0, credit: 0, description: '' },
    { accountId: '', debit: 0, credit: 0, description: '' },
  ]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [debitCreditError, setDebitCreditError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const isOpen = controlledOpen ?? localOpen;
  const setIsOpen = setControlledOpen ?? setLocalOpen;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<JournalPayload>({
    resolver: yupResolver(journalSchema),
    defaultValues: {
      type: 'SALE',
      date: new Date(),
      description: '',
      organizationId: 'f7b1b3b0-0b1b-4b3b-8b1b-0b1b3b0b1b3c',
      branchId: 'f7b1b3b0-0b1b-4b3b-8b1b-0b1b3b0b1b3b',
      sourceDocumentType: '',
      lines: [
        { accountId: '', debit: 0, credit: 0, description: '' },
        { accountId: '', debit: 0, credit: 0, description: '' },
      ],
    },
  });

  // Watch all lines for debit/credit changes
  const watchedLines = watch('lines');

  // Add useEffect for real-time debit/credit validation
  useEffect(() => {
    const totalDebit = lines.reduce(
      (sum, line) => sum + parseFloat(line.debit?.toString() || '0'),
      0
    );
    const totalCredit = lines.reduce(
      (sum, line) => sum + parseFloat(line.credit?.toString() || '0'),
      0
    );

    if (totalDebit !== totalCredit) {
      setDebitCreditError(
        `Total debits (${totalDebit.toFixed(
          2
        )}) must equal total credits (${totalCredit.toFixed(2)})`
      );
    } else {
      setDebitCreditError(null);
    }
  }, [lines]);

  const handleAccountSearch = (value: string) => {
    console.log('Account search:', { value, currentAccounts: accounts });
    if (value) {
      searchAccount(value);
    }
  };

  const searchAccount = async (code: string) => {
    try {
      setLoadingAccounts(true);
      console.log('Searching accounts with code:', code);
      const response = await accountsApi.getFiltered({
        search: code,
        filter: ['code'],
        limit: 10,
      });
      console.log('Search response:', response);

      // Get currently selected accounts from lines
      const selectedAccounts = lines
        .map((line) => line.accountId)
        .filter((id) => id)
        .map((id) => accounts.find((acc) => acc.uuid === id))
        .filter((acc): acc is Account => acc !== undefined);

      // Combine selected accounts with search results, avoiding duplicates
      const newAccounts = [...selectedAccounts];
      response.data.forEach((account) => {
        if (!newAccounts.some((acc) => acc.uuid === account.uuid)) {
          newAccounts.push(account);
        }
      });

      setAccounts(newAccounts);
    } catch (error) {
      console.error('Error searching accounts:', error);
      setAccounts([]);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const addLine = () => {
    setLines([
      ...lines,
      { accountId: '', debit: 0, credit: 0, description: '' },
    ]);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: keyof JournalLine, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
    setValue('lines', newLines);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Here you would typically upload the file and get the document ID
      // For now, we'll just set a placeholder
      setValue('sourceDocumentId', 'placeholder-doc-id');
    }
  };

  const handleAccountChange = (value: string, index: number) => {
    console.log('Account change:', { value, index, currentLines: lines });
    const selectedAccount = accounts.find((account) => account.uuid === value);
    if (selectedAccount) {
      const updatedLines = [...lines];
      updatedLines[index] = {
        ...updatedLines[index],
        accountId: selectedAccount.uuid,
        description: updatedLines[index].description || '',
        debit: updatedLines[index].debit || 0,
        credit: updatedLines[index].credit || 0,
      };
      console.log('Updated lines:', updatedLines);
      setLines(updatedLines);
      // Update form value for validation
      setValue(`lines.${index}.accountId`, selectedAccount.uuid);
    }
  };

  const handleDebitChange = (value: string, index: number) => {
    console.log('Debit change:', { value, index, currentLines: lines });
    const updatedLines = [...lines];
    updatedLines[index] = {
      ...updatedLines[index],
      debit: parseFloat(value) || 0,
      credit: 0, // Reset credit when debit is entered
    };
    console.log('Updated lines after debit:', updatedLines);
    setLines(updatedLines);
    // Update form value for validation
    setValue(`lines.${index}.debit`, parseFloat(value) || 0);
    setValue(`lines.${index}.credit`, 0);
  };

  const handleCreditChange = (value: string, index: number) => {
    console.log('Credit change:', { value, index, currentLines: lines });
    const updatedLines = [...lines];
    updatedLines[index] = {
      ...updatedLines[index],
      credit: parseFloat(value) || 0,
      debit: 0, // Reset debit when credit is entered
    };
    console.log('Updated lines after credit:', updatedLines);
    setLines(updatedLines);
    // Update form value for validation
    setValue(`lines.${index}.credit`, parseFloat(value) || 0);
    setValue(`lines.${index}.debit`, 0);
  };

  const onSubmit = async (data: JournalPayload) => {
    setIsConfirmOpen(true);
  };

  const handleConfirmCreate = async () => {
    try {
      const data = watch();
      console.log('Submitting form with data:', data);
      const payload = {
        type: data.type,
        date: new Date(data.date).toISOString(),
        description: data.description,
        organizationId: data.organizationId,
        branchId: data.branchId,
        sourceDocumentId: 'f7b1b3b0-0b1b-4b3b-8b1b-0b1b3b0b1b3br',
        sourceDocumentType: data.sourceDocumentType,
        lines: data.lines.map((line) => {
          const linePayload: any = {
            accountId: line.accountId,
            description: line.description,
          };

          if (line.debit && line.debit > 0) {
            linePayload.debit = line.debit;
          } else if (line.credit && line.credit > 0) {
            linePayload.credit = line.credit;
          }

          return linePayload;
        }),
      };
      console.log('Final payload:', payload);
      const response = await journalApi.create(payload);
      console.log('Journal created:', response);
      toast.success('Journal created successfully');
      queryClient.invalidateQueries({ queryKey: ['get-all-journals'] });
      setIsOpen(false);
      setIsConfirmOpen(false);
      // Reset form and state
      reset();
      setLines([
        { accountId: '', debit: 0, credit: 0, description: '' },
        { accountId: '', debit: 0, credit: 0, description: '' },
      ]);
      setSelectedFile(null);
      setDebitCreditError(null);
    } catch (error) {
      console.error('Error creating journal:', error);
      toast.error('Failed to create journal');
    }
  };

  // Add useEffect to log lines changes
  useEffect(() => {
    console.log('Lines updated:', lines);
  }, [lines]);

  // Add useEffect to log accounts changes
  useEffect(() => {
    console.log('Accounts updated:', accounts);
  }, [accounts]);

  return (
    <>
      <Slider
        open={isOpen}
        setOpen={setIsOpen}
        edit={false}
        title="Create Journal Entry"
        buttonText="journal"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="relative overflow-hidden w-full max-w-6xl h-full"
        >
          <div className="grid grid-cols-2 overflow-hidden min-h-full gap-4 p-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      label="Type"
                      options={[
                        { value: 'SALE', label: 'Sale' },
                        { value: 'PURCHASE', label: 'Purchase' },
                        { value: 'EXPENSE', label: 'Expense' },
                        { value: 'PAYMENT', label: 'Payment' },
                      ]}
                      selectedValue={field.value}
                      onChange={field.onChange}
                      placeholder="Select type..."
                      required
                    />
                  )}
                />
                {errors.type && (
                  <small className="text-red-500">{errors.type.message}</small>
                )}
              </div>

              <div>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <ShadcnButton
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </ShadcnButton>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.date && (
                  <small className="text-red-500">{errors.date.message}</small>
                )}
              </div>

              <div>
                <Input
                  label="Description"
                  type="text"
                  name="description"
                  placeholder="Enter description"
                  register={register}
                  errors={errors.description}
                  required
                />
              </div>

              {/* Document Upload Section */}
              <div className="space-y-4">
                <div>
                  <Controller
                    name="sourceDocumentType"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        label="Source Document Type"
                        options={[
                          { value: 'INVOICE', label: 'Invoice' },
                          { value: 'RECEIPT', label: 'Receipt' },
                          {
                            value: 'PAYMENT_VOUCHER',
                            label: 'Payment Voucher',
                          },
                          { value: 'EXPENSE_REPORT', label: 'Expense Report' },
                        ]}
                        selectedValue={field.value}
                        onChange={field.onChange}
                        placeholder="Select document type..."
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Upload Document
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed  cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-medium">Click to upload</span>{' '}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, DOCX, or image files
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,image/*"
                      />
                    </label>
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected file: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Journal Lines */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Journal Lines</h3>
                <Button
                  type="button"
                  text="Add Line"
                  onClick={addLine}
                  theme="lightBlue"
                  className="!text-black"
                />
              </div>

              {debitCreditError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{debitCreditError}</p>
                </div>
              )}

              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {lines.map((line, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Line {index + 1}</h4>
                      {index > 1 && (
                        <Button
                          type="button"
                          text="Remove"
                          onClick={() => removeLine(index)}
                          theme="danger"
                        />
                      )}
                    </div>

                    <Controller
                      name={`lines.${index}.accountId`}
                      control={control}
                      render={({ field }) => (
                        <SearchableSelect
                          label="Account"
                          placeholder="Search by account code"
                          options={accounts.map((account) => ({
                            label: `${account.code || ''} - ${account.name}`,
                            value: account.uuid,
                          }))}
                          selectedValue={line.accountId}
                          onChange={(value) =>
                            handleAccountChange(value, index)
                          }
                          onInputChange={handleAccountSearch}
                          isSearchable={true}
                          isLoading={loadingAccounts}
                          error={errors.lines?.[index]?.accountId?.message}
                        />
                      )}
                    />

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <CurrencyInput
                          label="Debit"
                          value={line.debit?.toString() || '0'}
                          onChange={(e) =>
                            handleDebitChange(e.target.value, index)
                          }
                          error={errors.lines?.[index]?.debit?.message}
                        />
                      </div>
                      <div className="flex-1">
                        <CurrencyInput
                          label="Credit"
                          value={line.credit?.toString() || '0'}
                          onChange={(e) =>
                            handleCreditChange(e.target.value, index)
                          }
                          error={errors.lines?.[index]?.credit?.message}
                        />
                      </div>
                    </div>

                    <Input
                      label="Line Description"
                      type="text"
                      name={`lines.${index}.description`}
                      placeholder="Enter line description"
                      register={register}
                      errors={errors.lines?.[index]?.description}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-grow" />
          <div className="text-center md:text-right md:flex space-x-4 fixed bottom-0 left-0 right-0 justify-center bg-white p-4">
            <div className="fixed bottom-0 left-0 right-0 p-2 bg-white border-t border-gray-200 flex justify-end space-x-3">
              <Button
                text="Create Journal Entry"
                type="submit"
                disabled={!!debitCreditError}
              />
            </div>
          </div>
        </form>
      </Slider>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[425px] !rounded-none animate-in fade-in-0 zoom-in-95 duration-300">
          <DialogHeader>
            <DialogTitle>Confirm Journal Creation</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure you want to create this
              journal entry? Please verify all the details before proceeding.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              text="Cancel"
              type="button"
              theme="outline"
              onClick={() => setIsConfirmOpen(false)}
            />
            <Button
              text="Create Journal"
              type="button"
              onClick={handleConfirmCreate}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JournalSlider;
