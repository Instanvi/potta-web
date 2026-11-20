import { 
  ExtendedApprovalRule, 
  ExtendedCondition, 
  ConditionDetail,
  FieldType 
} from '../types/approval-rule';

// Data structure for entities with both id and name
export interface EntityWithName {
  id: string;
  name: string;
}

// User interface
export interface User {
  id: string;
  name: string;
}

// Helper function to find user by ID
const findUserById = (users: User[], userId: string): string => {
  const user = users.find(u => u.id === userId);
  return user ? user.name : userId;
};

// Helper function to normalize value to EntityWithName
const normalizeToEntity = (value: string | EntityWithName): EntityWithName => {
  if (typeof value === 'object' && value !== null && 'id' in value && 'name' in value) {
    return { id: value.id, name: value.name };
  }
  return { id: String(value), name: String(value) };
};

// Find entity name from a list of entities
const findEntityName = (entities: EntityWithName[], entityId: string | EntityWithName): string => {
  if (!entityId) return '';
  
  // If entityId is already an object with name, return that name
  if (typeof entityId === 'object' && entityId !== null && 'name' in entityId) {
    return entityId.name;
  }
  
  // Otherwise, look up the name in our entities list
  const id = String(entityId);
  const entity = entities.find(e => e.id === id);
  return entity ? entity.name : `Entity ${id.substring(0, 8)}`;
};

// Format condition value based on its field type and value format
const formatValue = (
  field: string, 
  value: any, 
  entities: EntityWithName[] = []
): string | string[] => {
  if (value === null || value === undefined) return '';
  
  // Handle array values (like from "in" or "not_in" operators)
  if (Array.isArray(value)) {
    return value.map(v => formatValue(field, v, entities) as string);
  }
  
  // Handle single values based on field type
  switch(field) {
    case FieldType.VENDOR:
    case FieldType.CUSTOMER:
    case FieldType.INVENTORY_ITEM:
      return findEntityName(entities, value);
      
    case FieldType.PAYMENT_TYPE:
      return typeof value === 'string' 
        ? value.charAt(0).toUpperCase() + value.slice(1)
        : String(value);
        
    case FieldType.MATCHED_TO_PURCHASE_ORDER:
      return value === 'true' || value === true ? 'Yes' : 'No';
      
    default:
      return String(value);
  }
};

// Convert entity IDs to display names in a condition
const formatConditionValues = (
  condition: ExtendedCondition, 
  users: User[], 
  vendors: EntityWithName[] = [], 
  customers: EntityWithName[] = [], 
  inventoryItems: EntityWithName[] = []
): ExtendedCondition => {
  const formattedCondition = {
    ...condition,
    conditions: condition.conditions?.map(condDetail => {
      // Create a copy of the condition detail
      const formattedDetail = { ...condDetail };
      
      // Replace IDs with names for specific field types
      switch(formattedDetail.field) {
        case FieldType.VENDOR:
          formattedDetail.value = formatValue(formattedDetail.field, formattedDetail.value, vendors);
          break;
        
        case FieldType.CUSTOMER:
          formattedDetail.value = formatValue(formattedDetail.field, formattedDetail.value, customers);
          break;
          
        case FieldType.INVENTORY_ITEM:
          formattedDetail.value = formatValue(formattedDetail.field, formattedDetail.value, inventoryItems);
          break;
        
        case FieldType.PAYMENT_TYPE:
          formattedDetail.value = formatValue(formattedDetail.field, formattedDetail.value);
          break;
        
        case FieldType.MATCHED_TO_PURCHASE_ORDER:
          formattedDetail.value = formatValue(formattedDetail.field, formattedDetail.value);
          break;
      }
      
      return formattedDetail;
    }) || [],
    
    // Format actions to show user names instead of IDs
    actions: condition.actions?.map(action => {
      return {
        ...action,
        userIds: action.userIds.map(userId => findUserById(users, userId))
      };
    }) || [],
  };
  
  return formattedCondition;
};

// Create a summary-friendly version of the approval rule
export const prepareSummaryData = (
  formData: ExtendedApprovalRule, 
  users: User[],
  vendors: EntityWithName[] = [],
  customers: EntityWithName[] = [],
  inventoryItems: EntityWithName[] = []
): ExtendedApprovalRule => {
  return {
    ...formData,
    rules: formData.rules.map(rule => formatConditionValues(rule, users, vendors, customers, inventoryItems))
  };
};

// Helper to safely extract entity data from condition values
const extractEntityFromValue = (value: any): EntityWithName | null => {
  if (!value) return null;
  
  // Handle object with id and name
  if (typeof value === 'object' && value !== null && 'id' in value && 'name' in value) {
    return { id: value.id, name: value.name };
  }
  // For string IDs, create a placeholder entity
  else if (typeof value === 'string' || typeof value === 'number') {
    return { id: String(value), name: String(value) };
  }
  
  return null;
};

// Extract entity collections from form data
export const extractEntityLists = (formData: ExtendedApprovalRule): {
  vendors: EntityWithName[];
  customers: EntityWithName[];
  inventoryItems: EntityWithName[];
} => {
  const vendors: EntityWithName[] = [];
  const customers: EntityWithName[] = [];
  const inventoryItems: EntityWithName[] = [];
  
  // Helper to add entity to the appropriate list if not already present
  const addEntity = (list: EntityWithName[], entity: EntityWithName | null) => {
    if (entity && !list.some(e => e.id === entity.id)) {
      list.push(entity);
    }
  };

  // Go through all conditions and extract entities
  formData.rules.forEach(rule => {
    if (!rule.conditions) return;
    
    rule.conditions.forEach(condition => {
      if (!condition.field || !condition.value) return;
      
      // Handle array values
      if (Array.isArray(condition.value)) {
        condition.value.forEach(val => {
          const entity = extractEntityFromValue(val);
          
          if (condition.field === FieldType.VENDOR) {
            addEntity(vendors, entity);
          } else if (condition.field === FieldType.CUSTOMER) {
            addEntity(customers, entity);
          } else if (condition.field === FieldType.INVENTORY_ITEM) {
            addEntity(inventoryItems, entity);
          }
        });
      }
      // Handle single values 
      else {
        const entity = extractEntityFromValue(condition.value);
        
        if (condition.field === FieldType.VENDOR) {
          addEntity(vendors, entity);
        } else if (condition.field === FieldType.CUSTOMER) {
          addEntity(customers, entity);
        } else if (condition.field === FieldType.INVENTORY_ITEM) {
          addEntity(inventoryItems, entity);
        }
      }
    });
  });
  
  return { vendors, customers, inventoryItems };
};