# Full-Stack Task Management System

A robust, full-stack Task Management Single Page Application (SPA) built to production standards using modern web technologies. This application provides secure user authentication, full CRUD capabilities, server-side search and filtering, and strict data validation.

---

## 🛠️ Technology Stack

### Frontend
* **Framework:** React 18 with TypeScript (scaffolded via Vite)
* **Styling:** Tailwind CSS for responsive, utility-first UI design
* **Routing:** React Router DOM v6 with custom protected route wrappers
* **HTTP Client:** Axios with automated JWT header interceptors
* **State Management:** React Context API (`AuthContext`) for centralized authentication state

### Backend
* **Runtime & Framework:** Node.js with Express and TypeScript
* **ORM & Database:** Prisma ORM connected to a PostgreSQL database (hosted on Neon Cloud)
* **Authentication:** Stateless JSON Web Tokens (JWT) paired with Bcrypt password hashing
* **Validation:** Custom middleware and frontend validation rules enforcing logical constraints (e.g., future-only due dates)

---

## ✨ Key Features

* **Secure Authentication:** Users can sign in securely with encrypted password verification. The backend enforces user data isolation, ensuring individuals can only access and manipulate their own tasks.
* **Full CRUD Operations:**
  * **Create:** Add new tasks with title, detailed description, priority level (`Low`, `Medium`, `High`), workflow status (`Pending`, `In Progress`, `Completed`), and due dates via an intuitive modal form.
  * **Read:** Responsive grid layout displaying task cards with visual status and priority badges.
  * **Update:** Seamless editing of task details and status advancement.
  * **Delete:** Safe task removal with browser confirmation dialogs.
* **Server-Side Search & Filtering:**
  * Live search by task title using database-level text matching.
  * Dynamic filtering by specific workflow statuses and priority levels.
  * Multi-option sorting (Newest First, Oldest First, and Urgent Due Date).
* **Robust Validation:** Prevents submission of invalid data, including strict checks against setting due dates in the past.

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v20 or higher recommended)
* **npm** or **yarn**
* An active **PostgreSQL** database connection string (local or cloud-hosted via Neon/Supabase)

---

### 1. Repository Setup & Installation
Clone the repository and install dependencies for both the backend and frontend workspaces:

# Clone the repository
git clone <your-repository-url>
cd task-manager-assessment

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

### 2. Environment Configuration
Navigate to the backend folder and create a .env file with the following variables:

# backend/.env
PORT=5000
DATABASE_URL="postgresql://<username>:<password>@<host>/<dbname>?sslmode=require"
JWT_SECRET="your_super_secret_jwt_key_here"

### 3. Database Migration & Seeding
From inside the backend directory, push the Prisma schema to your PostgreSQL database and run the automated seed script to populate test data:

# Push database schema
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed database with default admin user and sample tasks
npx ts-node prisma/seed.ts
🔑 Default Test Credentials
The seed script generates an initial admin account for quick evaluation:

Email: admin@test.com

Password: 123456

### 4. Running the Application
You will need two terminal tabs/windows running concurrently from the root directory.

Terminal 1: Start the Backend API Server

cd backend
npm run dev
The backend server will start on http://localhost:5000.

Terminal 2: Start the Frontend Development Server

cd frontend
npm run dev
The frontend SPA will be accessible at http://localhost:5173.

### 📡 API Endpoints Overview
Authentication (/api/auth)
POST /api/auth/register — Register a new user account

POST /api/auth/login — Authenticate and receive a JWT

Tasks (/api/tasks - Requires Bearer Token)
GET /api/tasks — Retrieve all tasks for the logged-in user (supports ?search=, ?status=, ?priority=, and ?sortBy= query params)

POST /api/tasks — Create a new task

PUT /api/tasks/:id — Update an existing task by ID

DELETE /api/tasks/:id — Delete a task by ID

### 🏗️ Project Structure

task-manager-assessment/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema definitions
│   │   └── seed.ts            # Automated seeding script
│   ├── src/
│   │   ├── lib/               # Prisma database client instance
│   │   ├── middleware/        # JWT authentication & security wrappers
│   │   ├── routes/            # Express route controllers (auth, tasks)
│   │   └── index.ts           # Backend Express server entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/               # Axios instance & interceptor configuration
    │   ├── context/           # React AuthContext provider
    │   ├── hooks/             # Custom useAuth hook
    │   ├── pages/             # Login and Dashboard view components
    │   ├── App.tsx            # Root component with protected routing
    │   └── main.tsx           # Frontend DOM rendering
    ├── tailwind.config.js     # Tailwind CSS configuration
    └── package.json