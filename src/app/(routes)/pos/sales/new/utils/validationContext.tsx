"use client"
import React, { createContext, useContext, useState } from 'react';

interface ValidationContextType {
triggerTableValidation: () => Promise<boolean>;
setTriggerTableValidation: (callback: () => Promise<boolean>) => void;
}

const ValidationContext = createContext<ValidationContextType | undefined>(undefined);

export const ValidationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
const [triggerTableValidation, setTriggerTableValidation] = useState<() => Promise<boolean>>(() => Promise.resolve(true));

return (
  <ValidationContext.Provider value={{ triggerTableValidation, setTriggerTableValidation }}>
    {children}
  </ValidationContext.Provider>
);
};

export const useValidation = () => {
const context = useContext(ValidationContext);
if (!context) {
  throw new Error('useValidation must be used within a ValidationProvider');
}
return context;
};
