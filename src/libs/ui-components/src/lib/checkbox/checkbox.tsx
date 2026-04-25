import { FC } from "react";

interface Props {
  text: string;
  name: string;
  value: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>
}

const Checkbox: FC<Props> = ({ text, value, name, onChange }) => {
  return (
    <div className="flex h-6 gap-3 items-center">
      <input
        id={name}
        name={name}
        type="checkbox"
        onChange={onChange}
        aria-describedby="Terms-description"
        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
      />
      <label
        htmlFor={name}
        className={`font-medium text-sm cursor-pointer ${value ? "text-black" : "text-gray-500"}`}
      >
        {text}
      </label>
    </div>
  );
};

export default Checkbox;