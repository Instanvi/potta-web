import { EnvelopeIcon } from "@heroicons/react/20/solid";
import { FieldError, UseFormRegister } from "react-hook-form";
import React, { ChangeEvent, ReactNode, useState } from "react";
import "./input.css"

type Props = {
  type?: string;
  name: string;
  label?: string;
  icon?: ReactNode;
  className?: string;
  verified?: boolean;
  errors?: FieldError;
  isTextArea?: boolean;
  placeholder?: string;
  value?: string | number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register?: UseFormRegister<any>;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

const Input: React.FC<Props> = ({
  icon,
  type,
  name,
  label,
  value,
  errors,
  register,
  onChange,
  verified,
  className,
  isTextArea,
  placeholder,
}) => {
  const [open, setOpen] = useState(false)

  //========== component ============
  return (
    <div className={`w-full ${className}`}>
      <div className='flex gap-1 items-center'>
        <label htmlFor="" className="capitalize font-medium text-[0.75rem]">
          {label}
        </label>
        {verified && <i className='ri-checkbox-circle-fill text-green-700 -mt-1' />}
      </div>
      {!isTextArea ? (
        <div className="relative rounded-md shadow-sm mt-1">
          <input
            id={name}
            value={value}
            placeholder={placeholder}
            className={`w-full py-2.5 border outline-none pl-3 ui-input ${errors?.message ? "input-error" : ""}`}
            {...(register && { ...register(name), onChange })}
            type={open && name?.includes("password") ? "password" : !open && name?.includes("password") ? "text" : type}
          />

          {type === "email" && <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <EnvelopeIcon aria-hidden="true" className="h-5 w-5 text-gray-400 icon" />
          </div>}

          {icon && <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            {icon}
          </div>}

          {name?.includes("password") && <div className="cursor-pointer absolute inset-y-0 right-0 flex items-center px-3" onClick={() => setOpen(!open)}>
            {
              open ? <i className="ri-eye-fill text-gray-500 text-xl" />
                : <i className="ri-eye-off-fill text-gray-500 text-xl" />
            }
          </div>}
        </div>
      ) : (
        <textarea
          rows={3}
          id={name}
          value={value}
          autoComplete="off"
          placeholder={placeholder}
          {...(register && { ...register(name) })}
          className={`w-full p-3 mt-3 border ui-input outline-none ${errors?.message ? "input-error" : ""}`}
        />
      )}
      {errors ? (
        <small className="col-span-2 text-red-500">{errors?.message}</small>
      ) : null}
    </div>
  );
};

export default Input;

