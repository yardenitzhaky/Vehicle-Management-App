# Vehicle Management App

A full-stack vehicle management application built with Next.js 14, Express.js, TypeScript, and Tailwind CSS. This application allows users to manage a fleet of vehicles with complete CRUD functionality, status management, and advanced filtering capabilities.

## Features

### Core Functionality
- **Full CRUD Operations**: Create, Read, Update, and Delete vehicles
- **Status Management**: Track vehicles across three statuses (Available, InUse, Maintenance)
- **Real-time Validation**: Enforces business rules for status transitions and deletions
- **Search & Filter**: Search by license plate and filter by status
- **Sorting**: Sort by any column (ID, License Plate, Status, Created Date)
- **Responsive Design**: Mobile-friendly UI built with Tailwind CSS

### Business Rules
1. **Maintenance → Available Only**: Vehicles in Maintenance status can only transition to Available (not to InUse)
2. **Delete Protection**: Vehicles with status InUse or Maintenance cannot be deleted
3. **5% Maintenance Limit**: Maximum 5% of total fleet can be in Maintenance simultaneously

### Statistics Dashboard
- Total vehicle count
- Count by status (Available, InUse, Maintenance)
- Real-time updates

## Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React** for UI components
- **Framer Motion** for animations

### Backend
- **Express.js** RESTful API server
- **TypeScript** for type safety
- **File-based persistence** using JSON storage
- **CORS** enabled for cross-origin requests

### Testing
- **Vitest** for unit tests
- **React Testing Library** for component tests
- Comprehensive test coverage for validation logic

## Project Structure

```
/
├── backend/                   # Express.js API server
│   ├── src/
│   │   ├── db.ts         # Data persistence layer
│   │   ├── validations.ts # Business logic validation
│   │   ├── types.ts            # TypeScript definitions
│   │   └── index.ts          # Server entry point
│   ├── data/                 # Data storage
│   │   └── vehicles.json
│   ├── package.json
│   └── tsconfig.json
├── frontend/                  # Next.js application
│   ├── app/                   # App Router
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Main vehicles page
│   │   └── globals.css       # Global styles
│   ├── components/           # React components
│   │   ├── VehicleTable.tsx
│   │   ├── VehicleForm.tsx
│   │   ├── StatusBadge.tsx
│   │   └── DeleteConfirmation.tsx
│   ├── types/                # TypeScript definitions
│   │   └── vehicle.ts
│   ├── __tests__/            # Test files
│   └── package.json
└── README.md
```

## Installation

### Prerequisites
- Node.js 18.x or higher
- npm 8.x or higher

### Setup Steps

1. **Clone or download the project**
   ```bash
   cd 'optibus home assignment'
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

## Running the Application

### Development Mode

From the **root directory**:
```bash
npm run dev
```

This will start both the backend server (port 3001) and frontend (port 3000) concurrently.

### Production Build

```bash
# Build both backend and frontend
npm run build

# Start backend
cd backend
npm start

# Start frontend (in another terminal)
cd frontend
npm start
```

## Running Tests

From the **frontend directory**:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

## API Documentation

### Base URL
`http://localhost:3001`

### Endpoints

#### GET /api/vehicles
Get all vehicles with optional filtering and sorting

**Query Parameters:**
- `status` (optional): Filter by status (Available, InUse, Maintenance)
- `search` (optional): Search by license plate
- `sortBy` (optional): Sort field (id, licensePlate, status, createdAt)
- `sortOrder` (optional): Sort direction (asc, desc)

**Response:**
```json
{
  "data": [
    {
      "id": "1",
      "licensePlate": "ABC-123",
      "status": "Available",
      "createdAt": "2025-01-05T08:00:00.000Z"
    }
  ],
  "success": true
}
```

#### POST /api/vehicles
Create a new vehicle

**Request Body:**
```json
{
  "licensePlate": "ABC-123",
  "status": "Available"
}
```

**Response:**
```json
{
  "data": {
    "id": "1",
    "licensePlate": "ABC-123",
    "status": "Available",
    "createdAt": "2025-01-05T08:00:00.000Z"
  },
  "success": true
}
```

#### PUT /api/vehicles/:id
Update an existing vehicle

**Request Body:**
```json
{
  "licensePlate": "ABC-123",
  "status": "InUse"
}
```

**Response:**
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

#### DELETE /api/vehicles/:id
Delete a vehicle

**Response:**
```json
{
  "data": {
    "id": "1"
  },
  "success": true
}
```

**Error Response:**
```json
{
  "error": {
    "field": "status",
    "message": "Cannot delete a vehicle that is InUse"
  },
  "success": false
}
```

## Validation Rules

### Status Transitions

| From        | To          | Allowed |
|-------------|-------------|---------|
| Available   | InUse       | ✅      |
| Available   | Maintenance | ✅      |
| InUse       | Available   | ✅      |
| InUse       | Maintenance | ✅      |
| Maintenance | Available   | ✅      |
| Maintenance | InUse       | ❌      |

### Delete Rules

| Status      | Can Delete |
|-------------|------------|
| Available   | ✅         |
| InUse       | ❌         |
| Maintenance | ❌         |

### Maintenance Limit

Maximum 5% of total fleet can be in Maintenance:
- 20 vehicles → max 1 in Maintenance
- 100 vehicles → max 5 in Maintenance
- Calculated as: `Math.floor(totalVehicles * 0.05)`

## Seed Data

The application comes with 20 pre-populated vehicles in [backend/data/vehicles.json](./backend/data/vehicles.json):
- 1 vehicle in Maintenance status
- 6 vehicles in InUse status
- 13 vehicles in Available status

This data demonstrates all statuses and validation rules.

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend
No environment variables required for basic setup. Optionally you can set:
```
PORT=3001
```

## Development Notes

### Code Quality
- **TypeScript Strict Mode**: Enabled for maximum type safety
- **ESLint**: Configured with Next.js recommended rules
- **Clean Code**: Well-organized, readable, and maintainable structure
- **Comprehensive Comments**: Functions documented with JSDoc-style comments

### Error Handling
- Client-side validation before API calls
- Server-side validation for data integrity
- User-friendly error messages
- Loading states for all async operations

### Performance
- Server-side filtering and sorting
- Optimized re-renders with proper state management
- Minimal API calls with proper caching

## Future Enhancements

Potential improvements for production use:
- Database integration (PostgreSQL, MongoDB)
- Authentication and authorization
- Audit logging for all changes
- Bulk operations (import/export CSV)
- Advanced analytics and reporting
- WebSocket for real-time updates
- Docker containerization
- CI/CD pipeline

## License

This project is part of a home assignment for Optibus.

## Support

For questions or issues, please refer to the assignment documentation or contact the project maintainer.
