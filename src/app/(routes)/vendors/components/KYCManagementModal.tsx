'use client';
import React, { useState, useEffect } from 'react';
import Slider from '@potta/components/slideover';
import { VendorKYC, KYCDocument, KYCResponse } from '../utils/types';
import { vendorApi } from '../utils/api';
import { Badge } from '@potta/components/shadcn/badge';
import Button from '@potta/components/button';
import { documentsApi } from '../../pos/inventory/_utils/api';
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  FileText,
  Calendar,
  User,
  Star,
  Eye,
  Download,
  Check,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface KYCManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorId: string;
  vendorName: string;
  onKYCStatusChange?: () => void; // Callback to refresh table data
}

const KYCManagementModal: React.FC<KYCManagementModalProps> = ({
  isOpen,
  onClose,
  vendorId,
  vendorName,
  onKYCStatusChange,
}) => {
  const [kycData, setKycData] = useState<VendorKYC | null>(null);
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [signedDocumentUrls, setSignedDocumentUrls] = useState<{
    [key: string]: string;
  }>({});
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<KYCDocument | null>(
    null
  );
  const [verificationNotes, setVerificationNotes] = useState('');

  // Fetch KYC data when modal opens
  useEffect(() => {
    if (isOpen && vendorId) {
      console.log('KYC Modal: Fetching KYC data for vendor:', vendorId);
      fetchKYCData();
    }
  }, [isOpen, vendorId]);

  // Fetch signed URLs for documents when documents change
  useEffect(() => {
    const fetchSignedUrls = async () => {
      if (!documents || documents.length === 0) {
        setSignedDocumentUrls({});
        return;
      }

      setIsLoadingDocuments(true);
      try {
        const documentIds = documents.map((doc) => doc.uuid);
        const response = await documentsApi.bulkDownload(documentIds);

        // Map document IDs to signed URLs
        const urlMap: { [key: string]: string } = {};
        if (response.urls && Array.isArray(response.urls)) {
          documentIds.forEach((id, index) => {
            urlMap[id] = response.urls[index] || '';
          });
        }
        setSignedDocumentUrls(urlMap);
      } catch (error) {
        console.error('Failed to fetch signed URLs:', error);
        setSignedDocumentUrls({});
        toast.error('Failed to load document URLs');
      } finally {
        setIsLoadingDocuments(false);
      }
    };

    fetchSignedUrls();
  }, [documents]);

  const fetchKYCData = async () => {
    if (!vendorId) return;

    setIsLoading(true);
    try {
      const response: KYCResponse = await vendorApi.kyc.getStatus(vendorId);
      console.log('KYC Modal: API response:', response);
      setKycData(response.kyc);
      setDocuments(response.documents || []);
    } catch (error) {
      console.error('Failed to fetch KYC data:', error);
      // If KYC doesn't exist, set kycData to null to show initialization option
      setKycData(null);
      setDocuments([]);
      console.log(
        'KYC Modal: Set kycData to null, showing initialization option'
      );
      // Only show error toast if it's not a "not found" type error
      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        error.status !== 404
      ) {
        toast.error('Failed to load KYC information');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitializeKYC = async () => {
    if (!vendorId) return;

    setIsInitializing(true);
    try {
      const kyc = await vendorApi.kyc.initialize(vendorId);
      setKycData(kyc);
      toast.success('KYC process initialized successfully!');

      // Trigger table refresh if callback is provided
      if (onKYCStatusChange) {
        onKYCStatusChange();
      }
    } catch (error) {
      console.error('Failed to initialize KYC:', error);
      toast.error('Failed to initialize KYC process');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleVerifyDocument = async (
    documentId: string,
    status: 'APPROVED' | 'REJECTED'
  ) => {
    if (!vendorId) return;

    setIsVerifying(true);
    try {
      await vendorApi.kyc.verifyDocument(vendorId, documentId, {
        status,
        notes: verificationNotes || '',
      });

      // Update local state
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.uuid === documentId
            ? {
                ...doc,
                status,
                verificationNotes,
                verifiedAt: new Date().toISOString(),
              }
            : doc
        )
      );

      setSelectedDocument(null);
      setVerificationNotes('');
      toast.success(`Document ${status.toLowerCase()} successfully!`);
    } catch (error) {
      console.error('Failed to verify document:', error);
      toast.error('Failed to verify document');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCompleteKYC = async (status: 'APPROVED' | 'REJECTED') => {
    if (!vendorId) return;

    setIsVerifying(true);
    try {
      await vendorApi.kyc.complete(vendorId, {
        status,
        notes: verificationNotes || '',
      });

      // Update local state
      if (kycData) {
        setKycData({
          ...kycData,
          status,
          verificationNotes,
          verifiedAt: new Date().toISOString(),
        });
      }

      toast.success(`KYC ${status.toLowerCase()} successfully!`);

      // Trigger table refresh if callback is provided
      if (onKYCStatusChange) {
        onKYCStatusChange();
      }
    } catch (error) {
      console.error('Failed to complete KYC:', error);
      toast.error('Failed to complete KYC verification');
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'PENDING':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <Shield className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        color: 'bg-yellow-100 text-yellow-800',
        label: 'Pending',
      },
      IN_PROGRESS: {
        color: 'bg-blue-100 text-blue-800',
        label: 'In Progress',
      },
      APPROVED: {
        color: 'bg-green-100 text-green-800',
        label: 'Approved',
      },
      REJECTED: {
        color: 'bg-red-100 text-red-800',
        label: 'Rejected',
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        {getStatusIcon(status)}
        {config.label}
      </Badge>
    );
  };

  const getRiskLevelBadge = (riskLevel: string) => {
    const riskConfig = {
      LOW: {
        color: 'bg-green-100 text-green-800',
        label: 'Low Risk',
      },
      MEDIUM: {
        color: 'bg-yellow-100 text-yellow-800',
        label: 'Medium Risk',
      },
      HIGH: {
        color: 'bg-red-100 text-red-800',
        label: 'High Risk',
      },
    };

    const config =
      riskConfig[riskLevel as keyof typeof riskConfig] || riskConfig.LOW;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Star className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getDocumentStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        color: 'bg-yellow-100 text-yellow-800',
        label: 'Pending',
      },
      APPROVED: {
        color: 'bg-green-100 text-green-800',
        label: 'Approved',
      },
      REJECTED: {
        color: 'bg-red-100 text-red-800',
        label: 'Rejected',
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        {getStatusIcon(status)}
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDocumentType = (docType: string) => {
    return docType
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Slider
      open={isOpen}
      setOpen={onClose}
      edit={false}
      title={`KYC Management${vendorName ? ` - ${vendorName}` : ''}`}
    >
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <span className="ml-2 text-gray-600">
              Loading KYC information...
            </span>
          </div>
        ) : !kycData ? (
          // No KYC initialized
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
              <Shield className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              KYC Not Initialized
            </h3>
            <p className="text-gray-500 mb-6">
              This vendor hasn't started the KYC verification process yet. Click
              the button below to begin the KYC verification process.
            </p>
            <Button
              text="Initialize KYC Process"
              onClick={handleInitializeKYC}
              isLoading={isInitializing}
              theme="default"
              type="button"
              icon={<Shield className="h-4 w-4" />}
            />
            <p className="text-xs text-gray-500 mt-4">
              This will create a KYC record and allow the vendor to upload
              required documents through the vendor portal.
            </p>
          </div>
        ) : (
          // KYC data exists
          <div className="space-y-6">
            {/* KYC Status Overview */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  KYC Status Overview
                </h3>
                {getStatusBadge(kycData.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(kycData.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Risk Level</p>
                    {getRiskLevelBadge(kycData.riskLevel)}
                  </div>
                </div>

                {kycData.verificationScore && (
                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">
                        Verification Score
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {kycData.verificationScore}%
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {kycData.verificationNotes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    <strong>Notes:</strong> {kycData.verificationNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Documents Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    Submitted Documents ({documents.length})
                  </h3>
                  {isLoadingDocuments && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  )}
                </div>
                {kycData.status === 'PENDING' && documents.length > 0 && (
                  <div className="flex space-x-2">
                    <Button
                      text="Approve All"
                      onClick={() => handleCompleteKYC('APPROVED')}
                      isLoading={isVerifying}
                      theme="default"
                      type="button"
                      icon={<Check className="h-4 w-4" />}
                    />
                    <Button
                      text="Reject All"
                      onClick={() => handleCompleteKYC('REJECTED')}
                      isLoading={isVerifying}
                      theme="lightBlue"
                      className="!text-black"
                      type="button"
                      icon={<X className="h-4 w-4" />}
                    />
                  </div>
                )}
              </div>

              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No documents submitted yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map((document) => (
                    <div
                      key={document.uuid}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {formatDocumentType(document.documentType)}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Submitted: {formatDate(document.createdAt)}
                            </p>
                          </div>
                        </div>
                        {getDocumentStatusBadge(document.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {document.documentNumber && (
                          <div>
                            <p className="text-sm text-gray-500">
                              Document Number
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {document.documentNumber}
                            </p>
                          </div>
                        )}
                        {document.issuingAuthority && (
                          <div>
                            <p className="text-sm text-gray-500">
                              Issuing Authority
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {document.issuingAuthority}
                            </p>
                          </div>
                        )}
                        {document.expiryDate && (
                          <div>
                            <p className="text-sm text-gray-500">Expiry Date</p>
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(document.expiryDate)}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <Button
                            text="View Document"
                            onClick={() => {
                              const signedUrl =
                                signedDocumentUrls[document.uuid];
                              if (signedUrl) {
                                window.open(signedUrl, '_blank');
                              } else {
                                toast.error('Document URL not available');
                              }
                            }}
                            theme="lightBlue"
                            className="!text-black"
                            type="button"
                            icon={<Eye className="h-4 w-4" />}
                            disabled={
                              isLoadingDocuments ||
                              !signedDocumentUrls[document.uuid]
                            }
                          />
                          <Button
                            text="Download"
                            onClick={() => {
                              const signedUrl =
                                signedDocumentUrls[document.uuid];
                              if (signedUrl) {
                                const link = window.document.createElement('a');
                                link.href = signedUrl;
                                link.download = `${document.documentType}.pdf`;
                                link.click();
                              } else {
                                toast.error('Document URL not available');
                              }
                            }}
                            theme="lightBlue"
                            className="!text-black"
                            type="button"
                            icon={<Download className="h-4 w-4" />}
                            disabled={
                              isLoadingDocuments ||
                              !signedDocumentUrls[document.uuid]
                            }
                          />
                        </div>

                        {document.status === 'PENDING' &&
                          kycData.status === 'PENDING' && (
                            <div className="flex space-x-2">
                              <Button
                                text="Approve"
                                onClick={() =>
                                  handleVerifyDocument(
                                    document.uuid,
                                    'APPROVED'
                                  )
                                }
                                isLoading={isVerifying}
                                theme="default"
                                type="button"
                                icon={<Check className="h-4 w-4" />}
                              />
                              <Button
                                text="Reject"
                                onClick={() =>
                                  handleVerifyDocument(
                                    document.uuid,
                                    'REJECTED'
                                  )
                                }
                                isLoading={isVerifying}
                                theme="lightBlue"
                                className="!text-black"
                                type="button"
                                icon={<X className="h-4 w-4" />}
                              />
                            </div>
                          )}
                      </div>

                      {document.verificationNotes && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                          <strong>Verification Notes:</strong>{' '}
                          {document.verificationNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Verification Notes */}
            {kycData.status === 'PENDING' && documents.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Verification Notes
                </h3>
                <textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Add verification notes (optional)"
                  className="w-full p-3 border border-gray-300 rounded-md resize-none"
                  rows={3}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <Button
                text="Refresh Status"
                onClick={fetchKYCData}
                theme="lightBlue"
                className="!text-black"
                type="button"
                icon={<Shield className="h-4 w-4" />}
              />
            </div>
          </div>
        )}
      </div>
    </Slider>
  );
};

export default KYCManagementModal;
