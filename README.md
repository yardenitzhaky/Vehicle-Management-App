# Vehicle Management App - ReadMe + API Docs

### Frontend
- **Next.js 14** 
- **TypeScript** 
- **Tailwind CSS** 
- **React** 
- **Framer Motion** 

### Backend
- **Express.js** 
- **TypeScript** 
- **File-based persistence** 
- **CORS** 

### Testing
- **Vitest** 
- **React Testing Library** 

### Prerequisites
- Node.js 18.x or higher
- npm 8.x or higher

### Setup Steps

1. **Clone the project**
   ```bash
   git clone "https://github.com/yardenitzhaky/Vehicle-Management-App.git"
   cd 'Vehicle-Management-App'
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

## Running the Application

From the **root directory**:
```bash
npm run dev
```

This will start both the backend server (port 3001) and frontend (port 3000) concurrently.

## Running Tests

From the **frontend directory**:

```bash
npm test
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
