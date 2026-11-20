import { FC, ReactNode } from 'react';
import { NextUIProvider } from '@nextui-org/react';

interface INextUiProvider {
  children:ReactNode
}
const NextUiProvider: FC<INextUiProvider> = ({ children }) => {
    return <NextUIProvider>{children}</NextUIProvider>;
}

export default NextUiProvider
