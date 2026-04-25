import { usePathname } from "next/navigation";
import {
  SidebarsAccounts,
  SidebarsBankAccounts,
  SidebarsExpenses,
  SidebarsFiles,
  SidebarsHome,
  SidebarsInvoicing,
  SidebarsPayment,
  SidebarsPayroll,
  SidebarsPOS,
  SidebarsReports,
  SidebarsSettings,
  SidebarsTaxation,
  SidebarsTreasury,
  SidebarsVoucher,
} from "./components/subsidebars";

const Sidebars = () => {
  const pathname = usePathname();
  const str = pathname.split("/");

  return (
    <>
      {str[1] == "" && <SidebarsHome />}
      {str[1] == undefined && <SidebarsPayment />}
      {str[1] == "payments" && <SidebarsPayment />}
      {str[1] == "account_payables" && <SidebarsExpenses />}
      {str[1] == "account_receivables" && <SidebarsInvoicing />}
      {str[1] === "pos" && <SidebarsPOS />}
      {str[1] == "taxation" && <SidebarsTaxation />}
      {str[1] == "files" && <SidebarsFiles />}
      {str[1] == "vouchers" && <SidebarsVoucher />}
      {str[1] == "vendors" && <SidebarsVoucher />}
      {str[1] == "payroll" && <SidebarsPayroll />}
      {str[1] == "accounting" && <SidebarsAccounts />}
      {str[1] == "reports" && <SidebarsReports />}
      {str[1] == "bank-accounts" && <SidebarsBankAccounts />}
      {str[1] == "treasury" && <SidebarsTreasury />}
      {str[1] == "settings" && <SidebarsSettings />}
    </>
  );
};

export default Sidebars;
