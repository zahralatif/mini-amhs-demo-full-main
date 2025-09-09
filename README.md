# Mini AMHS — Full‑Stack Demo (Next.js + Go + Postgres)

This project is a simple, full-stack messaging application demonstrating a Go backend, a Next.js frontend, and a PostgreSQL database.

## Getting Started

Follow these instructions to get the project set up and running on your local machine.

### Prerequisites

Make sure you have the following tools installed:

*   [Git](https://git-scm.com/)
*   [Go](https://go.dev/doc/install) (version 1.18 or later)
*   [Node.js](https://nodejs.org/) (version 18 or later)
*   [npm](https://www.npmjs.com/) (usually comes with Node.js)
*   [PostgreSQL](https://www.postgresql.org/download/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/user/repo.git
    cd repo
    ```
    *(Note: You will need to replace the URL with the actual repository URL.)*

## Running the Application

The application consists of three parts: a database, a backend server, and a frontend server. You will need to run each in a separate terminal window.

### 1. Run the Database

1.  Make sure your PostgreSQL server is running.
2.  Create the database and tables by running the initialization script. You may need to enter your password.
    ```bash
    createdb -U postgres amhs_demo || true
    psql -U postgres -d amhs_demo -f database/init.sql
    ```
    This script assumes you have a PostgreSQL user named `postgres` with the password `postgres`. If your setup is different, you will need to adjust the `DB_DSN` environment variable in the next step.

### 2. Run the Backend

1.  Open a new terminal window.
2.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
3.  Set the database connection string as an environment variable.
    ```bash
    export DB_DSN="postgres://postgres:postgres@localhost:5432/amhs_demo?sslmode=disable"
    export CORS_ORIGIN="http://localhost:3000"
    ```
4.  Install the Go dependencies:
    ```bash
    go mod tidy
    ```
5.  Start the backend server:
    ```bash
    go run .
    ```
    The API server should now be running on `http://localhost:8080`.

6.  Quick API smoke test:
    ```bash
    curl -s http://localhost:8080/api/health
    curl -s -X POST http://localhost:8080/api/messages \
      -H 'Content-Type: application/json' \
      -d '{"sender":"EGLL","receiver":"KJFK","subject":"TEST","body":"Hello from LHR"}'
    curl -s 'http://localhost:8080/api/messages?receiver=KJFK'
    ```

### 3. Run the Frontend

1.  Open a third terminal window.
2.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
3.  Install the Node.js dependencies:
    ```bash
    npm install
    ```
4.  Start the frontend development server:
    ```bash
    npm run dev
    ```
    The application should now be accessible in your web browser at `http://localhost:3000`.

You can also set `NEXT_PUBLIC_API_BASE` in `frontend/.env` to point to a different API host if needed.
