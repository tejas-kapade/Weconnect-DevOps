# WeConnect

WeConnect is a real-time group chat application built with Node.js, Express, Socket.IO, and MariaDB. It includes JWT-based authentication, pool-based chat rooms, admin-only SQL access, containerized local development, Kubernetes deployment to GKE, CI/CD with GitHub Actions, and monitoring with Prometheus and Grafana.

## Workflow Diagram
<img width="3908" height="1487" alt="diagram-export-25-04-2026-00_42_54" src="https://github.com/user-attachments/assets/6d00ebe4-b46a-4510-8780-4995e2dbf2e7" />

## Screenshots

### Login Page

<img width="1596" height="775" alt="image" src="https://github.com/user-attachments/assets/4a4d66c1-96ce-48aa-82e6-2a9864a67a6b" />

### Pools Page

<img width="1602" height="779" alt="image" src="https://github.com/user-attachments/assets/4c7c1fc2-c4ee-4808-8f1d-a96edb42eb0d" />

### Chat Page

<img width="1919" height="963" alt="image" src="https://github.com/user-attachments/assets/de635781-3709-4a17-bc14-3e0adc65d2b8" />

### Admin Panel

<img width="1893" height="955" alt="image" src="https://github.com/user-attachments/assets/7b9fc02e-023d-4368-b380-5238ded02ad7" />

### Mobile Responsive

<img width="1607" height="954" alt="image" src="https://github.com/user-attachments/assets/b8b54659-1f72-49e3-97d7-421828631c8c" />

## Features

- User registration and login with JWT-based authentication
- Pool creation and password-protected pool joining
- Real-time messaging with Socket.IO rooms
- Chat history stored in MariaDB
- Admin-only SQL query console
- Docker and Docker Compose based local development
- Kubernetes deployment manifests for app and database
- Prometheus metrics endpoint at `/metrics`
- Grafana dashboards for app-level monitoring
- GitHub Actions pipeline for build, push, and deploy

## Tech Stack

- Backend: Node.js, Express
- Realtime: Socket.IO
- Database: MariaDB / MySQL-compatible schema
- Authentication: JWT, bcrypt
- Monitoring: Prometheus, Grafana, kube-prometheus-stack
- Containerization: Docker, Docker Compose
- Orchestration: Kubernetes on GKE
- CI/CD: GitHub Actions, Docker Hub, Google Kubernetes Engine

## Application Flow

1. A user opens the app and lands on the login page.
2. After login, the backend returns a JWT token.
3. The user can view pools, create a new pool, or join an existing pool with a password.
4. Once inside a pool, Socket.IO connects the user to a room like `pool_<id>`.
5. Messages are stored in MariaDB and broadcast in real time to connected users.
6. Admin users can access the admin console and execute SQL queries through `/admin/query`.

## Project Structure

```text
weconnect/
|-- .github/workflows/              # CI/CD pipeline
|-- db/                             # Database schema and seed SQL
|-- helm/
|   |-- monitoring/                 # kube-prometheus-stack values
|   `-- weconnect-observability/    # App-specific ServiceMonitor and Grafana dashboard chart
|-- k8s/                            # App and database Kubernetes manifests
|-- monitoring/                     # Local Docker Compose Prometheus/Grafana config
|-- public/                         # Frontend pages, CSS, browser JS
|-- src/                            # Express app, routes, services, middleware
|-- Dockerfile
|-- docker-compose.yml
`-- package.json
```

## Core Pages

- `public/login.html`: login entry page
- `public/register.html`: registration page
- `public/pools.html`: pool listing and pool management
- `public/chat.html`: real-time chat room UI
- `public/admin.html`: admin query console

## API Overview

### Authentication

- `POST /auth/register`: Register a new user
- `POST /auth/login`: Authenticate and receive a JWT

### Pools

- `GET /pools`: Fetch all pools for authenticated users
- `POST /pools/create`: Create a pool
- `POST /pools/join`: Join a pool with its password
- `DELETE /pools/:id`: Delete a pool if you are the creator or an admin
- `GET /pools/admin/all`: Admin-only pool listing
- `DELETE /pools/admin/:id`: Admin-only pool deletion

### Messages

- `GET /messages/:poolId`: Fetch chat history for a pool
- `POST /messages/send`: Send a message

### Admin

- `POST /admin/query`: Execute SQL queries as an admin user

## Database Schema

The application uses four main tables:

- `users`: User accounts and roles
- `pools`: Chat pools and their creators
- `pool_members`: User membership in pools
- `messages`: Pool chat messages

The initial schema and sample data are available in `db/db.sql`.

## Environment Variables

Create a `.env` file in the project root for local development:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=WECONDB
JWT_SECRET=your_jwt_secret
PORT=3000
```

## Run Locally

### Option 1: Node.js

```bash
npm install
npm run dev
```

The app starts on `http://localhost:3000`.

### Option 2: Docker Compose

```bash
docker compose up --build
```

This starts:

- `weconnect-app` on `http://localhost:3000`
- `weconnect-db` on port `3306`
- `weconnect-prometheus` on `http://localhost:9090`
- `weconnect-grafana` on `http://localhost:3001`

Grafana local credentials:

- Username: `admin`
- Password: `admin123`

Prometheus is preconfigured to scrape the app, and Grafana is preconfigured with Prometheus as its default datasource.

## Monitoring

The application exposes Prometheus metrics at `GET /metrics`.

Current app metrics include:

- Default Node.js and process metrics from `prom-client`
- Total HTTP requests
- HTTP request latency histogram
- Connected Socket.IO clients

### Local Monitoring Files

- `monitoring/prometheus/prometheus.yml`
- `monitoring/grafana/provisioning/datasources/prometheus.yml`

### Kubernetes Monitoring Architecture

Kubernetes monitoring is split into two layers:

1. `kube-prometheus-stack`
   Provides Prometheus, Grafana, CRDs, and persistent storage configuration.

2. `weconnect-observability`
   Provides the app-specific `ServiceMonitor` and the Grafana dashboard for WeConnect.

### Helm Files

- `helm/monitoring/values.yaml`
- `helm/weconnect-observability/Chart.yaml`
- `helm/weconnect-observability/values.yaml`
- `helm/weconnect-observability/templates/servicemonitor.yaml`
- `helm/weconnect-observability/templates/dashboard-configmap.yaml`
- `helm/weconnect-observability/files/dashboards/weconnect-overview.json`

### Persistence

The monitoring stack is configured with persistent volumes:

- Grafana PVC: `10Gi`
- Prometheus PVC: `20Gi`
- Storage class: `standard-rwo`

Update `helm/monitoring/values.yaml` if your cluster uses a different storage class.

## Docker

The production image is built from the root `Dockerfile`:

- Base image: `node:18-alpine`
- Dependencies installed with `npm ci`
- App port: `3000`
- Start command: `npm start`

Build manually:

```bash
docker build -t weconnect:local .
```

Run manually:

```bash
docker run -p 3000:3000 --env-file .env weconnect:local
```

## Kubernetes Deployment

The `k8s/` folder contains the base application and database manifests:

- `app-deployment.yaml`
- `app-service.yaml`
- `db-deployment.yaml`
- `db-service.yaml`
- `db-pvc.yaml`
- `db-configMap.yaml`
- `secrets.yaml`

Apply them with:

```bash
kubectl apply -f k8s/
```

Note:
Do not rely on `kubectl apply -f k8s/` for `ServiceMonitor` resources before Prometheus Operator CRDs exist. Those CRDs are installed by the Helm monitoring stack.

### Install Monitoring with Helm

Install the monitoring stack first:

```powershell
kubectl create namespace monitoring
.\tools\helm\helm.exe repo add prometheus-community https://prometheus-community.github.io/helm-charts
.\tools\helm\helm.exe repo update
.\tools\helm\helm.exe upgrade --install monitoring prometheus-community/kube-prometheus-stack `
  --namespace monitoring `
  -f .\helm\monitoring\values.yaml
```

Then install the WeConnect observability chart:

```powershell
.\tools\helm\helm.exe upgrade --install weconnect-observability .\helm\weconnect-observability `
  --namespace monitoring
```

This creates:

- A persistent Prometheus instance
- A persistent Grafana instance
- A `ServiceMonitor` for `weconnect-service`
- A starter Grafana dashboard named `WeConnect Overview`

### Verify Monitoring

```powershell
kubectl get pods -n monitoring
kubectl get servicemonitor -n monitoring
kubectl get configmap -n monitoring weconnect-grafana-dashboard
kubectl logs -n monitoring deployment/monitoring-grafana -c grafana-sc-dashboard
```

### Access Grafana

Get the service:

```powershell
kubectl get svc -n monitoring
```

Then open the `monitoring-grafana` external IP in your browser.

If the dashboard does not appear immediately, restart Grafana once:

```powershell
kubectl rollout restart deployment monitoring-grafana -n monitoring
```

### Important Production Notes

- Change `grafana.adminPassword` in `helm/monitoring/values.yaml`
- Move Grafana admin credentials into a Kubernetes Secret or external secret manager
- Adjust `storageClassName` if your cluster does not use `standard-rwo`
- Consider adding ingress and authentication in front of Grafana

## CI/CD Workflow

The GitHub Actions workflow is defined in `.github/workflows/build-push-deploy.yml`.

### What Happens on Every Push to `main`

1. GitHub Actions checks out the repository.
2. A short Git SHA is generated as the image tag.
3. Docker Buildx builds the application image.
4. The image is pushed to Docker Hub with both the short SHA tag and `latest`.
5. GitHub Actions authenticates to Google Cloud using Workload Identity.
6. GKE credentials are fetched.
7. The running Kubernetes deployment is updated with the new image.
8. The rollout status is checked until deployment completes.

### Image Tag Strategy

Each successful push to `main` produces:

- `your-dockerhub-username/weconnect:<short-sha>`
- `your-dockerhub-username/weconnect:latest`

This gives you:

- An immutable image tied to a specific commit
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

- JWT protects secure routes and Socket.IO authentication
- Admin routes are protected by auth and admin middleware
- Database credentials and JWT secret should be stored in Kubernetes Secrets and GitHub Secrets, not hardcoded values
- The admin SQL console is powerful and should only be exposed to trusted users
- Grafana should not keep the default admin password in production

## Known Improvement Areas

- Move all hardcoded defaults fully into environment variables
- Add automated tests for routes and Socket.IO events
- Add readiness and liveness probes in Kubernetes
- Restrict admin SQL execution to safer operations if needed
- Improve DB startup resiliency with retry logic
- Extend dashboards with Node.js CPU, memory, and event loop panels

## Author

Built by Tejas Kapade.

Repository link:

- [tejas-kapade/Weconnect-DevOps](https://github.com/tejas-kapade/Weconnect-DevOps)
