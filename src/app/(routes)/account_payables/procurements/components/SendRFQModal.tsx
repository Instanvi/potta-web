'use client';
import React, { useState } from 'react';
import Button from '@potta/components/button';
import { useSendRFQ } from '../hooks/useProcurement';
import { X } from 'lucide-react';

interface SendRFQModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  rfqId: string | null;
  onSent?: () => void;
}

const SendRFQModal: React.FC<SendRFQModalProps> = ({
  open,
  setOpen,
  rfqId,
  onSent,
}) => {
  const sendRFQMutation = useSendRFQ();

  // Form state
  const [message, setMessage] = useState(
    'Please review and respond by the deadline'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rfqId) {
      alert('Invalid RFQ');
      return;
    }

    try {
      await sendRFQMutation.mutateAsync({
        id: rfqId,
        data: {
          message,
        },
      });

      setOpen(false);
      onSent?.();

      // Reset form
      setMessage('Please review and respond by the deadline');
    } catch (error) {
      console.error('Error sending RFQ:', error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Reset form
    setMessage('Please review and respond by the deadline');
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-medium text-gray-900">
              Send RFQ to Vendors
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={sendRFQMutation.isPending}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700"
              >
                Message to Vendors
              </label>
              <textarea
                id="message"
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={4}
                placeholder="Add a message for the vendors..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={sendRFQMutation.isPending}
              />
              <p className="text-xs text-gray-500">
                This message will be included in the notification sent to
                vendors.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                disabled={sendRFQMutation.isPending}
              >
                Cancel
              </button>
              <Button
                text={sendRFQMutation.isPending ? 'Sending...' : 'Send RFQ'}
                type="submit"
                disabled={sendRFQMutation.isPending}
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SendRFQModal;
