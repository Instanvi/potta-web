// Base types that are shared across reports
export interface ReportPeriod {
  startDate: string;
  endDate: string;
}

export interface BaseItem {
  itemName: string;
  itemId: string;
}

// Summary Report types
export interface SummaryItem extends BaseItem {
  category: string;
  openingStock: number;
  stockReceived: number;
  stockSold: number;
  closingStock: number;
  stockValuation: number;
}

export interface SummaryKPIs {
  totalInventoryCost: number;
  totalUnitsInStock: number;
  inventoryTurnoverRatio: number;
}

// Valuation Report types
export interface ValuationItem extends BaseItem {
  unitCost: number;
  currentStock: number;
  totalValuation: number;
  valuationMethod: string;
  lastPurchaseDate: string;
}

export interface ValuationKPIs {
  totalInventoryValue: number;
  averageUnitCost: number;
  mostExpensiveItem: string;
  leastExpensiveItem: string;
}

// Stock Movement Report types
export interface MovementItem extends BaseItem {
  openingStock: number;
  stockReceived: number;
  stockSold: number;
  closingStock: number;
}

export interface MovementKPIs {
  totalReceived: number;
  totalSold: number;
  netMovement: number;
  highestMovementItem: string;
}
