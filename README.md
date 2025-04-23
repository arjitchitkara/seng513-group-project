# EduVault

## Setup and Running the Application

### Running Locally

1. Install dependencies:

```bash
npm install
```

1. Start both the frontend and API server:

```bash
npm run dev:all
```

This will concurrently start:

- The React frontend on <http://localhost:8080>
- The API server on <http://localhost:3001>

### Running with Docker

1. Make sure Docker and Docker Compose are installed on your system.

1. Create a `.env` file with the necessary environment variables:
   - Database connection variables (`DATABASE_URL`, `DIRECT_URL`)
   - Supabase variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
   - Cloudflare R2 variables
   - Cloudinary variables

1. Run the application using Docker Compose:

```bash
docker-compose up
```

This will:

- Build and start the frontend container (accessible at <http://localhost:8080>)
- Build and start the backend API container (accessible at <http://localhost:3001>)

1. To run in detached mode:

```bash
docker-compose up -d
```

1. To stop the containers:

```bash
docker-compose down
```

## Scripts

- `npm run dev` - Start only the frontend
- `npm run api` - Start only the API server
- `npm run dev:all` - Start both frontend and API
- `npm run db:seed` - Seed the database with initial data
- `npm run db:studio` - Open Prisma Studio for database management
