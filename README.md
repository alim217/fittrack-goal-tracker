<div class="hero-icon" align="center">
  <img src="https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/ec559a9f6bfd399b82bb44393651661b08aaf7ba/icons/folder-markdown-open.svg" width="100" />
</div>

<h1 align="center">
fittrack-goal-tracker
</h1>
<h4 align="center">A web application MVP enabling fitness enthusiasts to track goals, monitor progress, and share achievements online.</h4>
<h4 align="center">Developed with the software and tools below.</h4>
<div class="badges" align="center">
  <img src="https://img.shields.io/badge/Frontend-React%2019%20+%20Vite-blue" alt="Frontend: React 19 + Vite">
  <img src="https://img.shields.io/badge/UI%20Framework-Chakra%20UI%203-red" alt="UI Framework: Chakra UI 3">
  <img src="https://img.shields.io/badge/Backend-Node.js%2020%20+%20Express%204-blue" alt="Backend: Node.js 20 + Express 4">
  <img src="https://img.shields.io/badge/Database-MongoDB%20+%20Mongoose%208-green" alt="Database: MongoDB + Mongoose 8">
  <img src="https://img.shields.io/badge/Authentication-JWT%20+%20bcryptjs-orange" alt="Authentication: JWT + bcryptjs">
</div>
<div class="badges" align="center">
  <img src="https://img.shields.io/github/last-commit/coslynx/fittrack-goal-tracker?style=flat-square&color=5D6D7E" alt="git-last-commit" />
  <img src="https://img.shields.io/github/commit-activity/m/coslynx/fittrack-goal-tracker?style=flat-square&color=5D6D7E" alt="GitHub commit activity" />
  <img src="https://img.shields.io/github/languages/top/coslynx/fittrack-goal-tracker?style=flat-square&color=5D6D7E" alt="GitHub top language" />
</div>

## 📑 Table of Contents
- [📍 Overview](#-overview)
- [📦 Features](#-features)
- [📂 Structure](#-structure)
- [💻 Installation](#-installation)
- [🏗️ Usage](#️-usage)
- [🌐 Hosting](#-hosting)
- [📜 API Documentation](#-api-documentation)
- [📄 License](#-license--attribution)
- [👏 Authors](#-authors)

## 📍 Overview
`fittrack-goal-tracker` is a Minimum Viable Product (MVP) web application designed for fitness enthusiasts. It provides a simple and intuitive interface for users to define their fitness goals (e.g., run 5k, lift 100kg), log progress entries against these goals, and visualize their journey. Built with a modern tech stack featuring React (with Vite) for the frontend and Node.js (with Express and Mongoose) for the backend, this application offers secure user authentication using JWT and robust data management with MongoDB. The core focus is on providing the essential tools for goal tracking and progress monitoring in an easy-to-use format.

## 📦 Features
|    | Feature            | Description                                                                                                                                                              |
|----|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ⚙️ | **Architecture**   | Monorepo structure using npm workspaces, separating `frontend` (React SPA via Vite) and `backend` (Node.js/Express REST API). API-first design with clear separation of concerns (MVC-like: Routes -> Controllers -> Models). |
| 📄 | **Documentation**  | This README provides an overview, setup guide, usage instructions, API endpoints, and deployment considerations for the MVP. Code includes JSDoc comments for key functions and models. |
| 🔗 | **Dependencies**   | **Frontend**: React 19, React Router DOM 6, Axios, Chakra UI 3. **Backend**: Express 4, Mongoose 8, JWT, bcryptjs, dotenv, CORS. Uses Node.js >= 20.14.0.                     |
| 🧩 | **Modularity**     | Backend structured into `routes`, `controllers`, `models`, and `middleware`. Frontend structured into `pages`, `components`, `services`, and `context`. Clear separation facilitates maintenance. |
| 🧪 | **Testing**        | Placeholder test scripts are included in `package.json`. Actual unit/integration tests are not part of this MVP but the structure allows for their future addition.       |
| ⚡️  | **Performance**    | Frontend built with Vite for optimized bundling. Backend uses Mongoose for MongoDB interaction with basic indexing on key fields (`userId`, `goalId`, `email`). Standard REST API performance considerations. |
| 🔐 | **Security**       | Secure password hashing using `bcryptjs`. JWT for stateless authentication. Sensitive configurations managed via `.env` file (MUST be kept secure and out of Git). CORS enabled on backend. Basic input validation on frontend forms and backend models/controllers. Data ownership enforced in controllers. |
| 🔀 | **Version Control**| Managed using Git. Assumes hosting on platforms like GitHub. Last commit and activity badges track repository status.                                                  |
| 🔌 | **Integrations**   | Frontend SPA communicates with the backend REST API via Axios. Backend interacts with a MongoDB database (local or cloud like Atlas) via Mongoose.                      |
| 📶 | **Scalability**    | The stateless nature of the JWT-based API and the use of MongoDB allow for standard scaling patterns (horizontal scaling of backend instances, MongoDB replica sets/sharding). MVP is focused on core functionality, not high-scale optimization. |

## 📂 Structure
```text
.
├── .env                  # Environment variables (secrets, config) - NOT COMMITTED
├── README.md             # This file
├── backend/              # Node.js Express API
│   ├── controllers/      # Request handling logic
│   │   ├── auth.controller.js
│   │   └── goal.controller.js
│   ├── middleware/       # Custom middleware (e.g., authentication)
│   │   └── auth.middleware.js
│   ├── models/           # Mongoose schemas and models
│   │   ├── Goal.model.js
│   │   ├── Progress.model.js
│   │   └── User.model.js
│   ├── routes/           # API route definitions
│   │   └── api.routes.js
│   ├── package.json      # Backend dependencies and scripts
│   └── server.js         # Express server entry point
├── frontend/             # React Vite SPA
│   ├── public/           # Static assets (served directly)
│   ├── src/              # Frontend source code
│   │   ├── components/   # Reusable UI components
│   │   │   ├── AuthForm.jsx
│   │   │   ├── GoalForm.jsx
│   │   │   ├── GoalList.jsx
│   │   │   └── ProgressLogForm.jsx
│   │   ├── context/      # React context providers (e.g., Auth)
│   │   │   └── AuthContext.jsx
│   │   ├── pages/        # Page-level components (routed views)
│   │   │   ├── AuthPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   └── GoalDetailPage.jsx
│   │   ├── services/     # API interaction logic
│   │   │   └── apiClient.js
│   │   ├── App.jsx       # Main application component with routing
│   │   └── main.jsx      # React application entry point
│   ├── .env              # Frontend environment variables (VITE_ prefixed)
│   ├── index.html        # HTML template for SPA
│   ├── package.json      # Frontend dependencies and scripts
│   └── vite.config.js    # Vite build configuration
├── package.json          # Root project configuration (workspaces, scripts)
└── commands.json         # (Generated, contains command references)
└── startup.sh            # (Generated, example startup script)
```

## 💻 Installation
 > [!WARNING]
 > ### 🔧 Prerequisites
 > - **Node.js**: Version `>=20.14.0` (check with `node -v`)
 > - **npm**: Version `>=10.x.x` (usually comes with Node.js, check with `npm -v`)
 > - **MongoDB**: A running MongoDB instance. You can use:
 >    - A local installation ([MongoDB Community Server](https://www.mongodb.com/try/download/community))
 >    - Docker ([Official MongoDB Image](https://hub.docker.com/_/mongo))
 >    - A cloud service like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (offers a generous free tier suitable for development/MVP).

 ### 🚀 Setup Instructions
 1.  **Clone the repository:**
     ```bash
     git clone https://github.com/coslynx/fittrack-goal-tracker.git
     cd fittrack-goal-tracker
     ```
 2.  **Install dependencies for all workspaces:**
     (This command installs dependencies for the root, backend, and frontend)
     ```bash
     npm run install:all
     # Or simply: npm install
     ```
 3.  **Configure Environment Variables:**
     *   **Backend:** Copy the example environment file in the *root* directory.
         ```bash
         cp .env.example .env
         ```
         Edit the `.env` file in the root directory and **replace placeholders** with your actual values:
         *   `PORT`: The port for the backend server (e.g., `5001`).
         *   `MONGODB_URI`: Your full MongoDB connection string.
             *   *Atlas Example:* `mongodb+srv://<username>:<password>@<cluster-url>/fitnessAppMvp?retryWrites=true&w=majority`
             *   *Local Example:* `mongodb://localhost:27017/fitnessAppMvp`
         *   `JWT_SECRET`: A **strong, random secret** string for signing tokens. **Generate a secure one!**
         *   `JWT_EXPIRES_IN`: Token expiration duration (e.g., `1d`, `7d`, `1h`).
     *   **Frontend:** The frontend reads its API URL from the *root* `.env` file during the build process. Ensure `VITE_API_BASE_URL` points to your running backend API (including `/api`).
         *   *Development Example:* `VITE_API_BASE_URL=http://localhost:5001/api` (Ensure `PORT` matches)

## 🏗️ Usage
### 🏃‍♂️ Running the MVP (Development Mode)
This command starts both the backend and frontend development servers concurrently with hot-reloading.
```bash
npm run dev
```
*   **Backend API** will typically run on `http://localhost:5001` (or the `PORT` specified in `.env`).
*   **Frontend UI** will typically run on `http://localhost:5173` (Vite's default, check console output).

> [!TIP]
> ### ⚙️ Configuration
> - All backend and frontend build configurations are managed via the `.env` file in the project root.
> - Ensure the `MONGODB_URI` is correct and the database server is accessible.
> - The `JWT_SECRET` is critical for security; keep it secret and make it strong.
> - `VITE_API_BASE_URL` must correctly point to the backend API endpoint (`/api` path included) for the frontend to function.

### 📚 Examples (User Flow)
1.  **Access the Frontend:** Open your browser to the frontend URL (e.g., `http://localhost:5173`).
2.  **Register:** Navigate to the authentication page, select 'Register', enter a valid email and a password (min 8 characters), and submit.
3.  **Login:** After registration (or if you have an account), use the 'Login' form with your credentials.
4.  **Dashboard:** Upon successful login, you'll be redirected to the dashboard.
5.  **Create Goal:** Click the "+ Create New Goal" button. A modal will appear. Enter a Title (required) and optional Description, then click "Save Goal".
6.  **View Goal Details:** Click on a goal card on the dashboard. You'll navigate to the goal detail page.
7.  **Log Progress:** On the goal detail page, use the "Log New Progress" form. Enter the Date, a Metric Value (required number), and optional Notes. Click "Log Progress".
8.  **View Progress:** The "Progress History" section on the detail page will update with your new entry, sorted by date.

## 🌐 Hosting
### 🚀 Deployment Instructions (General Guidance)
This MVP requires deploying two components: the Node.js backend API and the static React frontend build output. Common approaches include:

**Option 1: Platform-as-a-Service (e.g., Render, Heroku)**
1.  **Backend:** Deploy the `backend` directory as a Node.js service.
    *   Set the Build Command (usually `npm install --production --prefix backend` or handled by platform).
    *   Set the Start Command: `npm start --prefix backend`.
    *   Configure all required environment variables (`PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`) in the platform's dashboard.
2.  **Frontend:** Deploy the `frontend` directory as a Static Site.
    *   Set the Build Command: `npm run build --workspace=frontend`.
    *   Set the Publish Directory: `frontend/dist`.
    *   Configure the `VITE_API_BASE_URL` environment variable during the build process to point to your *deployed* backend API URL.

**Option 2: Docker & Container Orchestration**
1.  Create separate `Dockerfile`s for the `backend` and `frontend` (using a multi-stage build for the frontend to serve static files via a web server like Nginx).
2.  Build and push images to a container registry.
3.  Deploy containers using Docker Compose, Kubernetes, etc., ensuring proper networking and environment variable injection.

**Build Steps:**
*   Frontend: `npm run build --workspace=frontend` (Outputs to `frontend/dist`)
*   Backend: Ensure production dependencies are installed (`npm install --production --prefix backend` or handled by deployment platform).

### 🔑 Environment Variables (Production)
Ensure these variables are set securely in your hosting environment:
*   `NODE_ENV`: Set to `production`.
*   `PORT`: Port for the backend server (often provided by the platform).
*   `MONGODB_URI`: Connection string for your production MongoDB database.
*   `JWT_SECRET`: **A strong, unique secret specifically for production.**
*   `JWT_EXPIRES_IN`: Production token lifetime (e.g., `1d`).
*   `VITE_API_BASE_URL`: **Absolute URL** of your deployed backend API (e.g., `https://your-api.onrender.com/api`). This is a *build-time* variable for the frontend.

## 📜 API Documentation
The backend exposes a RESTful API consumed by the frontend.

### 🔍 Endpoints
Base Path: `/api` (as configured in `backend/server.js` and `VITE_API_BASE_URL`)

*   **Authentication:**
    *   `POST /auth/register`
        *   Description: Register a new user.
        *   Body: `{ "email": "user@example.com", "password": "yourpassword" }`
        *   Response (Success 201): `{ "token": "jwt.token.string" }`
        *   Response (Error 400/409): `{ "message": "Error details..." }`
    *   `POST /auth/login`
        *   Description: Log in an existing user.
        *   Body: `{ "email": "user@example.com", "password": "yourpassword" }`
        *   Response (Success 200): `{ "token": "jwt.token.string" }`
        *   Response (Error 400/401): `{ "message": "Error details..." }`

*   **Goals (Protected Routes):**
    *   `POST /goals`
        *   Description: Create a new goal for the authenticated user.
        *   Headers: `Authorization: Bearer <token>`
        *   Body: `{ "title": "Run 5k", "description": "Train 3 times a week", "status": "active"?, "targetDate": "YYYY-MM-DD"? }`
        *   Response (Success 201): `{ "goal": { ...new goal object... } }`
    *   `GET /goals`
        *   Description: Get all goals for the authenticated user.
        *   Headers: `Authorization: Bearer <token>`
        *   Response (Success 200): `{ "goals": [ { ...goal object... }, ... ] }`
    *   `GET /goals/:id`
        *   Description: Get a specific goal by ID belonging to the user.
        *   Headers: `Authorization: Bearer <token>`
        *   Response (Success 200): `{ "goal": { ...goal object... } }`
        *   Response (Error 404): `{ "message": "Goal not found." }`
    *   `PUT /goals/:id`
        *   Description: Update a specific goal by ID belonging to the user.
        *   Headers: `Authorization: Bearer <token>`
        *   Body: `{ "title": "Updated Title"?, "description": "Updated Desc"?, "status": "completed"?, "targetDate": "YYYY-MM-DD"? }`
        *   Response (Success 200): `{ "goal": { ...updated goal object... } }`
    *   `DELETE /goals/:id`
        *   Description: Delete a specific goal by ID (and its progress logs) belonging to the user.
        *   Headers: `Authorization: Bearer <token>`
        *   Response (Success 204): No content.
        *   Response (Error 404): `{ "message": "Goal not found." }`

*   **Progress (Protected Routes):**
    *   `POST /goals/:goalId/progress`
        *   Description: Log a progress entry for a specific goal.
        *   Headers: `Authorization: Bearer <token>`
        *   Body: `{ "date": "YYYY-MM-DD"?, "notes": "Did well"?, "value": 5? }` (`value` corresponds to the 'Metric Value' field)
        *   Response (Success 201): `{ "progress": { ...new progress object... } }`
        *   Response (Error 404): `{ "message": "Target goal not found." }`
    *   `GET /goals/:goalId/progress`
        *   Description: Get all progress entries for a specific goal.
        *   Headers: `Authorization: Bearer <token>`
        *   Response (Success 200): `{ "progressLogs": [ { ...progress object... }, ... ] }`
        *   Response (Error 404): `{ "message": "Target goal not found." }`

### 🔒 Authentication
*   All routes under `/api/goals` and `/api/goals/:goalId/progress` require authentication.
*   Obtain a JWT by calling `/api/auth/register` or `/api/auth/login`.
*   Include the obtained token in the `Authorization` header for all protected requests:
    ```
    Authorization: Bearer <YOUR_JWT_TOKEN>
    ```
*   Tokens expire based on the `JWT_EXPIRES_IN` environment variable. The frontend currently requires re-login upon expiry.

### 📝 Examples (API Payloads)

**Create Goal Payload (`POST /api/goals`):**
```json
{
  "title": "Complete Morning Workout Routine",
  "description": "Focus on consistency: 15min cardio, 15min strength.",
  "status": "active"
}
```

**Log Progress Payload (`POST /api/goals/<goalId>/progress`):**
```json
{
  "date": "2024-07-21",
  "notes": "Felt strong today, increased weight.",
  "value": 7  // Represents achieving the routine 7 times this week, or weight lifted, etc. (context depends on goal)
}
```


> [!NOTE]
> ## 📜 License & Attribution
>
> ### 📄 License
> This Minimum Viable Product (MVP) is licensed under the [GNU AGPLv3](https://choosealicense.com/licenses/agpl-3.0/) license.
>
> ### 🤖 AI-Generated MVP
> This MVP was entirely generated using artificial intelligence through [CosLynx.com](https://coslynx.com).
>
> No human was directly involved in the coding process of the repository: fittrack-goal-tracker
>
> ### 📞 Contact
> For any questions or concerns regarding this AI-generated MVP, please contact CosLynx at:
> - Website: [CosLynx.com](https://coslynx.com)
> - Twitter: [@CosLynxAI](https://x.com/CosLynxAI)

<p align="center">
  <h1 align="center">🌐 CosLynx.com</h1>
</p>
<p align="center">
  <em>Create Your Custom MVP in Minutes With CosLynxAI!</em>
</p>
<div class="badges" align="center">
<img src="https://img.shields.io/badge/Developers-Drix10,_Kais_Radwan-red" alt="">
<img src="https://img.shields.io/badge/Website-CosLynx.com-blue" alt="">
<img src="https://img.shields.io/badge/Backed_by-Google,_Microsoft_&_Amazon_for_Startups-red" alt="">
<img src="https://img.shields.io/badge/Finalist-Backdrop_Build_v4,_v6-black" alt="">
</div>