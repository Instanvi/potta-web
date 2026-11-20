// app/about/layout.tsx
import React from 'react';
import ExpensesLayout from '../../layout';

const BudgetIDLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ExpensesLayout>
            {children}
        </ExpensesLayout>
    );
};
export default BudgetIDLayout;