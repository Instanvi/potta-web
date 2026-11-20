# KYC Verification Implementation

## Overview

This is a simplified KYC verification page that allows vendors to upload documents directly without pre-verification checks. The page extracts `token` and `vendorId` from URL parameters and immediately displays the upload form.

## API Integration

### Endpoint Used

```
POST /api/vendors/{vendorId}/kyc/documents
```

### Parameters

- **Path**: `vendorId` (from URL)
- **Query**: `token` (authentication token from URL)
- **Form Data**:
  - `file` (required) - Document file (image/pdf)
  - `documentType` (required) - Type of document
  - `documentNumber` (optional) - Document number/identifier
  - `issuingAuthority` (optional) - Authority that issued the document
  - `expiryDate` (optional) - Document expiry date (YYYY-MM-DD)

## Flow

1. **URL Format**:

   ```
   /vendor-portal/kyc/verify?token={TOKEN}&vendorId={VENDOR_ID}
   ```

2. **Page Loads**:

   - Extracts `token` and `vendorId` from URL
   - Displays form immediately (no pre-fetch)
   - Shows three document upload sections

3. **Document Upload**:

   - User selects a file
   - Form shows additional fields for document details
   - User fills in optional metadata (document number, issuing authority, expiry date)
   - Clicks "Confirm & Upload"
   - Document is added to the form (not uploaded yet)

4. **Form Submission**:
   - User clicks "Submit for Verification"
   - All documents are uploaded in parallel to the API
   - Each document is sent with its metadata
   - Success message shows on completion

## Document Types

### Required Documents:

1. **Government-issued ID**

   - Passport, Driver's License, or National ID
   - Max size: 5MB
   - Formats: JPG, PNG, PDF

2. **Proof of Address**
   - Utility bill, Bank statement
   - Max size: 5MB
   - Formats: JPG, PNG, PDF

### Optional Documents:

3. **Business Registration**
   - Business registration documents
   - Max size: 10MB
   - Formats: JPG, PNG, PDF

## Files Modified

### 1. `page.tsx`

- Simplified to only extract `token` and `vendorId`
- Removed KYC data fetching
- Shows form immediately

### 2. `components/KYCVerificationForm.tsx`

- Removed dependency on pre-fetched KYC data
- Simplified interface (only requires `tokenData`)
- Form resets after successful submission

### 3. `components/DocumentUploader.tsx`

- Added form for document metadata (number, authority, expiry)
- Shows two-step process: file select → metadata entry
- Returns complete `DocumentUploadData` object

### 4. `services/kycService.ts`

- Updated `uploadDocument()` to match API spec
- Modified `submitKYCDocuments()` to upload documents in parallel
- Removed `kycId` requirement

### 5. `hooks/useKYCSubmission.ts`

- Updated types to remove `kycId`
- Better error handling with HTTP status codes
- Component handles success/error messages

## Usage Example

```typescript
// URL format
const verificationUrl = `${baseUrl}/vendor-portal/kyc/verify?token=${token}&vendorId=${vendorId}`;

// The page will:
// 1. Extract token and vendorId
// 2. Show upload form
// 3. Upload documents to: POST /api/vendors/{vendorId}/kyc/documents
// 4. Include token as query parameter for authentication
```

## Error Handling

- **Missing URL params**: Shows error screen
- **File too large**: Shows error toast
- **Invalid file type**: Shows error toast
- **Upload failure**: Shows error toast with retry option
- **Network error**: Shows error with appropriate message

## Features

✅ Simple URL-based authentication (token + vendorId)  
✅ No pre-verification required  
✅ Upload form with metadata fields  
✅ Parallel document upload  
✅ Visual feedback for upload status  
✅ Document preview before submission  
✅ Form reset after successful submission  
✅ Comprehensive error handling
