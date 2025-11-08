# Quick Start Guide

Get the Vehicle Management App running in 3 simple steps!

## Prerequisites
- Node.js 18.x or higher
- npm 8.x or higher

## Installation

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

This will install all required packages including:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Vitest (for testing)

### Step 2: Start Development Server
```bash
npm run dev
```

You should see output similar to:
```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
- Ready in 2.5s
```

### Step 3: Open Your Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## What You'll See

### Dashboard
- **Statistics cards** showing total vehicles and counts by status
- **Search bar** to filter by license plate
- **Status filter** dropdown
- **Add Vehicle** button
- **Vehicle table** with all vehicles

### Initial Data
The app comes pre-loaded with **20 vehicles**:
- 13 Available
- 6 In Use
- 1 in Maintenance

## Try It Out

### Create a Vehicle
1. Click **"Add Vehicle"** button
2. Enter a license plate (e.g., "TEST-001")
3. Select a status
4. Click **"Create"**

### Edit a Vehicle
1. Click **"Edit"** on any vehicle row
2. Modify the license plate or status
3. Click **"Update"**

### Delete a Vehicle
1. Click **"Delete"** on an **Available** vehicle
2. Confirm deletion in the modal

**Note**: You cannot delete vehicles that are InUse or in Maintenance!

### Filter & Search
1. Use the **search bar** to find vehicles by license plate
2. Use the **status dropdown** to filter by status
3. Click **column headers** to sort

## Running Tests

```bash
npm test
```

To run tests with coverage:
```bash
npm run test:coverage
```

## Build for Production

```bash
npm run build
npm start
```

## Common Issues

### Port 3000 Already in Use
If port 3000 is already in use, Next.js will suggest an alternative port.
Accept the suggestion or stop the other process using port 3000.

### Module Not Found Errors
Make sure you're in the `frontend` directory and have run `npm install`.

### TypeScript Errors
The project uses TypeScript strict mode. All type errors must be resolved before the app will run.

## Project Structure at a Glance

```
frontend/
├── app/
│   ├── api/vehicles/         # API endpoints
│   ├── page.tsx              # Main UI
│   └── layout.tsx            # App layout
├── components/               # React components
├── lib/                      # Utilities & validations
├── types/                    # TypeScript types
└── __tests__/                # Test files
```

## Key Files to Explore

1. **[app/page.tsx](frontend/app/page.tsx)** - Main vehicle management UI
2. **[lib/validations.ts](frontend/lib/validations.ts)** - Business logic
3. **[app/api/vehicles/route.ts](frontend/app/api/vehicles/route.ts)** - API endpoints
4. **[components/VehicleTable.tsx](frontend/components/VehicleTable.tsx)** - Table component

## Business Rules Reminder

### Status Transitions
- ✅ Any status → Available or InUse
- ❌ Maintenance → InUse (BLOCKED!)
- ✅ Maintenance → Available

### Delete Rules
- ✅ Can delete: Available vehicles
- ❌ Cannot delete: InUse or Maintenance vehicles

### Maintenance Limit
- Maximum **5%** of fleet can be in Maintenance
- Example: 20 vehicles = max 1 in Maintenance

## Need More Help?

- **Setup Instructions**: See [README.md](README.md)
- **API Details**: See [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Project Overview**: See [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

## Development Tips

### Hot Reload
The dev server supports hot reload. Changes to files will automatically refresh the browser.

### API Testing
You can test the API directly:
```bash
# Get all vehicles
curl http://localhost:3000/api/vehicles

# Create a vehicle
curl -X POST http://localhost:3000/api/vehicles \
  -H "Content-Type: application/json" \
  -d '{"licensePlate":"API-TEST","status":"Available"}'
```

### Debugging
- Check the browser console for errors
- Check the terminal where `npm run dev` is running for server logs

---

**Ready to Go!** 🚀

You now have a fully functional vehicle management system. Explore the features, try the validations, and enjoy!
