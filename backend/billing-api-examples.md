# HealthFlow Billing API Examples

This guide details the endpoints, request/response formats, validation rules, and automated calculation formulas for the newly implemented HealthFlow Billing module.

All endpoints support a `clinicId` query parameter (defaults to `1` if omitted).

---

## Calculations & Flow Rules
Our billing module automatically handles financial and tax calculations:
1. **Line Item calculation:**
   - `subtotal` = `rate * quantity`
   - `discountAmount` = `subtotal * (discountPercent / 100)`
   - `taxAmount` = `(subtotal - discountAmount) * (taxPercent / 100)`
   - `total` = `subtotal - discountAmount + taxAmount`

2. **Invoice Totals calculation:**
   - `subtotal` = SUM of item subtotals
   - `discountTotal` = SUM of item discount amounts
   - `taxTotal` = SUM of item tax amounts
   - `grandTotal` = SUM of item totals (i.e., `subtotal - discountTotal + taxTotal`)
   - `pendingAmount` = `grandTotal - paidAmount`

3. **Automatic Status matching:**
   - If `status` input is "Paid", `paidAmount` automatically sets to `grandTotal` and `pendingAmount` sets to `0`.
   - If `status` input is "Pending", `paidAmount` automatically sets to `0` and `pendingAmount` sets to `grandTotal`.
   - If `status` is omitted:
     - If `paidAmount >= grandTotal` -> status is `Paid`
     - If `paidAmount <= 0` -> status is `Pending`
     - If `paidAmount > 0` and `paidAmount < grandTotal` -> status is `Partial`

---

## 1. Create / Save Invoice
**Endpoint:** `POST /invoices`  
**Query Params:** `clinicId` (optional, default: `1`)

### Request Body (JSON)
```json
{
  "patientId": 1,
  "doctorId": 1,
  "invoiceDate": "2026-07-03",
  "paidAmount": 150.00,
  "status": "Partial",
  "paymentMode": "Online",
  "referenceNo": "TXN-8392812",
  "items": [
    {
      "itemName": "General Physician Consultation",
      "quantity": 1,
      "rate": 150.00,
      "discountPercent": 10.00,
      "taxPercent": 5.00
    },
    {
      "itemName": "Lisinopril 10mg (30 Tablets)",
      "quantity": 2,
      "rate": 40.00,
      "discountPercent": 0.00,
      "taxPercent": 12.00
    }
  ]
}
```

### Successful Response (201 Created)
```json
{
  "success": true,
  "message": "Invoice generated successfully",
  "data": {
    "id": 2,
    "clinicId": 1,
    "invoiceNumber": "INV-2026-8349",
    "patientId": 1,
    "patientName": "James Dalton",
    "patientMobile": "+15550192834",
    "doctorId": 1,
    "doctorName": "John Doe",
    "doctorSpecialization": "Cardiology",
    "invoiceDate": "2026-07-03",
    "subtotal": 230.00,
    "discountTotal": 15.00,
    "taxTotal": 16.35,
    "grandTotal": 231.35,
    "paidAmount": 150.00,
    "pendingAmount": 81.35,
    "status": "Partial",
    "paymentMode": "Online",
    "referenceNo": "TXN-8392812",
    "pdfUrl": null,
    "createdAt": "2026-07-03T11:20:00Z",
    "updatedAt": "2026-07-03T11:20:00Z",
    "items": [
      {
        "id": 2,
        "itemName": "General Physician Consultation",
        "quantity": 1,
        "rate": 150.00,
        "discountPercent": 10.00,
        "taxPercent": 5.00,
        "total": 141.75
      },
      {
        "id": 3,
        "itemName": "Lisinopril 10mg (30 Tablets)",
        "quantity": 2,
        "rate": 40.00,
        "discountPercent": 0.00,
        "taxPercent": 12.00,
        "total": 89.60
      }
    ]
  }
}
```

---

## 2. Get Invoice by ID
**Endpoint:** `GET /invoices/{id}`  
**Query Params:** `clinicId` (optional, default: `1`)

### Successful Response (200 OK)
```json
{
  "success": true,
  "message": "Invoice details retrieved successfully",
  "data": {
    "id": 2,
    "clinicId": 1,
    "invoiceNumber": "INV-2026-8349",
    "patientId": 1,
    "patientName": "James Dalton",
    "patientMobile": "+15550192834",
    "doctorId": 1,
    "doctorName": "John Doe",
    "invoiceDate": "2026-07-03",
    "subtotal": 230.00,
    "discountTotal": 15.00,
    "taxTotal": 16.35,
    "grandTotal": 231.35,
    "paidAmount": 150.00,
    "pendingAmount": 81.35,
    "status": "Partial",
    "paymentMode": "Online",
    "referenceNo": "TXN-8392812",
    "items": [ ... ]
  }
}
```

---

## 3. List Invoices (Paginated & Filtered)
**Endpoint:** `GET /invoices`  
**Query Params:**
- `patientName`: Filter by patient's full name (fuzzy, case-insensitive)
- `invoiceSearch`: Filter by invoice code or exact database primary ID
- `fromDate`: Start date filter (`YYYY-MM-DD`)
- `toDate`: End date filter (`YYYY-MM-DD`)
- `status`: Paid, Pending, Partial
- `doctor`: Doctor's ID
- `page`: Page index (default: `0`)
- `size`: Page size (default: `10`)
- `sortBy`: Sorting field (default: `invoiceDate`)
- `sortDir`: sorting order (`desc` or `asc`)

### Example Request
`GET /invoices?patientName=James&status=Partial&sortDir=desc`

### Successful Response (200 OK)
```json
{
  "success": true,
  "message": "Invoices retrieved successfully",
  "data": {
    "content": [
      {
        "id": 2,
        "invoiceNumber": "INV-2026-8349",
        "patientId": 1,
        "patientName": "James Dalton",
        "invoiceDate": "2026-07-03",
        "grandTotal": 231.35,
        "paidAmount": 150.00,
        "pendingAmount": 81.35,
        "status": "Partial"
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10
    },
    "totalPages": 1,
    "totalElements": 1,
    "last": true
  }
}
```

---

## 4. Preview Invoice (In-Memory Sandbox Draft)
**Endpoint:** `POST /invoices/preview`  
Takes the identical payload structure as a creation request and yields the calculated response *without committing or writing to the database*.

### Successful Response (200 OK)
```json
{
  "success": true,
  "message": "Invoice preview generated successfully",
  "data": {
    "id": null,
    "invoiceNumber": "INV-PREVIEW-DRAFT",
    "patientId": 1,
    "patientName": "James Dalton",
    "doctorName": "John Doe",
    "invoiceDate": "2026-07-03",
    "subtotal": 230.00,
    "discountTotal": 15.00,
    "taxTotal": 16.35,
    "grandTotal": 231.35,
    "paidAmount": 150.00,
    "pendingAmount": 81.35,
    "status": "Partial",
    "items": [ ... ]
  }
}
```

---

## 5. Print/Download PDF Endpoint Placeholder
**Endpoint:** `POST /invoices/{id}/pdf`

### Successful Response (200 OK)
```json
{
  "success": true,
  "message": "Invoice PDF document created successfully",
  "data": {
    "pdfUrl": "billing/inv-INV-2026-8349-1719994900000.pdf"
  }
}
```

---

## 6. Billing Dashboard Statistics
**Endpoint:** `GET /invoices/stats`

### Successful Response (200 OK)
```json
{
  "success": true,
  "message": "Billing statistics retrieved successfully",
  "data": {
    "revenueToday": 150.00,
    "pendingPayments": 81.35,
    "paidInvoicesCount": 1,
    "paidInvoicesAmount": 150.00,
    "partialPaymentsCount": 1,
    "partialPaymentsAmount": 150.00
  }
}
```

---

## 7. Validation Error Example
If mandatory fields (such as `patientId`, `doctorId`, `invoiceDate`, or line items) are missing or invalid:

`POST /invoices` with empty body:

### Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Validation Failed",
  "errors": {
    "patientId": "Patient ID is required",
    "doctorId": "Doctor ID is required",
    "invoiceDate": "Invoice date is required",
    "items": "Invoice must contain at least one line item"
  }
}
```
