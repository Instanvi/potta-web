import { FC } from "react";
import "./button.css"

interface Props {
  value: string;
  icon?: string;
  color?: "blue" | "red" | "gray";
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: "submit" | "reset" | "button";
}

const Button: FC<Props> = ({
  icon,
  type,
  value,
  color,
  onClick,
  disabled,
  fullWidth
}) => {

  const getColor = (color?: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-500"
      case "red":
        return "bg-red-500"
      case "gray":
        return "bg-gray-100"
      default:
        return "bg-[#237804]"
    }
  }

  return (
    <button type={type} disabled={disabled} className={`btn ${color === "gray" ? "text-black hover:bg-slate-200" : "text-white"} ${getColor(color)} hover:opacity-80 ${fullWidth ? "w-full" : ""} pl-4 pr-6 -pt-0.5 py-2.5 flex space-x-2 justify-center`} onClick={onClick}>
      <i className={`ri-${icon}-line icon mr-2`} />
      {value}
    </button>
  );
};

export default Button;
