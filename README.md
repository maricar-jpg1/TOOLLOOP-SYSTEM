# ToolLoop – Equipment Borrowing and Management System

## Project Name

**ToolLoop** is a web-based equipment borrowing and management system that helps users view available equipment and manage equipment borrowing records.

## Live Links

- **Frontend:** https://tooloop-system.netlify.app/
- **Backend API:** https://toolloop-system.onrender.com
- **Health Check:** https://toolloop-system.onrender.com/api/health

## Team

- [Team Member 1]
- [Team Member 2]

## Tech Stack

- **Frontend:** React and Vite
- **Backend:** ASP.NET Core Web API (.NET 10)
- **Database:** MongoDB Atlas
- **Frontend Hosting:** Netlify
- **Backend Hosting:** Render
- **Version Control:** Git and GitHub
- **CI/CD:** GitHub Actions

## Run It on Your Laptop

### Prerequisites

- Node.js
- .NET 10 SDK
- Git
- MongoDB Atlas account

### 1. Clone the repository

```bash
git clone https://github.com/maricar-jpg1/TOOLLOOP-SYSTEM.git
cd TOOLLOOP-SYSTEM
```

### 2. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in your terminal.

### 3. Run the backend

Open another terminal from the project root:

```bash
dotnet restore backend/ToolLoop.Api/ToolLoop.Api.csproj
dotnet run --project backend/ToolLoop.Api/ToolLoop.Api.csproj
```

## Environment Variables

Configure environment variables locally and in the hosting platforms.

### Frontend

```env
VITE_API_URL=http://localhost:5000
```

For deployment, use the deployed backend API URL.

### Backend

Configure the MongoDB connection string and frontend CORS origin using the exact environment variable names required by the backend configuration.

**Important:** Never commit real passwords, database connection strings, or other secrets to GitHub. Use `.env.example` for sample values only.

## Running the Tests

### Backend Tests

```bash
dotnet test backend/ToolLoop.Api.Tests/ToolLoop.Api.Tests.csproj
```

### Frontend Tests

```bash
cd frontend
npm run test:run
```

The project has five backend tests and three frontend tests.

## How CI/CD Works

GitHub Actions automatically runs the project's CI workflow when changes are pushed to the `main` branch or when a pull request targets `main`.

The workflow contains two jobs:

- **Backend:** Restores dependencies and runs backend tests.
- **Frontend:** Installs dependencies, runs frontend tests, and builds the application.

Render Auto-Deploy is configured to deploy after CI checks pass.

## Diagrams

Insert the project diagrams created by the team:

1. System Architecture Diagram
2. CI/CD Pipeline Diagram
