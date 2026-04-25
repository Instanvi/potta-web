
export type CustomerFilter = {
  limit?: number;
  page?: number;
  sortBy?: 'updatedAt:ASC' | 'createdAt:ASC' | 'updatedAt:DESC' | 'createdAt:DES';
  search?: string;
};

export type Customer ={

    uuid: string,
    createdAt: string | null,
    createdBy: string | null,
    updatedBy: string | null,
    deletedAt: string | null,
    updatedAt: string | null,
    customerId: string | null,
    type: string ,
    firstName: string | null,
    lastName: string | null,
    gender: string | null,
    creditLimit: number,
    phone: string | null,
    email: string | null,
    contactPerson: string | null,
    taxId: string | null,
    status: string | null,
    address: {
      uuid: string | null,
      createdAt: string | null,
      createdBy: null,
      updatedBy: null,
      deletedAt: null,
      updatedAt: string | null,
      address: string | null,
      city: string | null,
      state: string | null,
      country: string | null,
      postalCode: string | null,
      latitude: number,
      longitude: number,
      geospatialLocation:string | null
    }

}

export interface CustomerResponse {
  data: Customer[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
}
