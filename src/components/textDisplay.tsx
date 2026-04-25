
import React, { ReactNode } from "react";
type Props = {
  name: string;
  value: ReactNode;
  height: boolean;
};

const Text:React.FC<Props> = ({ name, value , height}) => {
  return (
    <div className={`w-full `}>
      <span className="mb-3 text-gray-900 font-medium">{name}</span>
      <div  className={`w-full ${height ? 'py-1.5' : 'py-2.5'} px-4 mt-2`}>{value}</div>
    </div>
  );
};

export default Text;
