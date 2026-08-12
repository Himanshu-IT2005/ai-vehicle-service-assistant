# AI Vehicle Service Assistant - API Documentation

All request endpoints (excluding login/register & health check) require a JWT Bearer token:
```text
Authorization: Bearer <TOKEN>
```

---

## 1. Authentication Module (`/api/auth`)

### Register User
* **Method**: `POST`
* **Route**: `/api/auth/register`
* **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210"
}
```
* **Response Example (201 Created)**:
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOi...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "owner",
    "phone": "9876543210"
  }
}
```

### Login User
* **Method**: `POST`
* **Route**: `/api/auth/login`
* **Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
* **Response Example (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOi...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "owner"
  }
}
```

---

## 2. User Profiles Module (`/api/users`)

### Retrieve Profile
* **Method**: `GET`
* **Route**: `/api/users/profile`
* **Response Example (200 OK)**:
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "owner",
    "status": "active",
    "created_at": "2026-08-10T16:00:00.000Z"
  }
}
```

### Update Profile
* **Method**: `PUT`
* **Route**: `/api/users/profile`
* **Request Body**:
```json
{
  "name": "John Doe Updated",
  "phone": "9999999999"
}
```

### Change Password
* **Method**: `PUT`
* **Route**: `/api/users/change-password`
* **Request Body**:
```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword123"
}
```

---

## 3. Vehicles Module (`/api/vehicles`)

### List Garage Units
* **Method**: `GET`
* **Route**: `/api/vehicles`

### Add Vehicle
* **Method**: `POST`
* **Route**: `/api/vehicles`
* **Request Body**:
```json
{
  "brand": "Hyundai",
  "model": "i20",
  "year": 2019,
  "fuelType": "petrol",
  "currentMileage": 48200,
  "registrationNumber": "KA-51-MD-9988",
  "purchaseDate": "2019-10-18",
  "lastServiceDate": "2026-01-20",
  "lastServiceMileage": 47500
}
```

### Get Vehicle Details (Comprehensive Audit & Health Gauge computation)
* **Method**: `GET`
* **Route**: `/api/vehicles/:id/details`
* **Response Includes**:
  * Health Score (calculated dynamically on-load based on mileage delay and overdue alerts)
  * Service records journal
  * Reminders schedules
  * Incurred costs/expenses
  * AI diagnostics sessions

---

## 4. Service Records Module (`/api/service-records`)

### Log Service Records & Autolink Financial Expense
* **Method**: `POST`
* **Route**: `/api/service-records/records`
* **Request Body**:
```json
{
  "vehicleId": 1,
  "categoryId": 2,
  "serviceDate": "2026-01-20",
  "mileage": 47500,
  "serviceCenter": "SafeRide Multi-brand Service Station",
  "cost": 4500.00,
  "description": "Front brake pads replacement",
  "notes": "Rotors resurfaced"
}
```
*(Note: Creating a service record automatically triggers a matching entry under expenses registry.)*

---

## 5. Maintenance Reminders Module (`/api/reminders`)

### List Reminders
* **Method**: `GET`
* **Route**: `/api/reminders`
*(Note: Alarms past due date trigger immediate status rewrite to `overdue` when querying.)*

### Toggle Status
* **Method**: `PATCH`
* **Route**: `/api/reminders/:id/complete`
* **Request Body**:
```json
{
  "status": "completed"
}
```

---

## 6. Expenses Module (`/api/expenses`)

### List Expenses
* **Method**: `GET`
* **Route**: `/api/expenses`

### Add Expense
* **Method**: `POST`
* **Route**: `/api/expenses`
* **Request Body**:
```json
{
  "vehicleId": 1,
  "category": "fuel",
  "amount": 1200.00,
  "date": "2026-02-10",
  "description": "Premium fuel refill"
}
```

---

## 7. AI Diagnostic Analyses Module (`/api/ai-analyses`)

### Submit Symptom details
* **Method**: `POST`
* **Route**: `/api/ai-analyses`
* **Request Body**:
```json
{
  "vehicleId": 1,
  "queryText": "grinding sound from front wheel when braking"
}
```
* **Response Details**:
  * Simulated classifier matches syntax markers (e.g. brake, engine, shift)
  * Returns category, causes list, severity, priority action, and mandatory disclaimer warning tags.

---

## 8. Dashboard KPI Aggregate Module (`/api/dashboard`)

### Retrieve Metrics Summary
* **Method**: `GET`
* **Route**: `/api/dashboard`
* **Response Details**:
  * Total unit counters
  * Cumulative expenses sum
  * Pending/Overdue alarms feed
  * Chronological activity lists

---

## 9. Administrative Portal (`/api/admin`)

*(Note: Restricts requests strictly to users having role: `admin`)*

### Administrative Overview Counters
* **Method**: `GET`
* **Route**: `/api/admin/dashboard`

### Modify System User status (Lock/Suspend accounts)
* **Method**: `PUT`
* **Route**: `/api/admin/users/:id`
* **Request Body**:
```json
{
  "role": "owner",
  "status": "suspended"
}
```
