export interface Account {

    uuid: string;


    branchId: string;


    createdAt: string;


    createdBy: string;

    updatedBy: string | null;


    deletedAt: string | null;

    updatedAt: string;
    accountId: string;
    name: string;
    type: string;
    currency: string;

    openingBalance: string;

    description: string | null;
    status: string;
    code?: any;
    parentAccountId: string | null;
    subAccounts?: Account[];
}


export interface ohadaAccount {
    uuid: string,
    code: string,
    name: string,
    children: ohadaAccount[],
}
