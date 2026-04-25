import { FC } from "react";
import { Toaster } from "react-hot-toast";

const Toast: FC = () => {
  return <Toaster position="top-right" reverseOrder={false} />;
};

export default Toast;
