import axios from 'config/axios.config';
import { useQuery } from '@tanstack/react-query';
import { PurchaseOrderDetails } from '../types';

interface UseGetVendorPurchaseOrderProps {
  token: string;
  orgId?: string;
  locationId?: string;
  enabled: boolean;
}

export default function useGetVendorPurchaseOrder({
  token,
  orgId,
  locationId,
  enabled,
}: UseGetVendorPurchaseOrderProps) {
  return useQuery({
    queryKey: ['vendor-purchase-order', token, orgId, locationId],
    queryFn: async (): Promise<PurchaseOrderDetails> => {
      try {
        const response = await axios.get('/vendor-portal/purchase-order', {
          params: {
            token: token,
            ...(orgId && { orgId }),
            ...(locationId && { locationId }),
          },
        });

        // Debug: Log the response data to see the actual structure
        console.log('Vendor Portal API Response:', response.data);

        // Check if the response has the expected structure
        if (!response.data || typeof response.data !== 'object') {
          throw new Error('Invalid response format');
        }

        // Check if the response indicates an invalid token
        if (response.data.error || response.data.message === 'Invalid token') {
          throw new Error('Invalid or expired token');
        }

        // Handle the new API structure where data is nested in response.data.data
        const apiData = response.data.data || response.data;

        // Check if we have the nested structure (response.data.data)
        if (response.data.success && response.data.data) {
          const purchaseOrderData = response.data.data;

          // Validate that we have the essential fields
          if (
            !purchaseOrderData.orderNumber ||
            !purchaseOrderData.purchaseOrderId
          ) {
            throw new Error('Invalid purchase order data structure');
          }

          // Transform the nested structure to match our expected format
          return {
            success: response.data.success,
            message:
              response.data.message ||
              'Purchase order details retrieved successfully',
            purchaseOrder: {
              uuid: purchaseOrderData.uuid,
              orderNumber: purchaseOrderData.orderNumber,
              orderDate: purchaseOrderData.orderDate,
              requiredDate: purchaseOrderData.requiredDate,
              shipDate: purchaseOrderData.shipDate,
              orderTotal: purchaseOrderData.orderTotal,
              paymentTerms: purchaseOrderData.paymentTerms,
              paymentMethod: purchaseOrderData.paymentMethod,
              status: purchaseOrderData.status,
              notes: purchaseOrderData.notes,
              shippingAddress: purchaseOrderData.shippingAddress,
            },
            lineItems: purchaseOrderData.lineItems || [],
            vendor: purchaseOrderData.salePerson || purchaseOrderData.vendor,
          };
        }

        // Check for old structure with direct fields
        if (apiData.orderNumber && (apiData.purchaseOrderId || apiData.uuid)) {
          // Transform old structure to new structure
          return {
            success: true,
            message: 'Purchase order details retrieved successfully',
            purchaseOrder: {
              uuid: apiData.uuid || apiData.purchaseOrderId,
              orderNumber: apiData.orderNumber,
              orderDate: apiData.orderDate,
              requiredDate: apiData.requiredDate,
              shipDate: apiData.shipDate,
              orderTotal: apiData.orderTotal,
              paymentTerms: apiData.paymentTerms,
              paymentMethod: apiData.paymentMethod,
              status: apiData.status,
              notes: apiData.notes,
              shippingAddress: apiData.shippingAddress,
            },
            lineItems: apiData.lineItems || [],
            vendor: apiData.vendor || apiData.salePerson,
          };
        }

        throw new Error('Invalid purchase order data structure');
      } catch (error: any) {
        // Handle specific error cases
        if (error.response?.status === 401) {
          throw new Error('Invalid or expired token');
        }
        if (error.response?.status === 404) {
          throw new Error('Purchase order not found');
        }
        if (error.message) {
          throw new Error(error.message);
        }
        throw new Error('Failed to fetch purchase order');
      }
    },
    enabled: enabled && !!token,
    retry: false, // Don't retry on failure
  });
}
