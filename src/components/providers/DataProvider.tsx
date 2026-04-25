'use client';
import React, { createContext, ReactNode, useState, useEffect } from 'react';
import {
  accountList,
  allBranches,
  allUsers,
  payoutsList,
  TerminalList,
} from '../../app/arrays/usecontextData';

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  price: number;
  tax: number;
}

interface OrderSummary {
  subtotal: number;
  discount: number;

  itemDiscounts: number;
  tax: number;
  total: number;
}

interface ContextType {
  toggle: boolean;
  setToggle: (toggle: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (sidebarOpen: boolean) => void;
  layoutMode: 'navbar' | 'sidebar';
  setLayoutMode: (mode: 'navbar' | 'sidebar') => void;
  isLayoutLoaded: boolean;
  link: string;
  setLinks: (link: string) => void;
  programs: any;
  setPrograms: (programs: any) => void;
  programDays: any;
  setProgramDays: (programDays: any) => void;
  isCashBack: boolean;
  setIsCashBack: (isCashBack: boolean) => void;
  isLoyaltyPoints: boolean;
  setIsLoyaltyPoints: (isLoyaltyPoints: boolean) => void;
  terminals: any;
  setTerminals: (terminals: any) => void;
  accounts: any;
  setAccounts: (accounts: any) => void;
  branches: any;
  setBranches: (branches: any) => void;
  users: any;
  setUsers: (users: any) => void;
  itemSelected: any;
  setItemSelected: (itemSelected: any) => void;
  data: any;
  setData: (data: any) => void;
  savedItems: any;
  setSavedItems: (savedItems: any) => void;
  payouts: any;
  setPayouts: (payouts: any) => void;
  isDiscounts: boolean;
  setIsDiscounts: (isDiscounts: boolean) => void;
  isGiftCards: boolean;
  setIsGiftCards: (isGiftCards: boolean) => void;
  dateRangeValue: {
    startDate: Date | null;
    endDate: Date | null;
  };
  setDateRangeValue: (value: {
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
  invoiceItems: InvoiceItem[];
  setInvoiceItems: React.Dispatch<React.SetStateAction<InvoiceItem[]>>;
  orderSummary: OrderSummary;
  setOrderSummary: React.Dispatch<React.SetStateAction<OrderSummary>>;
  selectedPaymentMethod: string;
  setSelectedPaymentMethod: (method: string) => void;
  paymentAmount: number;
  setPaymentAmount: (amount: number) => void;
  activeSidebar: string;
  setActiveSidebar: (sidebar: string) => void;
}

interface Children {
  children: ReactNode;
}

const ContextData = createContext<ContextType | null>(null);

const DataProvider: React.FC<Children> = ({ children }) => {
  // Initialize layoutMode with default value for SSR
  const [layoutMode, setLayoutMode] = useState<'navbar' | 'sidebar'>('sidebar');

  // Track if layout has been loaded from localStorage
  const [isLayoutLoaded, setIsLayoutLoaded] = useState(false);

  // Initialize layout from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('potta_layoutMode');
      if (saved) {
        setLayoutMode(saved as 'navbar' | 'sidebar');
      }
    }
    setIsLayoutLoaded(true);
  }, []);

  // Save layoutMode to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && isLayoutLoaded) {
      localStorage.setItem('potta_layoutMode', layoutMode);
    }
  }, [layoutMode, isLayoutLoaded]);

  // Custom setter for layoutMode that also saves to localStorage
  const handleSetLayoutMode = (mode: 'navbar' | 'sidebar') => {
    setLayoutMode(mode);
    if (typeof window !== 'undefined' && isLayoutLoaded) {
      localStorage.setItem('potta_layoutMode', mode);
    }
  };

  const [toggle, setToggle] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [link, setLinks] = useState<string>('');
  const [programs, setPrograms] = useState<any>([]);
  const [programDays, setProgramDays] = useState<any>([]);
  const [itemSelected, setItemSelected] = useState<any>('cart');
  const [data, setData] = useState<any>([]);
  const [savedItems, setSavedItems] = useState<any>([]);
  const [isCashBack, setIsCashBack] = useState<boolean>(true);
  const [isLoyaltyPoints, setIsLoyaltyPoints] = useState<boolean>(false);
  const [isDiscounts, setIsDiscounts] = useState<boolean>(false);
  const [isGiftCards, setIsGiftCards] = useState<boolean>(false);
  const [terminals, setTerminals] = useState(TerminalList);
  const [accounts, setAccounts] = useState(accountList);
  const [branches, setBranches] = useState(allBranches);
  const [users, setUsers] = useState(allUsers);
  const [payouts, setPayouts] = useState(payoutsList);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>('cash');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [activeSidebar, setActiveSidebar] = useState<string>('default');

  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    subtotal: 0,
    discount: 0,
    itemDiscounts: 0,
    tax: 0,
    total: 0,
  });

  const [dateRangeValue, setDateRangeValue] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    {
      id: 1,
      description: '',
      quantity: 0,
      price: 0,
      tax: 0,
    },
  ]);

  return (
    <ContextData.Provider
      value={{
        toggle,
        setToggle,
        sidebarOpen,
        setSidebarOpen,
        layoutMode,
        setLayoutMode: handleSetLayoutMode,
        isLayoutLoaded,
        link,
        setLinks,
        programs,
        setPrograms,
        programDays,
        setProgramDays,
        isCashBack,
        setIsCashBack,
        isLoyaltyPoints,
        setIsLoyaltyPoints,
        terminals,
        setTerminals,
        accounts,
        setAccounts,
        branches,
        setBranches,
        users,
        setUsers,
        payouts,
        setPayouts,
        dateRangeValue,
        setDateRangeValue,
        invoiceItems,
        setInvoiceItems,
        isDiscounts,
        setIsDiscounts,
        isGiftCards,
        setIsGiftCards,
        data,
        setData,
        savedItems,
        setSavedItems,
        itemSelected,
        setItemSelected,
        orderSummary,
        setOrderSummary,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
        paymentAmount,
        setPaymentAmount,
        activeSidebar,
        setActiveSidebar,
      }}
    >
      {children}
    </ContextData.Provider>
  );
};

export { ContextData, DataProvider };
