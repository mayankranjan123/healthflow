# HealthFlow Prescriptions API Examples

This guide details the endpoints, request/response formats, and validation rules for the newly implemented HealthFlow Prescriptions module.

All endpoints support a `clinicId` query parameter (defaults to `1` if omitted).

---

## 1. Create / Save Prescription
**Endpoint:** `POST /prescriptions`  
**Query Params:** `clinicId` (optional, default: `1`)

### Request Body (JSON)
```json
{
  "patientId": 1,
  "doctorId": 1,
  "prescriptionDate": "2026-07-03",
  "diagnosis": "Primary Hypertension",
  "symptoms": "Occasional headaches, high blood pressure readings (145/95 mmHg), fatigue.",
  "clinicalNotes": "Patient has had elevated BP for three consecutive visits. Advised home monitoring.",
  "testsRecommended": "Complete Blood Count (CBC), Lipid Profile, Electrocardiogram (ECG)",
  "advice": "Reduce sodium intake, regular moderate walking for 30 minutes, avoid stress.",
  "nextVisitDate": "2026-08-03",
  "status": "SAVED",
  "medicines": [
    {
      "medicineName": "Lisinopril 10mg",
      "dosage": "1 Tablet",
      "frequency": "Once Daily (Morning)",
      "duration": "30 Days",
      "instructions": "Take with water before breakfast. Monitor for persistent dry cough.",
      "sequenceNo": 1
    },
    {
      "medicineName": "Amlodipine 5mg",
      "dosage": "1 Tablet",
      "frequency": "Once Daily (Evening)",
      "duration": "30 Days",
      "instructions": "Take after dinner. Monitor for ankle swelling.",
      "sequenceNo": 2
    }
  ]
}
```

### Successful Response (201 Created)
```json
{
  "success": true,
  "message": "Prescription generated successfully",
  "data": {
    "id": 2,
    "clinicId": 1,
    "prescriptionCode": "RX-38492",
    "patientId": 1,
    "patientName": "James Dalton",
    "patientMobile": "+15550192834",
    "doctorId": 1,
    "doctorName": "John Doe",
    "doctorSpecialization": "Cardiology",
    "prescriptionDate": "2026-07-03",
    "diagnosis": "Primary Hypertension",
    "symptoms": "Occasional headaches, high blood pressure readings (145/95 mmHg), fatigue.",
    "clinicalNotes": "Patient has had elevated BP for three consecutive visits. Advised home monitoring.",
    "testsRecommended": "Complete Blood Count (CBC), Lipid Profile, Electrocardiogram (ECG)",
    "advice": "Reduce sodium intake, regular moderate walking for 30 minutes, avoid stress.",
    "nextVisitDate": "2026-08-03",
    "status": "SAVED",
    "pdfUrl": null,
    "createdAt": "2026-07-03T11:15:30Z",
    "updatedAt": "2026-07-03T11:15:30Z",
    "medicines": [
      {
        "id": 2,
        "medicineName": "Lisinopril 10mg",
        "dosage": "1 Tablet",
        "frequency": "Once Daily (Morning)",
        "duration": "30 Days",
        "instructions": "Take with water before breakfast. Monitor for persistent dry cough.",
        "sequenceNo": 1
      },
      {
        "id": 3,
        "medicineName": "Amlodipine 5mg",
        "dosage": "1 Tablet",
        "frequency": "Once Daily (Evening)",
        "duration": "30 Days",
        "instructions": "Take after dinner. Monitor for ankle swelling.",
        "sequenceNo": 2
      }
    ]
  }
}
```

---

## 2. Get Prescription by ID
**Endpoint:** `GET /prescriptions/{id}`  
**Query Params:** `clinicId` (optional, default: `1`)

### Successful Response (200 OK)
```json
{
  "success": true,
  "message": "Prescription details retrieved successfully",
  "data": {
    "id": 2,
    "clinicId": 1,
    "prescriptionCode": "RX-38492",
    "patientId": 1,
    "patientName": "James Dalton",
    "patientMobile": "+15550192834",
    "doctorId": 1,
    "doctorName": "John Doe",
    "doctorSpecialization": "Cardiology",
    "prescriptionDate": "2026-07-03",
    "diagnosis": "Primary Hypertension",
    "symptoms": "Occasional headaches, high blood pressure readings (145/95 mmHg), fatigue.",
    "clinicalNotes": "Patient has had elevated BP for three consecutive visits. Advised home monitoring.",
    "testsRecommended": "Complete Blood Count (CBC), Lipid Profile, Electrocardiogram (ECG)",
    "advice": "Reduce sodium intake, regular moderate walking for 30 minutes, avoid stress.",
    "nextVisitDate": "2026-08-03",
    "status": "SAVED",
    "pdfUrl": null,
    "createdAt": "2026-07-03T11:15:30Z",
    "updatedAt": "2026-07-03T11:15:30Z",
    "medicines": [
      {
        "id": 2,
        "medicineName": "Lisinopril 10mg",
        "dosage": "1 Tablet",
        "frequency": "Once Daily (Morning)",
        "duration": "30 Days",
        "instructions": "Take with water before breakfast. Monitor for persistent dry cough.",
        "sequenceNo": 1
      }
    ]
  }
}
```

---

## 3. List Patient Prescriptions (Timeline Format)
**Endpoint:** `GET /prescriptions`  
**Query Params:**
- `patientId`: Filter prescriptions for a specific patient
- `doctor`: Filter by Doctor ID (optional)
- `fromDate`: Start Date filter, format `YYYY-MM-DD` (optional)
- `toDate`: End Date filter, format `YYYY-MM-DD` (optional)
- `page`: Page index (optional, default `0`)
- `size`: Page size (optional, default `10`)
- `sortBy`: Sorting field (optional, default `prescriptionDate`)
- `sortDir`: Sorting order (optional, default `desc` for timeline format)

### Example Request
`GET /prescriptions?patientId=1&sortDir=desc`

### Successful Response (200 OK)
```json
{
  "success": true,
  "message": "Prescriptions timeline retrieved successfully",
  "data": {
    "content": [
      {
        "id": 2,
        "prescriptionCode": "RX-38492",
        "patientId": 1,
        "patientName": "James Dalton",
        "prescriptionDate": "2026-07-03",
        "diagnosis": "Primary Hypertension",
        "symptoms": "Occasional headaches",
        "status": "SAVED"
      },
      {
        "id": 1,
        "prescriptionCode": "RX-10001",
        "patientId": 1,
        "patientName": "James Dalton",
        "prescriptionDate": "2026-07-02",
        "diagnosis": "Primary Hypertension",
        "symptoms": "Mild headaches, pressure in chest",
        "status": "SAVED"
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10
    },
    "totalPages": 1,
    "totalElements": 2,
    "last": true
  }
}
```

---

## 4. Preview Prescription (In-Memory Draft Sandbox)
**Endpoint:** `POST /prescriptions/preview`  
Takes a request body representing the draft prescription and generates the fully structured response *without writing to the database*. Useful for PDF or screen rendering.

### Successful Response (200 OK)
```json
{
  "success": true,
  "message": "Prescription preview generated successfully",
  "data": {
    "id": null,
    "clinicId": 1,
    "prescriptionCode": "RX-PREVIEW-DRAFT",
    "patientId": 1,
    "patientName": "James Dalton",
    "doctorName": "John Doe",
    "prescriptionDate": "2026-07-03",
    "diagnosis": "Primary Hypertension",
    "status": "DRAFT",
    "medicines": [ ... ]
  }
}
```

---

## 5. Generate PDF Document
**Endpoint:** `POST /prescriptions/{id}/pdf`  
Generates a PDF download reference for printing or sharing.

### Successful Response (200 OK)
```json
{
  "success": true,
  "message": "Prescription PDF document created successfully",
  "data": {
    "pdfUrl": "prescriptions/rx-RX-38492-1719994530000.pdf"
  }
}
```

---

## 6. Validation Error Example
If mandatory fields (e.g., doctor, patient, diagnosis, symptoms, clinical notes, prescription date, or at least one medicine) are missing or invalid:

`POST /prescriptions` with empty body:

### Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Validation Failed",
  "errors": {
    "doctorId": "Doctor ID is required",
    "patientId": "Patient ID is required",
    "diagnosis": "Diagnosis is required",
    "symptoms": "Symptoms are required",
    "clinicalNotes": "Clinical notes are required",
    "prescriptionDate": "Prescription date is required",
    "medicines": "At least one medicine is required in the prescription"
  }
}
```
