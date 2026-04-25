import React from 'react';
import { XCircle } from 'lucide-react';
import moment from 'moment';

interface PurchaseOrderDetailsViewProps {
  purchaseOrderDetails: any;
  isLoading: boolean;
  error: any;
}

const PurchaseOrderDetailsView: React.FC<PurchaseOrderDetailsViewProps> = ({
  purchaseOrderDetails,
  isLoading,
  error,
}) => {
  return (
    <div className="w-full h-full bg-gray-50 p-6 overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-2xl font-medium text-gray-900 mb-2">
          Purchase Order Details
        </h3>
        <p className="text-gray-600">Review purchase order information</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading purchase order details...</div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200  p-4">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">
              Error: {error instanceof Error ? error.message : 'Unknown error'}
            </span>
          </div>
        </div>
      )}

      {purchaseOrderDetails && (
        <div className="space-y-6">
          {/* Current Status */}
          <div className="bg-white p-4 border border-gray-200 ">
            <h4 className="font-medium text-gray-900 mb-3">Current Status</h4>
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                  purchaseOrderDetails.status.toUpperCase() === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : purchaseOrderDetails.status.toUpperCase() === 'APPROVED'
                    ? 'bg-green-100 text-green-800'
                    : purchaseOrderDetails.status.toUpperCase() === 'REJECTED'
                    ? 'bg-red-100 text-red-800'
                    : purchaseOrderDetails.status.toUpperCase() === 'SHIPPED'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {purchaseOrderDetails.status.charAt(0).toUpperCase() +
                  purchaseOrderDetails.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Purchase Order Summary */}
          <div className="bg-white p-4 border border-gray-200 ">
            <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-medium">
                  {purchaseOrderDetails.orderNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vendor:</span>
                <span className="font-medium">
                  {purchaseOrderDetails.salePerson.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium">
                  XAF {Number(purchaseOrderDetails.orderTotal).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span className="font-medium">
                  {moment(purchaseOrderDetails.orderDate).format(
                    'MMM DD, YYYY'
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Required Date:</span>
                <span className="font-medium">
                  {moment(purchaseOrderDetails.requiredDate).format(
                    'MMM DD, YYYY'
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ship Date:</span>
                <span className="font-medium">
                  {moment(purchaseOrderDetails.shipDate).format('MMM DD, YYYY')}
                </span>
              </div>
            </div>
          </div>

          {/* Vendor Information */}
          <div className="bg-white p-4 border border-gray-200 ">
            <h4 className="font-medium text-gray-900 mb-3">
              Vendor Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">
                  {purchaseOrderDetails.salePerson.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">
                  {purchaseOrderDetails.salePerson.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">
                  {purchaseOrderDetails.salePerson.phone}
                </span>
              </div>
              {purchaseOrderDetails.salePerson.contactPerson && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Contact Person:</span>
                  <span className="font-medium">
                    {purchaseOrderDetails.salePerson.contactPerson}
                  </span>
                </div>
              )}
              <div className="mt-3">
                <span className="text-gray-600">Address:</span>
                <p className="text-sm mt-1 text-gray-800">
                  {purchaseOrderDetails.salePerson.address.address}
                  <br />
                  {purchaseOrderDetails.salePerson.address.city},{' '}
                  {purchaseOrderDetails.salePerson.address.state}
                  <br />
                  {purchaseOrderDetails.salePerson.address.country}{' '}
                  {purchaseOrderDetails.salePerson.address.postalCode}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white p-4 border border-gray-200 ">
            <h4 className="font-medium text-gray-900 mb-3">
              Payment Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium">
                  {purchaseOrderDetails.paymentMethod === 'BANK_TRANSFER'
                    ? 'Bank Transfer'
                    : purchaseOrderDetails.paymentMethod === 'CASH'
                    ? 'Cash'
                    : purchaseOrderDetails.paymentMethod === 'MOBILE_MONEY'
                    ? 'Mobile Money'
                    : purchaseOrderDetails.paymentMethod || 'Not specified'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Terms:</span>
                <span className="font-medium">
                  {purchaseOrderDetails.paymentTerms}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping Address:</span>
                <span className="font-medium">
                  {purchaseOrderDetails.shippingAddress}
                </span>
              </div>
              {purchaseOrderDetails.notes && (
                <div className="mt-3">
                  <span className="text-gray-600">Notes:</span>
                  <p className="text-sm mt-1 text-gray-800">
                    {purchaseOrderDetails.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white p-4 border border-gray-200 ">
            <h4 className="font-medium text-gray-900 mb-3">
              Status Timeline
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Purchase Order Created
                  </p>
                  <p className="text-xs text-gray-500">
                    {moment(purchaseOrderDetails.orderDate).format(
                      'MMM DD, YYYY at h:mm A'
                    )}
                  </p>
                </div>
              </div>
              {purchaseOrderDetails.status.toUpperCase() === 'PENDING' && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Pending Approval
                    </p>
                    <p className="text-xs text-gray-500">Awaiting approval</p>
                  </div>
                </div>
              )}
              {purchaseOrderDetails.status.toUpperCase() === 'APPROVED' && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Purchase Order Approved
                    </p>
                    <p className="text-xs text-gray-500">
                      Ready for processing
                    </p>
                  </div>
                </div>
              )}
              {purchaseOrderDetails.status.toUpperCase() === 'SHIPPED' && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Order Shipped
                    </p>
                    <p className="text-xs text-gray-500">
                      Items have been shipped
                    </p>
                  </div>
                </div>
              )}
              {purchaseOrderDetails.status.toUpperCase() === 'REJECTED' && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Purchase Order Rejected
                    </p>
                    <p className="text-xs text-gray-500">
                      Order has been rejected
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderDetailsView;
