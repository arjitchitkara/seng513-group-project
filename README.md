# EduVault

## Setup and Running the Application

1.Install dependencies:

```bash
npm install
```

2.Start both the frontend and API server:

```bash
npm run dev:all
```

This will concurrently start:

- The React frontend on <http://localhost:8080>
- The API server on <http://localhost:3001>

## Scripts

- `npm run dev` - Start only the frontend
- `npm run api` - Start only the API server
- `npm run dev:all` - Start both frontend and API
- `npm run db:seed` - Seed the database with initial data
- `npm run db:studio` - Open Prisma Studio for database management
