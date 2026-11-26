'use client';

import { useFormContext } from 'react-hook-form';
import Select from '@potta/components/select';
import Checkbox from '@potta/components/checkbox';

const Audience = ({ showErrors = false }: { showErrors?: boolean }) => {
  const { watch, setValue } = useFormContext();
  const autoAddUsers = Boolean(watch('autoAddUsers'));
  const canJoinOnce = Boolean(watch('canJoinOnce'));
  const audienceSegment = watch('audience.segment') || '';

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
      <div className={showErrors && !audienceSegment ? 'error-field' : ''}>
        <Select
          label="Audience"
          required
          name="Audience"
          placeholder="Select an audience"
          options={[
            { label: 'Select an audience', value: '' },
            { label: 'All customers', value: 'all' },
            { label: 'New customers', value: 'new' },
            { label: 'Returning customers', value: 'returning' },
            { label: 'VIP customers', value: 'vip' },
          ]}
          selectedValue={audienceSegment}
          onChange={(value) => setValue('audience.segment', value)}
          error={showErrors && !audienceSegment ? 'Audience is required' : undefined}
        />
      </div>
      <div className="flex flex-col justify-end gap-3 pb-1">
        <Checkbox
          id="auto-add-users"
          label="Automatically add new users to this program"
          checked={autoAddUsers}
          onChange={(checked) => {
            setValue('autoAddUsers', checked);
            setValue('audience.autoAddUsers', checked);
          }}
        />
        <Checkbox
          id="join-once"
          label="Can only join campaigns once"
          checked={canJoinOnce}
          onChange={(checked) => {
            setValue('canJoinOnce', checked);
            setValue('audience.canJoinOnce', checked);
          }}
        />
      </div>
    </div>
  );
};

export default Audience;
