# Risk Management System v2

This document outlines the updated Risk Management system that integrates with the new v2 API endpoints.

## Overview

The Risk Management system has been completely updated to work with the new `/api/risk-management/policies` API endpoints. The system provides comprehensive risk policy management with advanced rule configuration, real-time monitoring, and flexible action handling.

## API Integration

### Endpoints

- `POST /api/risk-management/policies` - Create a new risk policy
- `GET /api/risk-management/policies` - List risk policies (paginated)
- `GET /api/risk-management/policies/{id}` - Get a specific risk policy
- `PATCH /api/risk-management/policies/{id}` - Update a risk policy
- `DELETE /api/risk-management/policies/{id}` - Delete a risk policy
- `PATCH /api/risk-management/policies/{id}/enable` - Enable a risk policy
- `PATCH /api/risk-management/policies/{id}/disable` - Disable a risk policy

### Key Features

- **Pagination Support**: Efficient data loading with configurable page sizes
- **Advanced Filtering**: Search by name, category, severity, and transaction types
- **Real-time Updates**: React Query integration for automatic cache invalidation
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Data Models

### RiskPolicy

```typescript
interface RiskPolicy {
  uuid: string;
  orgId: string;
  createdAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  updatedAt: string;
  name: string;
  description: string;
  category: RiskCategory;
  transactionTypes: TransactionType[];
  severity: RiskSeverity;
  enabled: boolean;
  scope: Record<string, any>;
  submissionRequirements: Record<string, any> | null;
  budgetId: string | null;
  rules?: RiskRule[];
  actions?: RiskAction[];
}
```

### RiskRule

```typescript
interface RiskRule {
  operator: 'AND' | 'OR';
  conditions: RiskCondition[];
  actions: RiskAction[];
}
```

### RiskCondition

```typescript
interface RiskCondition {
  field: string;
  operator: RiskOperator;
  value: any;
}
```

### RiskAction

```typescript
interface RiskAction {
  type: RiskActionType;
  params: Record<string, any>;
}
```

## Enums

### RiskCategory

- `INTERNAL` - Internal risk policies
- `EXTERNAL` - External risk policies
- `LIQUIDITY` - Liquidity risk policies
- `COMPLIANCE` - Compliance risk policies
- `OPERATIONAL` - Operational risk policies

### RiskSeverity

- `LOW` - Low severity risks
- `MEDIUM` - Medium severity risks
- `HIGH` - High severity risks
- `CRITICAL` - Critical severity risks

### TransactionType

- `SALES_ORDER` - Sales order transactions
- `INVOICE` - Invoice transactions
- `VENDOR_BILL` - Vendor bill transactions
- `PAYMENT` - Payment transactions
- `EXPENSE` - Expense transactions
- `PURCHASE_ORDER` - Purchase order transactions

### RiskOperator

- `EQUALS` - Equal to
- `NOT_EQUALS` - Not equal to
- `GREATER_THAN` - Greater than
- `LESS_THAN` - Less than
- `GREATER_THAN_OR_EQUAL` - Greater than or equal to
- `LESS_THAN_OR_EQUAL` - Less than or equal to
- `CONTAINS` - Contains
- `NOT_CONTAINS` - Does not contain
- `IN` - In list
- `NOT_IN` - Not in list
- `IS_NULL` - Is null
- `IS_NOT_NULL` - Is not null

### RiskActionType

- `BLOCK` - Block the transaction
- `APPROVE` - Approve the transaction
- `NOTIFY` - Send notification
- `FLAG` - Flag for review
- `REQUIRE_APPROVAL` - Require approval
- `ESCALATE` - Escalate to higher authority

## Components

### RiskPolicyTable

Main component for displaying risk policies in a grid layout with:

- Search functionality
- Policy cards with severity indicators
- Category and status badges
- Action menus (View, Edit, Enable/Disable, Delete)
- Real-time data updates

### CreateRiskPolicyModal

Comprehensive modal for creating and editing risk policies with:

- Basic information form (name, description, category, severity)
- Transaction type selection
- Dynamic rule builder
- Condition and action configuration
- Real-time validation
- Form state management

### ViewRiskPolicyModal

Detailed view modal with:

- Two-panel layout (overview and detailed rules)
- Policy metadata display
- Rule breakdown with conditions and actions
- Visual indicators for severity and status
- Transaction type information

### DeleteRiskPolicyModal

Confirmation modal for policy deletion with:

- Policy information display
- Warning messages
- Impact assessment
- Confirmation actions

## Hooks

### useGetRiskPolicies

Fetches risk policies with filtering and pagination support.

### useGetRiskPolicy

Fetches a single risk policy by ID.

### useCreateRiskPolicy

Creates a new risk policy with automatic cache invalidation.

### useUpdateRiskPolicy

Updates an existing risk policy with optimistic updates.

### useDeleteRiskPolicy

Deletes a risk policy with cache cleanup.

### useEnableRiskPolicy / useDisableRiskPolicy

Toggles policy enabled/disabled status.

## Field Configuration

The system supports various field types for risk conditions:

### Financial Fields

- `invoice.invoiceTotal` - Invoice total amount
- `invoice.discountRate` - Discount rate percentage
- `invoice.taxRate` - Tax rate percentage
- `invoice.paymentTerms` - Payment terms in days

### Transaction Fields

- `invoice.lineItemsCount` - Number of line items
- `payment.method` - Payment method
- `transaction.dayOfWeek` - Day of the week
- `transaction.isWeekend` - Weekend flag

### Entity Fields

- `vendor.status` - Vendor status
- `vendor.kycStatus` - Vendor KYC status

## Integration with Settings

The risk management system is integrated into the main settings page at `/settings/policies`. When the "Risk Policies" tab is selected, the system automatically switches to the new `RiskPolicyTable` component, providing a seamless user experience.

## Usage Examples

### Creating a Risk Policy

```typescript
const createPolicy = useCreateRiskPolicy();

const newPolicy = {
  name: 'High Value Transaction Review',
  description: 'Requires review for transactions over 500,000 XAF',
  category: RiskCategory.INTERNAL,
  transactionTypes: [TransactionType.INVOICE, TransactionType.VENDOR_BILL],
  severity: RiskSeverity.MEDIUM,
  enabled: true,
  rules: [
    {
      operator: 'AND',
      conditions: [
        {
          field: 'invoice.invoiceTotal',
          operator: RiskOperator.GREATER_THAN,
          value: 500000,
        },
      ],
      actions: [
        {
          type: RiskActionType.REQUIRE_APPROVAL,
          params: { approverLevel: 'manager' },
        },
      ],
    },
  ],
};

createPolicy.mutate(newPolicy);
```

### Filtering Policies

```typescript
const { data } = useGetRiskPolicies({
  search: 'high value',
  category: RiskCategory.INTERNAL,
  severity: RiskSeverity.HIGH,
  enabled: true,
  page: 1,
  limit: 20,
});
```

## Best Practices

1. **Rule Complexity**: Keep rules simple and focused on specific risk scenarios
2. **Severity Levels**: Use appropriate severity levels based on business impact
3. **Transaction Types**: Select relevant transaction types for each policy
4. **Testing**: Test policies in a staging environment before enabling in production
5. **Monitoring**: Regularly review policy effectiveness and adjust as needed
6. **Documentation**: Maintain clear descriptions for all policies

## Error Handling

The system includes comprehensive error handling:

- API error messages are displayed to users
- Network failures are handled gracefully
- Form validation prevents invalid submissions
- Loading states provide user feedback
- Retry mechanisms for failed operations

## Performance Considerations

- **Pagination**: Large datasets are paginated for optimal performance
- **Caching**: React Query provides intelligent caching and background updates
- **Debouncing**: Search inputs are debounced to reduce API calls
- **Lazy Loading**: Components are loaded only when needed
- **Optimistic Updates**: UI updates immediately for better user experience
