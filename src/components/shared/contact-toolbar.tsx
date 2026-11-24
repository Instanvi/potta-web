'use client';

import { createContext, useContext, type ReactNode } from 'react';

const ContactToolbarStartContext = createContext<ReactNode>(null);

/** Lets Contacts page inject Customers/Vendors switch into the list toolbar row. */
export const ContactToolbarStartProvider = ContactToolbarStartContext.Provider;

export function useContactToolbarStart() {
  return useContext(ContactToolbarStartContext);
}
