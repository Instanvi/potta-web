'use client';
import React, { useState, useEffect } from 'react';
import Input from '@potta/components/input';
import Slider from '@potta/components/slideover';
import SearchableSelect from '@potta/components/searchableSelect';
import { useForm, Controller } from 'react-hook-form';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@potta/lib/utils';
import { journalApi } from '../utils/api';
import toast from 'react-hot-toast';
import { Journal, JournalLine } from '../utils/types';
import CurrencyInput from '@potta/components/currencyInput';
import { Button } from '@potta/components/shadcn/button';

interface JournalViewSliderProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  journalId?: string;
}

const JournalViewSlider: React.FC<JournalViewSliderProps> = ({
  open: controlledOpen,
  setOpen: setControlledOpen,
  journalId,
}) => {
  const [localOpen, setLocalOpen] = useState(false);
  const [journal, setJournal] = useState<Journal | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isOpen = controlledOpen ?? localOpen;
  const setIsOpen = setControlledOpen ?? setLocalOpen;

  // Fetch journal data when opened
  useEffect(() => {
    if (journalId && isOpen) {
      const fetchJournal = async () => {
        try {
          setIsLoading(true);
          const response = await journalApi.getOne(journalId);
          setJournal(response);
        } catch (error) {
          console.error('Error fetching journal:', error);
          toast.error('Failed to fetch journal details');
        } finally {
          setIsLoading(false);
        }
      };
      fetchJournal();
    }
  }, [journalId, isOpen]);

  if (!journal) return null;

  const totalDebit = journal.lines.reduce(
    (sum, line) => sum + parseFloat(line.debit?.toString() || '0'),
    0
  );
  const totalCredit = journal.lines.reduce(
    (sum, line) => sum + parseFloat(line.credit?.toString() || '0'),
    0
  );

  return (
    <Slider
      open={isOpen}
      setOpen={setIsOpen}
      edit={false}
      title="Journal Entry"
      buttonText="editjournal"
    >
      <div className="relative overflow-hidden w-full max-w-6xl">
        <div className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Type
              </label>
              <div className="mt-1 text-sm text-gray-900">{journal.type}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Date
              </label>
              <div className="mt-1 text-sm text-gray-900">
                {format(new Date(journal.date), 'PPP')}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-500">
                Description
              </label>
              <div className="mt-1 text-sm text-gray-900">
                {journal.description}
              </div>
            </div>
          </div>

          {/* Journal Lines */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Journal Lines
              </h3>
            </div>

            <div className="space-y-4">
              {journal.lines.map((line, index) => (
                <div
                  key={line.uuid}
                  className="p-4 border rounded-lg bg-white shadow-sm"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Account
                      </label>
                      <div className="mt-1 text-sm text-gray-900">
                        {line.account?.code} - {line.account?.name}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Description
                      </label>
                      <div className="mt-1 text-sm text-gray-900">
                        {line.description}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Debit
                      </label>
                      <div className="mt-1 text-sm text-gray-900">
                        {parseFloat(line.debit).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Credit
                      </label>
                      <div className="mt-1 text-sm text-gray-900">
                        {parseFloat(line.credit).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Total Debit
                  </label>
                  <div className="mt-1 text-sm font-medium text-gray-900">
                    {totalDebit.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Total Credit
                  </label>
                  <div className="mt-1 text-sm font-medium text-gray-900">
                    {totalCredit.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-4 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </Slider>
  );
};

export default JournalViewSlider;
