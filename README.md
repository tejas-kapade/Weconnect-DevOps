# WeConnect

WeConnect is a real-time group chat application built with Node.js, Express, Socket.IO, and MariaDB. It supports user authentication, pool-based conversations, admin-only SQL access, containerized local development, Kubernetes deployment, and a working CI/CD pipeline that builds Docker images and rolls updates to GKE automatically.

## Workflow Diagram
<img width="3908" height="1487" alt="diagram-export-25-04-2026-00_42_54" src="https://github.com/user-attachments/assets/6d00ebe4-b46a-4510-8780-4995e2dbf2e7" />


## Screenshots

### Login Page

<img width="1596" height="775" alt="image" src="https://github.com/user-attachments/assets/4a4d66c1-96ce-48aa-82e6-2a9864a67a6b" />

### Pools page

<img width="1602" height="779" alt="image" src="https://github.com/user-attachments/assets/4c7c1fc2-c4ee-4808-8f1d-a96edb42eb0d" />

### Chatting page

<img width="1919" height="963" alt="image" src="https://github.com/user-attachments/assets/de635781-3709-4a17-bc14-3e0adc65d2b8" />

### Admin Panel

<img width="1893" height="955" alt="image" src="https://github.com/user-attachments/assets/7b9fc02e-023d-4368-b380-5238ded02ad7" />

### Responsive to mobile devices
<img width="1080" height="2306" alt="image" src="https://github.com/user-attachments/assets/02267740-4359-4685-8913-20fe15027333" />

## Features

- User registration and login with JWT-based authentication
- Pool creation and password-protected pool joining
- Real-time messaging with Socket.IO rooms
- Chat history stored in MariaDB
- Admin-only query console for database inspection and operations
- Dockerized application setup for local development
- Kubernetes manifests for app and database deployment
- GitHub Actions pipeline for build, push, and GKE rollout

## Tech Stack

- Backend: Node.js, Express
- Realtime: Socket.IO
- Database: MariaDB / MySQL-compatible schema
- Authentication: JWT, bcrypt
- Containerization: Docker, Docker Compose
- Orchestration: Kubernetes on GKE
- CI/CD: GitHub Actions, Docker Hub, Google Kubernetes Engine

## Application Flow

1. A user opens the app and lands on the login page.
2. After login, the backend returns a JWT token.
3. The user can view available pools, create a new pool, or join an existing one using a password.
4. Once inside a pool, Socket.IO connects the user to a room such as `pool_<id>`.
5. Messages are stored in the database and broadcast in real time to connected members.
6. Admin users can access the admin console and execute SQL queries through the protected `/admin/query` endpoint.

## Project Structure

```text
weconnect/
├── .github/workflows/        # CI/CD pipeline
├── db/                       # Database schema and seed SQL
├── k8s/                      # Kubernetes manifests
├── public/                   # Frontend pages, CSS, and browser JS
├── src/
│   ├── config/               # DB config
│   ├── controllers/          # Route handlers
│   ├── middleware/           # Auth and admin middleware
│   ├── routes/               # Express routes
│   └── services/             # DB service layer
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Core Pages

- `public/login.html`: login entry page
- `public/register.html`: registration page
- `public/pools.html`: pool listing and pool management
- `public/chat.html`: real-time chat room UI
- `public/admin.html`: admin query console

## API Overview

### Authentication

- `POST /auth/register` - register a new user
- `POST /auth/login` - authenticate and receive JWT

### Pools

- `GET /pools` - fetch all pools for authenticated users
- `POST /pools/create` - create a pool
- `POST /pools/join` - join a pool using its password
- `DELETE /pools/:id` - delete a pool if you are the creator or admin
- `GET /pools/admin/all` - admin-only pool listing
- `DELETE /pools/admin/:id` - admin-only pool deletion

### Messages

- `GET /messages/:poolId` - fetch message history for a pool
- `POST /messages/send` - send a message

### Admin

- `POST /admin/query` - run SQL queries as an admin user

## Database Schema

The application uses four main tables:

- `users`: stores user accounts and roles
- `pools`: stores chat pools and their creators
- `pool_members`: tracks which users joined which pools
- `messages`: stores chat messages for each pool

The initial schema and sample data are available in [db/db.sql](db/db.sql).

## Environment Variables

Create a `.env` file in the project root for local development:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=WECONDB
JWT_SECRET=your_jwt_secret
```

## Run Locally

### Option 1: Node.js

```bash
npm install
npm run dev
```

The app will start on `http://localhost:3000`.

### Option 2: Docker Compose

```bash
docker compose up --build
```

This starts:

- `weconnect-app` on port `3000`
- `weconnect-db` on port `3306`

The SQL file in `db/db.sql` is mounted into the MariaDB container and initializes the database on first startup.

## Docker

The production image is built from the root [Dockerfile](Dockerfile):

- Uses `node:18-alpine`
- Installs dependencies with `npm ci`
- Exposes port `3000`
- Starts the server with `npm start`

Build manually:

```bash
docker build -t weconnect:local .
```

Run manually:

```bash
docker run -p 3000:3000 --env-file .env weconnect:local
```

## Kubernetes Deployment

The `k8s/` folder contains manifests for both the application and the database:

- `app-deployment.yaml`
- `app-service.yaml`
- `db-deployment.yaml`
- `db-service.yaml`
- `db-pvc.yaml`
- `db-configMap.yaml`
- `secrets.yaml`

Apply the manifests:

```bash
kubectl apply -f k8s/
```

Current Kubernetes setup includes:

- App deployment named `weconnect-app`
- App service exposed as `LoadBalancer`
- MariaDB deployment with persistent storage
- Secret-based injection for database password and JWT secret

## CI/CD Workflow

The GitHub Actions workflow is defined in [.github/workflows/build-push-deploy.yml](.github/workflows/build-push-deploy.yml).

### What Happens on Every Push to `main`

1. GitHub Actions checks out the code.
2. The workflow generates a version tag using the Git commit short SHA.
3. Docker Buildx builds the application image.
4. The image is pushed to Docker Hub with:
   - `<short-sha>`
   - `latest`
5. GitHub Actions authenticates to Google Cloud using Workload Identity.
6. GKE credentials are fetched for the target cluster.
7. `kubectl set image` updates the running deployment with the new SHA-based image tag.
8. `kubectl rollout status` waits until the deployment completes successfully.

### Image Tag Strategy

Each successful push to `main` produces:

- `your-dockerhub-username/weconnect:<short-sha>`
- `your-dockerhub-username/weconnect:latest`

This gives you:

- An immutable deployment image tied to a specific commit
- A moving `latest` tag for convenience

## Required GitHub Secrets

The pipeline expects these repository secrets:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_PASSWORD`
- `GCP_PROJECT_ID`
- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GKE_CLUSTER_NAME`
- `GKE_CLUSTER_LOCATION`

The workflow currently uses a fixed Google service account email inside the pipeline for GKE access.

## Deployment Architecture

```text
Developer Pushes Code
        |
        v
 GitHub Actions
        |
        v
 Build Docker Image
        |
        v
 Push to Docker Hub
        |
        v
 Authenticate to GCP
        |
        v
 Connect to GKE Cluster
        |
        v
 Update Kubernetes Deployment
        |
        v
 Rolling Update on GKE
```

## Security Notes

- JWT is used for protected routes and realtime socket authentication.
- Admin routes are protected by auth and admin middleware.
- Database credentials and JWT secret should be stored in Kubernetes Secrets and GitHub Secrets, not hardcoded values.
- The admin SQL console is powerful and should only be exposed to trusted admin users.

## Known Improvement Areas

- Move all hardcoded defaults fully into environment variables
- Add automated tests for routes and socket events
- Add readiness and liveness probes in Kubernetes
- Restrict admin SQL execution to safer operations if needed
- Improve DB startup resiliency with retry logic

## Author

Built by Tejas Kapade.

Repository link:

- [tejas-kapade/Weconnect-DevOps](https://github.com/tejas-kapade/Weconnect-DevOps)
