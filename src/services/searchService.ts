import axios from '../../config/axios.config';

// Entity types enum matching the backend
export enum SearchEntityType {
  CUSTOMER = 'customer',
  INVOICE = 'invoice',
  EMPLOYEE = 'employee',
  VENDOR = 'vendor',
  PRODUCT = 'product',
  TRANSACTION = 'transaction',
  PURCHASE_ORDER = 'purchase_order',
  CREDIT_NOTE = 'credit_note',
  SALES_RECEIPT = 'sales_receipt',
  VOUCHER = 'voucher',
  BUDGET = 'budget',
  DEDUCTION = 'deduction',
  SHIFT = 'shift',
  PAID_TIME_OFF = 'paid_time_off',
  RISK_POLICY = 'risk_policy',
  ASSET = 'asset',
  BANK_ACCOUNT = 'bank_account',
  ORGANIZATION = 'organization',
  PRODUCT_CATEGORY = 'product_category',
}

// Types for the search API
export interface SearchRequest {
  query: string;
  entityTypes?: string[];
  filters?: {
    dateRange?: {
      from: string;
      to: string;
    };
    status?: string[];
    amountRange?: {
      min: number;
      max: number;
    };
  };
  pagination?: {
    page: number;
    limit: number;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  fuzzy?: boolean;
  highlight?: boolean;
  minScore?: number;
  fields?: string[];
  facets?: boolean;
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  path: string;
  priority?: 'high' | 'medium' | 'low';
  score?: number;
  highlights?: string[];
  metadata?: Record<string, any>;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  aggregations?: {
    entityTypes?: Record<string, number>;
    [key: string]: any;
  };
  query: string;
  took: number;
}

export interface SuggestionsRequest {
  query: string;
  limit?: number;
}

export interface SuggestionsResponse {
  suggestions: string[];
}

export interface FacetsResponse {
  facets: Record<string, Record<string, number>>;
}

class SearchService {
  private basePath = '/search';

  /**
   * Perform global search across all entities
   */
  async globalSearch(
    request: SearchRequest,
    orgId: string,
    locationContextId?: string
  ): Promise<SearchResponse> {
    try {
      const response = await axios.post(`${this.basePath}/global`, request, {
        params: {
          orgId,
          ...(locationContextId && { locationContextId }),
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error in global search:', error);
      throw error;
    }
  }

  /**
   * Get search suggestions for auto-complete
   */
  async getSuggestions(
    request: SuggestionsRequest,
    orgId: string
  ): Promise<SuggestionsResponse> {
    try {
      const params = new URLSearchParams({
        query: request.query,
        orgId,
        ...(request.limit && { limit: request.limit.toString() }),
      });

      const response = await axios.get(
        `${this.basePath}/suggestions?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      throw error;
    }
  }

  /**
   * Get available search facets and their counts
   */
  async getFacets(orgId: string): Promise<FacetsResponse> {
    try {
      const response = await axios.get(`${this.basePath}/facets`, {
        params: { orgId },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting search facets:', error);
      throw error;
    }
  }

  /**
   * Transform search results to match the component's expected format
   */
  transformSearchResults(results: SearchResult[]): Array<{
    id: string;
    type: string;
    title: string;
    subtitle: string;
    path: string;
    priority?: 'high' | 'medium' | 'low';
  }> {
    return results.map((result) => ({
      id: result.id,
      type: result.type,
      title: result.title,
      subtitle: result.subtitle,
      path: result.path,
      priority: result.priority || 'medium',
    }));
  }

  /**
   * Map filter options to API entity types
   */
  mapEntityTypesToAPI(filterOptions: {
    entities: string[];
    itemTypes: string[];
    transactionType: string[];
  }): string[] {
    const entityTypeMap: Record<string, SearchEntityType> = {
      // Contact entities
      Customers: SearchEntityType.CUSTOMER,
      'Vendors (Suppliers)': SearchEntityType.VENDOR,
      Employees: SearchEntityType.EMPLOYEE,
      Partners: SearchEntityType.CUSTOMER, // Map to customer for now
      'Leads/Prospects': SearchEntityType.CUSTOMER, // Map to customer for now
      'Other Contacts': SearchEntityType.CUSTOMER, // Map to customer for now

      // Product entities
      'Inventory Items': SearchEntityType.PRODUCT,
      'Non-Inventory Items': SearchEntityType.PRODUCT,
      'Service Items': SearchEntityType.PRODUCT,
      'Assembly Items': SearchEntityType.PRODUCT,
      'Kit/Package Items': SearchEntityType.PRODUCT,
      'Discount Items': SearchEntityType.PRODUCT,
      'Markup Items': SearchEntityType.PRODUCT,
      'Gift Certificates': SearchEntityType.VOUCHER,
      'Deferred Revenue Items': SearchEntityType.PRODUCT,
      'Expense Items': SearchEntityType.TRANSACTION,

      // Transaction entities
      'Sales Order': SearchEntityType.TRANSACTION,
      Invoice: SearchEntityType.INVOICE,
      'Cash Sale': SearchEntityType.SALES_RECEIPT,
      'Credit Memo': SearchEntityType.CREDIT_NOTE,
      'Customer Payment': SearchEntityType.TRANSACTION,
      'Estimate/Quote': SearchEntityType.INVOICE, // Map to invoice
      'Purchase Order': SearchEntityType.PURCHASE_ORDER,
      'Vendor Bill': SearchEntityType.TRANSACTION,
      'Vendor Credit': SearchEntityType.CREDIT_NOTE,
      'Vendor Payment (Bill Payment)': SearchEntityType.TRANSACTION,
      'Expense Report': SearchEntityType.TRANSACTION,
      'Inventory Adjustment': SearchEntityType.TRANSACTION,
      'Inventory Transfer': SearchEntityType.TRANSACTION,
      'Journal Entry': SearchEntityType.TRANSACTION,
      Deposit: SearchEntityType.TRANSACTION,
      Withdrawal: SearchEntityType.TRANSACTION,
      'Transfer Funds': SearchEntityType.TRANSACTION,
      'Credit Card Charge': SearchEntityType.TRANSACTION,
      'Bank Reconciliation': SearchEntityType.TRANSACTION,
      'Payroll Run': SearchEntityType.TRANSACTION,

      // Other entities
      Budget: SearchEntityType.BUDGET,
      'Product Category': SearchEntityType.PRODUCT_CATEGORY,
    };

    const allSelectedTypes = [
      ...filterOptions.entities,
      ...filterOptions.itemTypes,
      ...filterOptions.transactionType,
    ];

    return allSelectedTypes
      .map((type) => entityTypeMap[type])
      .filter(Boolean) // Remove undefined mappings
      .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
  }
}

export const searchService = new SearchService();
export default searchService;
