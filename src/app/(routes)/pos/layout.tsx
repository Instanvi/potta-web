import { FC, ReactNode } from 'react';
import { Outfit } from 'next/font/google';
import './pos-till.css';

const outfit = Outfit({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-outfit',
  display: 'swap',
});

interface Props {
  children: ReactNode;
}

const POSLayout: FC<Props> = ({ children }) => {
  return (
    <div className={`${outfit.variable} pos-till h-full min-h-0 w-full overflow-hidden`}>
      <div className="relative h-full min-h-0 w-full overflow-hidden p-0">{children}</div>
    </div>
  );
};

export default POSLayout;
