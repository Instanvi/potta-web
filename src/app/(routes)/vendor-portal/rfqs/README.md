# Vendor RFQ Portal

This is a standalone portal for vendors to respond to RFQs (Request for Quotations) by creating proforma invoices. The portal is accessible via a unique token link sent to vendors via email.

## Features

- ✅ **Token-based authentication** - No login required, vendors use a secure token from their email
- ✅ **RFQ details display** - View complete RFQ information including requirements and specifications
- ✅ **Price entry** - Enter unit prices for each line item
- ✅ **Auto-calculation** - Total amounts calculated automatically
- ✅ **Proforma invoice submission** - Submit pricing directly to the system
- ✅ **Responsive design** - Works on desktop, tablet, and mobile devices

## URL Structure

The RFQ vendor portal is accessible via:

```
https://app.potta.dev/vendor-portal/rfqs/{rfqId}?token={TOKEN}&vendorId={VENDOR_ID}
```

### URL Parameters

- `rfqId`: UUID of the RFQ (in the path)
- `token`: Secure authentication token (query parameter)
- `vendorId`: UUID of the vendor (query parameter)

### Example URL

```
/vendor-portal/rfqs/03a1bba0-f949-4285-9f24-15a2d352871c?token=5d4b7f758ffee36bdd5215005496ebceb09ed1c65dbf1404e9725a64162d5080&vendorId=b73380f6-ecd6-4610-be02-2744a11a3729
```

## API Endpoints

### Get RFQ Details

```http
GET /api/vendor-portal/rfqs/{rfqId}?token={TOKEN}&vendorId={VENDOR_ID}
```

**Response:**

```json
{
  "id": "uuid",
  "rfqNumber": "RFQ-2024-001",
  "title": "Office Furniture Request",
  "description": "Request for office furniture including chairs and desks",
  "status": "sent",
  "dueDate": "2024-12-31T23:59:59Z",
  "vendor": {
    "id": "uuid",
    "name": "Vendor Name",
    "email": "vendor@example.com",
    "businessName": "Vendor Business Ltd",
    "phone": "+1234567890",
    "address": "123 Business St"
  },
  "requirements": [
    {
      "id": "uuid",
      "description": "Must be ergonomic",
      "priority": "high",
      "category": "Quality"
    }
  ],
  "lineItems": [
    {
      "id": "uuid",
      "description": "Office Chairs - Ergonomic",
      "quantity": 10,
      "specifications": "Adjustable height and lumbar support",
      "category": "Furniture"
    }
  ],
  "specifications": "Additional specifications here",
  "terms": "Payment terms and conditions",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Create Proforma Invoice

```http
POST /api/vendor-portal/rfqs/{rfqId}/proforma-invoices?token={TOKEN}&vendorId={VENDOR_ID}
```

**Request Body:**

```json
{
  "vendorId": "vendor-123e4567-e89b-12d3-a456-426614174000",
  "lineItems": [
    {
      "description": "Office Chairs - Ergonomic",
      "quantity": 10,
      "unitPrice": 150.0,
      "totalAmount": 1500.0,
      "specifications": "Ergonomic office chairs with adjustable height and lumbar support",
      "category": "Furniture"
    },
    {
      "description": "Office Desks - Standing",
      "quantity": 5,
      "unitPrice": 300.0,
      "totalAmount": 1500.0,
      "specifications": "Adjustable standing desks with motorized height adjustment",
      "category": "Furniture"
    }
  ]
}
```

**Response:**

```json
{
  "id": "uuid",
  "rfqId": "uuid",
  "vendorId": "uuid",
  "invoiceNumber": "PI-2024-001",
  "lineItems": [...],
  "totalAmount": 3000.00,
  "status": "submitted",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## File Structure

```
apps/potta/src/app/(routes)/vendor-portal/rfqs/
├── [rfqId]/
│   └── page.tsx                    # Dynamic RFQ page
├── components/
│   └── RFQProformaForm.tsx         # Main form component
├── hooks/
│   ├── useRFQDetails.ts            # Fetch RFQ data
│   ├── useCreateProformaInvoice.ts # Submit proforma invoice
│   └── index.ts                    # Hook exports
├── services/
│   └── rfqService.ts               # API service layer
├── types/
│   └── index.ts                    # TypeScript types
└── README.md                       # This file
```

## Components

### RFQProformaForm

Main form component that handles:

- Display of RFQ details
- Vendor information
- Requirements list
- Line items with price input fields
- Auto-calculation of totals
- Form submission

**Props:**

```typescript
interface RFQProformaFormProps {
  tokenData: RFQTokenData;
  rfqData: RFQData;
  onSuccess?: () => void;
}
```

## Hooks

### useRFQDetails

Fetches RFQ details from the API.

```typescript
const { data, isLoading, error, refetch } = useRFQDetails({
  rfqId: 'uuid',
  token: 'token',
  vendorId: 'vendor-uuid',
  enabled: true,
});
```

### useCreateProformaInvoice

Handles proforma invoice submission.

```typescript
const { mutate, isPending } = useCreateProformaInvoice({
  rfqId: 'uuid',
  token: 'token',
  vendorId: 'vendor-uuid',
  onSuccess: (data) => console.log('Success!'),
  onError: (error) => console.error('Error!'),
});
```

## Workflow

1. **Email Sent**: Vendor receives email with unique RFQ link
2. **Access Portal**: Vendor clicks link and accesses the RFQ portal
3. **View Details**: Portal displays RFQ details, requirements, and line items
4. **Enter Prices**: Vendor enters unit prices for each line item
5. **Review Total**: System calculates and displays total amount
6. **Submit**: Vendor submits proforma invoice
7. **Confirmation**: Success message displayed

## Security

- **Token-based authentication** - No password required
- **Token includes**: rfqId, vendorId, timestamp, cryptographic signature
- **HTTPS only** - All requests must be over HTTPS
- **Token validation** - Backend validates token on every request
- **Parameter matching** - vendorId in token must match vendorId parameter

## Validation

### Client-side

- All unit prices must be greater than 0
- All required fields must be filled

### Server-side

- Token must be valid and not expired
- vendorId must match token
- rfqId must exist and be in correct status
- Line items must match RFQ requirements

## Error Handling

The portal includes comprehensive error handling:

- **400**: Bad request - validation error
- **401**: Unauthorized - invalid vendor token
- **404**: RFQ not found
- **Network errors**: Graceful error messages

## Email Template Example

```
Subject: Request for Quotation - {RFQ_NUMBER}

Dear {Vendor Name},

We would like to request a quotation for the following items:

{RFQ_TITLE}

Please click the link below to view the complete RFQ details and submit your pricing:
https://app.potta.dev/vendor-portal/rfqs/{RFQ_ID}?token={TOKEN}&vendorId={VENDOR_ID}

Due Date: {DUE_DATE}

If you have any questions, please contact our procurement team.

Best regards,
The Procurement Team
```

## Development

### Running Locally

```bash
npm run dev
```

### Testing

To test the RFQ portal locally:

1. Generate a test token from the backend
2. Navigate to: `http://localhost:4200/vendor-portal/rfqs/{rfqId}?token={TOKEN}&vendorId={VENDOR_ID}`
3. Should see the RFQ details without login redirect

## Authentication Bypass Configuration

The RFQ portal has been configured to bypass authentication in the following files:

1. **middleware.ts** - Line 28: `/vendor-portal/rfqs` added to PUBLIC_PATHS
2. **middleware.improved.ts** - Line 28: `/vendor-portal/rfqs` added to PUBLIC_PATHS
3. **config/auth.config.ts** - Lines 92, 109: `/vendor/rfqs` added to BYPASS_AUTH_ROUTES and PUBLIC_PATHS
4. **AuthGuard.tsx** - Line 12: `/vendor/rfqs` added to BYPASS_AUTH_ROUTES
5. **useGetUser.ts** - Line 149: `/vendor/rfqs` added to BYPASS_AUTH_ROUTES

## Notes

- Tokens should have a reasonable expiry time (e.g., 7-30 days)
- Consider making tokens single-use after successful submission
- Implement rate limiting on API endpoints
- Ensure all requests are over HTTPS in production
- The portal is completely standalone and does not require user authentication
