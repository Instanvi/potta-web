import { useContext } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { usePathname } from 'next/navigation';
import { ContextData } from '@potta/components/providers/DataProvider';
import SidebarProfile from './SidebarProfile';
import {
  ChartPie,
  FileText,
  HandCoins,
  Invoice,
  PiggyBank,
  Receipt,
  ShoppingBagOpen,
  ShoppingCart,
  SquaresFour,
  Storefront,
} from '@phosphor-icons/react';
import { SB_ICON, sbClass, sbWeight } from './sidebarPhosphor';

const SidebarsExpenses = () => {
  const pathname = usePathname();
  const str = pathname.split('/');
  const context = useContext(ContextData);

  const dashOn = str[1] == 'account_payables' && str[2] == undefined;
  const budgetOn = str[2] == 'budgets';
  const procParent = str[2] === 'spend-program' || str[2] === 'purchase';
  const spendOn = str[2] == 'spend-program';
  const purchaseOn = str[2] == 'purchase';
  const reimbOn = str[2] == 're-imbursements';
  const billsOn = str[2] == 'bills';
  const procureOn = str[2] == 'procurements';
  const proformaOn = str[2] == 'proforma-invoices';
  const reportsOn = str[1] == 'reports';

  return (
    <Sidebar
      backgroundColor="#F9F9F9"
      collapsedWidth="65px"
      width="200px"
      transitionDuration={500}
      collapsed={context?.toggle}
      toggled={true}
      breakPoint="md"
      className="relative z-[100] h-[100vh] !border-none !bg-[#F9F9F9] side"
    >
      <Menu className="relative h-[76vh]" closeOnClick>
        <MenuItem
          className="mt-4 font-normal"
          href="/"
          icon={
            <img src="/icons/Potta.svg" className="mt-2 h-16 w-16" alt="logo" />
          }
        >
          {' '}
        </MenuItem>
        <MenuItem
          active={dashOn}
          className="mt-8"
          href="/account_payables"
          icon={
            <SquaresFour
              size={SB_ICON}
              weight={sbWeight(dashOn)}
              className={sbClass(dashOn)}
            />
          }
        >
          <h3 className="text-md mt-[2px]">Dashboard</h3>
        </MenuItem>
        <MenuItem
          active={budgetOn}
          className=""
          href="/account_payables/budgets"
          icon={
            <PiggyBank
              size={SB_ICON}
              weight={sbWeight(budgetOn)}
              className={sbClass(budgetOn)}
            />
          }
        >
          <h3 className="text-md mt-1.5">Budget</h3>
        </MenuItem>
        <SubMenu
          label={<span className="text-md mt-1.5">Procurement</span>}
          icon={
            <Storefront
              size={SB_ICON}
              weight={sbWeight(procParent)}
              className={sbClass(procParent)}
            />
          }
          className={` ${procParent ? 'active-parent' : ''}`}
          defaultOpen={procParent}
        >
          <MenuItem
            active={spendOn}
            className=""
            href="/account_payables/spend-program"
            icon={
              <HandCoins
                size={SB_ICON}
                weight={sbWeight(spendOn)}
                className={sbClass(spendOn)}
              />
            }
          >
            <h3 className="text-md mt-1.5">Spend Program</h3>
          </MenuItem>
          <MenuItem
            active={purchaseOn}
            className=""
            href="/account_payables/purchase"
            icon={
              <ShoppingBagOpen
                size={SB_ICON}
                weight={sbWeight(purchaseOn)}
                className={sbClass(purchaseOn)}
              />
            }
          >
            <h3 className="text-md mt-1.5">Purchase</h3>
          </MenuItem>
        </SubMenu>

        <MenuItem
          active={reimbOn}
          className=""
          href="/account_payables/re-imbursements"
          icon={
            <Receipt
              size={SB_ICON}
              weight={sbWeight(reimbOn)}
              className={sbClass(reimbOn)}
            />
          }
        >
          <h3 className="text-md mt-1.5">ReImbursement</h3>
        </MenuItem>
        <MenuItem
          active={billsOn}
          className=""
          href="/account_payables/bills"
          icon={
            <Invoice
              size={SB_ICON}
              weight={sbWeight(billsOn)}
              className={sbClass(billsOn)}
            />
          }
        >
          <h3 className="text-md mt-1.5">Biils </h3>
        </MenuItem>
        <MenuItem
          active={procureOn}
          className=""
          href="/account_payables/procurements"
          icon={
            <ShoppingCart
              size={SB_ICON}
              weight={sbWeight(procureOn)}
              className={sbClass(procureOn)}
            />
          }
        >
          <h3 className="text-md mt-1.5">Procurements</h3>
        </MenuItem>
        <MenuItem
          active={proformaOn}
          className=""
          href="/account_payables/proforma-invoices"
          icon={
            <FileText
              size={SB_ICON}
              weight={sbWeight(proformaOn)}
              className={sbClass(proformaOn)}
            />
          }
        >
          <h3 className="text-md mt-1.5">Proforma Invoices</h3>
        </MenuItem>
        <MenuItem
          active={reportsOn}
          className=""
          href="/reports"
          icon={
            <ChartPie
              size={SB_ICON}
              weight={sbWeight(reportsOn)}
              className={sbClass(reportsOn)}
            />
          }
        >
          <h3 className="text-md mt-1.5">Report</h3>
        </MenuItem>
      </Menu>
      <SidebarProfile context={context} />
    </Sidebar>
  );
};
export default SidebarsExpenses;
