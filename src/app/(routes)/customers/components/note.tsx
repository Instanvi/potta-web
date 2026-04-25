import TextArea from '@potta/components/textArea';
import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface NotesProps {
  register: UseFormRegister<any>;
  errors: FieldError | undefined;
}

const Notes: React.FC<NotesProps> = ({ register, errors }) => {
  return (
    <div className="mt-4 w-full">
      <TextArea
        label="Notes"
        name="notes"
        placeholder="Type your message here"
        register={register}
        errors={errors}
        height={true}
      />
    </div>
  );
};

export default Notes;
