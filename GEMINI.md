# Vehicle Management App - Full-stack Home Assignment

> **Original Assignment:** [Home assignment.pdf](Home%20assignment.pdf)

## Overview
Build a Vehicle Management App that allows users to manage a fleet of vehicles — create, edit, delete, and track their current status.

## Goal
Implement a Vehicle Management View that includes:
1. **Full CRUD functionality** for vehicles (Create, Read, Update, Delete)
2. **Vehicle status table** with three statuses:
   - Available (default)
   - InUse
   - Maintenance

## Functional Requirements

### 1. List View
Display all vehicles in a table with the following columns:
- `id`
- `licensePlate`
- `status`
- `createdAt`

### 2. Create / Edit / Delete Vehicle
- Add a new vehicle
- Edit an existing vehicle's details
- Delete a vehicle with confirmation

### 3. Status Management
- Each vehicle has a status: Available, InUse, or Maintenance
- Default status for new vehicles: **Available**
- Ability to change status via dropdown or other intuitive control

### 4. Validations (CRITICAL)
⚠️ **A vehicle in maintenance status can only move to status Available**
⚠️ **A vehicle that is InUse or Maintenance cannot be deleted**
⚠️ **Only up to 5% of the vehicles can be in maintenance at the same time**

### 5. Seed Data
Provide example data (vehicles.json) with at least 3–5 vehicles, one in each status

## Requirements

### ✅ Required
- [ ] TypeScript throughout the app (frontend and backend)
- [ ] CRUD Operations
- [ ] Status Management
- [ ] Clean Code
- [ ] Tests
- [ ] Persistence (file-based or database)
- [ ] Sorting / Filtering / Search
- [ ] Responsive / Polished UI
- [ ] Error handling and loading states

## Deliverables

1. The full project source code
2. **README.md** with setup and run instructions
3. **vehicles.json** (seed data)
4. Optional: simple API documentation (list of routes or Swagger/OpenAPI file)

## Data Model

### Vehicle
```typescript
{
  id: string;           // Unique identifier
  licensePlate: string; // Vehicle license plate
  status: 'Available' | 'InUse' | 'Maintenance';
  createdAt: string;    // ISO timestamp
}
```

## Validation Rules Summary

1. **Maintenance → Available only**: A vehicle in Maintenance can ONLY transition to Available (not to InUse)
2. **Delete protection**: Vehicles with status InUse or Maintenance CANNOT be deleted
3. **5% maintenance limit**: Maximum 5% of total fleet can be in Maintenance simultaneously
   - Example: If you have 100 vehicles, max 5 can be in Maintenance
   - If you have 20 vehicles, only 1 can be in Maintenance

## Implementation Notes

### Status Transition Rules
```
Available → InUse ✅
Available → Maintenance ✅
InUse → Available ✅
InUse → Maintenance ✅
Maintenance → Available ✅
Maintenance → InUse ❌ (BLOCKED)
```

### Delete Rules
```
Available → Can Delete ✅
InUse → Cannot Delete ❌
Maintenance → Cannot Delete ❌
```

### Maintenance Limit Calculation
```typescript
const maintenanceCount = vehicles.filter(v => v.status === 'Maintenance').length;
const totalVehicles = vehicles.length;i
const maxMaintenance = Math.floor(totalVehicles * 0.05);
const canAddToMaintenance = maintenanceCount < maxMaintenance;
```

## Tech Stack

### Full-Stack Framework
- Next.js 14+ with TypeScript (App Router)
- Tailwind CSS for styling
- Next.js API Routes for backend endpoints
- React Server Components and Server Actions
- JSON file storage (or database if implementing persistence)

### Testing
- Vitest or Jest for unit tests
- React Testing Library for component tests

## API Endpoints (Suggested)

```
GET    /api/vehicles          # Get all vehicles
POST   /api/vehicles          # Create a vehicle
PUT    /api/vehicles/:id      # Update a vehicle
DELETE /api/vehicles/:id      # Delete a vehicle
```

Approach this as a real-world task: structure your code cleanly, write readable and maintainable logic, and add improvements that make the app user-friendly.
