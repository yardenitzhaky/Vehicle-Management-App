# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### 1. Get All Vehicles
Retrieve all vehicles with optional filtering and sorting.

**Endpoint:** `GET /vehicles`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by status: 'Available', 'InUse', 'Maintenance', or 'all' |
| search | string | No | Search by license plate (case-insensitive) |
| sortBy | string | No | Sort field: 'id', 'licensePlate', 'status', 'createdAt' (default: 'createdAt') |
| sortOrder | string | No | Sort order: 'asc' or 'desc' (default: 'desc') |

**Example Request:**
```bash
GET /api/vehicles?status=Available&sortBy=licensePlate&sortOrder=asc
```

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "1",
      "licensePlate": "ABC-123",
      "status": "Available",
      "createdAt": "2025-01-05T08:00:00.000Z"
    },
    {
      "id": "4",
      "licensePlate": "GHI-321",
      "status": "Available",
      "createdAt": "2025-01-20T11:00:00.000Z"
    }
  ],
  "success": true
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "error": {
    "message": "Failed to fetch vehicles"
  },
  "success": false
}
```

---

### 2. Create Vehicle
Create a new vehicle.

**Endpoint:** `POST /vehicles`

**Request Body:**
```json
{
  "licensePlate": "ABC-123",
  "status": "Available"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| licensePlate | string | Yes | Vehicle license plate (min 3 characters, must be unique) |
| status | string | No | Initial status: 'Available' (default), 'InUse', or 'Maintenance' |

**Example Request:**
```bash
POST /api/vehicles
Content-Type: application/json

{
  "licensePlate": "NEW-456",
  "status": "Available"
}
```

**Success Response (201 Created):**
```json
{
  "data": {
    "id": "21",
    "licensePlate": "NEW-456",
    "status": "Available",
    "createdAt": "2025-02-28T10:30:00.000Z"
  },
  "success": true
}
```

**Validation Error Response (400 Bad Request):**
```json
{
  "error": {
    "field": "licensePlate",
    "message": "License plate already exists"
  },
  "success": false
}
```

**Possible Validation Errors:**
- License plate required
- License plate must be at least 3 characters
- License plate already exists
- Cannot exceed 5% maintenance limit (when creating with Maintenance status)

---

### 3. Update Vehicle
Update an existing vehicle's details or status.

**Endpoint:** `PUT /vehicles/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Vehicle ID |

**Request Body:**
```json
{
  "licensePlate": "ABC-789",
  "status": "InUse"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| licensePlate | string | No | New license plate (must be unique if changed) |
| status | string | No | New status (must follow transition rules) |

**Example Request:**
```bash
PUT /api/vehicles/1
Content-Type: application/json

{
  "status": "InUse"
}
```

**Success Response (200 OK):**
```json
{
  "data": {
    "id": "1",
    "licensePlate": "ABC-123",
    "status": "InUse",
    "createdAt": "2025-01-05T08:00:00.000Z"
  },
  "success": true
}
```

**Not Found Response (404 Not Found):**
```json
{
  "error": {
    "message": "Vehicle not found"
  },
  "success": false
}
```

**Validation Error Response (400 Bad Request):**
```json
{
  "error": {
    "field": "status",
    "message": "A vehicle in Maintenance can only be set to Available"
  },
  "success": false
}
```

**Possible Validation Errors:**
- Vehicle not found
- Invalid status transition (Maintenance → InUse blocked)
- License plate already exists
- Cannot exceed 5% maintenance limit

**Status Transition Rules:**
| From Maintenance | To Available | ✅ Allowed |
| From Maintenance | To InUse | ❌ Blocked |
| All other transitions | - | ✅ Allowed |

---

### 4. Delete Vehicle
Delete a vehicle from the fleet.

**Endpoint:** `DELETE /vehicles/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Vehicle ID |

**Example Request:**
```bash
DELETE /api/vehicles/1
```

**Success Response (200 OK):**
```json
{
  "data": {
    "id": "1"
  },
  "success": true
}
```

**Not Found Response (404 Not Found):**
```json
{
  "error": {
    "message": "Vehicle not found"
  },
  "success": false
}
```

**Validation Error Response (400 Bad Request):**
```json
{
  "error": {
    "message": "Cannot delete a vehicle that is InUse"
  },
  "success": false
}
```

**Delete Protection Rules:**
- ✅ Available vehicles can be deleted
- ❌ InUse vehicles cannot be deleted
- ❌ Maintenance vehicles cannot be deleted

---

## Data Model

### Vehicle Object
```typescript
{
  id: string;           // Unique identifier (auto-generated)
  licensePlate: string; // Vehicle license plate (unique)
  status: 'Available' | 'InUse' | 'Maintenance';
  createdAt: string;    // ISO 8601 timestamp
}
```

---

## Business Rules

### 1. Status Transition Rules
A vehicle in **Maintenance** status can **ONLY** transition to **Available** (not to InUse).

All other status transitions are allowed:
- Available → InUse ✅
- Available → Maintenance ✅
- InUse → Available ✅
- InUse → Maintenance ✅
- Maintenance → Available ✅
- Maintenance → InUse ❌

### 2. Delete Protection
Vehicles with status **InUse** or **Maintenance** **CANNOT** be deleted.

Only vehicles with **Available** status can be deleted.

### 3. Maintenance Limit (5%)
A maximum of **5% of the total fleet** can be in Maintenance status simultaneously.

**Calculation:** `Math.floor(totalVehicles * 0.05)`

**Examples:**
- 20 vehicles → max 1 in Maintenance
- 100 vehicles → max 5 in Maintenance
- 200 vehicles → max 10 in Maintenance

This rule applies when:
- Creating a new vehicle with Maintenance status
- Updating a vehicle's status to Maintenance

---

## Error Response Format

All error responses follow this structure:

```json
{
  "error": {
    "field": "fieldName",  // Optional: which field caused the error
    "message": "Error description"
  },
  "success": false
}
```

**HTTP Status Codes:**
- `200 OK` - Successful GET, PUT, DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Validation error
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Example Usage

### Create and Update Flow
```bash
# 1. Create a new vehicle
curl -X POST http://localhost:3000/api/vehicles \
  -H "Content-Type: application/json" \
  -d '{"licensePlate":"TEST-123","status":"Available"}'

# Response: {"data":{"id":"21",...},"success":true}

# 2. Update to InUse
curl -X PUT http://localhost:3000/api/vehicles/21 \
  -H "Content-Type: application/json" \
  -d '{"status":"InUse"}'

# 3. Try to delete (will fail - vehicle is InUse)
curl -X DELETE http://localhost:3000/api/vehicles/21
# Response: {"error":{"message":"Cannot delete a vehicle that is InUse"},"success":false}

# 4. Set back to Available
curl -X PUT http://localhost:3000/api/vehicles/21 \
  -H "Content-Type: application/json" \
  -d '{"status":"Available"}'

# 5. Delete successfully
curl -X DELETE http://localhost:3000/api/vehicles/21
# Response: {"data":{"id":"21"},"success":true}
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- License plates are case-insensitive for uniqueness checks
- The API validates all business rules server-side
- Partial updates are supported (PATCH-like behavior with PUT)
- Vehicle IDs are auto-generated as sequential integers (as strings)
