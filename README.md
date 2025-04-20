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


todo:
1 add support for pptx and docx maybe use office viewer.
2 UI for dashboard is janky fix that
3 add the my documents page
4 change to course name feature logic to match with course hero.
5 dockerise both the frontend and the backend.
6 check for whats left. 