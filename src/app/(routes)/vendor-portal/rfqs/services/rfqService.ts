import axios from 'config/axios.config';
import {
  RFQData,
  ProformaInvoiceRequest,
  ProformaInvoiceResponse,
} from '../types';

class RFQService {
  private basePath = '/vendor-portal/rfqs';

  /**
   * Get RFQ details and products for vendor
   * Returns complete RFQ details including requirements, specifications, and product list
   */
  async getRFQDetails(
    rfqId: string,
    token: string,
    vendorId: string
  ): Promise<RFQData> {
    try {
      const response = await axios.get(`${this.basePath}/${rfqId}`, {
        params: {
          token,
          vendorId,
        },
      });

      // Handle new API response format with nested data
      if (response.data?.data) {
        return response.data.data;
      }

      // Fallback to old format
      return response.data;
    } catch (error) {
      console.error('Error fetching RFQ details:', error);
      throw error;
    }
  }

  /**
   * Create proforma invoice for RFQ
   * Allows vendors to create proforma invoices using vendor portal token
   */
  async createProformaInvoice(
    rfqId: string,
    token: string,
    vendorId: string,
    data: ProformaInvoiceRequest
  ): Promise<ProformaInvoiceResponse> {
    try {
      const response = await axios.post(
        `${this.basePath}/${rfqId}/proforma-invoices`,
        data,
        {
          params: {
            token,
            vendorId,
          },
        }
      );

      // Handle new API response format with nested data
      if (response.data?.data) {
        return response.data.data;
      }

      // Fallback to old format
      return response.data;
    } catch (error) {
      console.error('Error creating proforma invoice:', error);
      throw error;
    }
  }
}

export const rfqService = new RFQService();
export default rfqService;
