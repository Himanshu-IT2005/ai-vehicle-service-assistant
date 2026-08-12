# AI Vehicle Service Assistant - Backend Endpoint Verification

To quickly verify and test the backend REST APIs, you can run the following test commands using cURL, Postman, or your favourite HTTP client.

---

## 1. Setup Phase

1. **Import Database Schema**:
   Run schema creation commands on your MySQL instance:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

2. **Seed Default Accounts & Taxonomies**:
   Insert the required mock datasets:
   ```bash
   mysql -u root -p < database/seed.sql
   ```

3. **Rise API Server**:
   ```bash
   cd backend
   npm run dev
   ```
   *(Server starts listening at http://localhost:5000)*

---

## 2. cURL Sandbox Requests Sequence

### Step A: Server Health check
```bash
curl -X GET http://localhost:5000/api/health
```

### Step B: Login as Vehicle Owner User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"password123\"}"
```
*(Copy the return `token` payload string for subsequent steps block).*

### Step C: Fetch Dashboard KPIs (Private)
```bash
curl -X GET http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step D: Query Owner Vehicles list
```bash
curl -X GET http://localhost:5000/api/vehicles \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step E: Log New Service Record (Auto-Syncs Odometer & Expenses)
```bash
curl -X POST http://localhost:5000/api/service-records/records \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"vehicleId\":1,\"categoryId\":2,\"serviceDate\":\"2026-08-10\",\"mileage\":13000,\"serviceCenter\":\"Central Tires Hub\",\"cost\":250.00,\"description\":\"Swap rear tire brakes disc brake\"}"
```

### Step F: Retrieve Odometer & Brake health details
```bash
curl -X GET http://localhost:5000/api/vehicles/1/details \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step G: Run AI Diagnostic Inquiry
```bash
curl -X POST http://localhost:5000/api/ai-analyses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"vehicleId\":1,\"queryText\":\"Engine makes a loud knock and black smoke\"}"
```

### Step H: Login as Administrator
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"admin123\"}"
```
*(Copy return admin-token payload string).*

### Step I: Execute Systems Audit (Admin)
```bash
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```
```bash
curl -X GET http://localhost:5000/api/admin/vehicles \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```
```bash
curl -X GET http://localhost:5000/api/admin/ai-analyses \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```
