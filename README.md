
# AWS DevOps Capstone

This is a task management application built to demonstrate DevOps practices, cloud infrastructure automation, containerisation, Kubernetes orchestration, and deployment reliability.

## Project Objectives

- Provision cloud infrastructure using Terraform.
- Containerise the frontend and backend with Docker.
- Deploy and manage application workloads with Kubernetes.
- Implement health checks, resource limits, and rolling updates.
- Manage application configuration and secrets securely.
- Configure remote Terraform state and state locking.
- Document architecture, testing, deployment, and cleanup procedures.

## Planned Architecture

- **Frontend:** Task management user interface.
- **Backend:** REST API for task operations.
- **Database:** Persistent storage for tasks.
- **Containers:** Docker images for the application services.
- **Orchestration:** Kubernetes.
- **Infrastructure as Code:** Terraform.
- **Cloud Platform:** AWS.
- **Local Development:** Docker and OrbStack Kubernetes.

## Project Status

- [x] Initialise Git repository.
- [x] Create project directory structure.
- [ ] Build the frontend and backend.
- [ ] Containerise the application.
- [ ] Deploy and test locally on Kubernetes.
- [ ] Implement Terraform infrastructure.
- [ ] Deploy to AWS after reviewing security and cost safeguards.
- [ ] Document testing and deployment evidence.

## Docker Images

TaskFlow's frontend and backend are packaged as separate Docker images and published to Docker Hub.

| Component | Image | Version |
|---|---|---|
| Frontend | `timiajiboye/taskflow-frontend` | `0.1.0` |
| Backend | `timiajiboye/taskflow-backend` | `0.1.6` |

Both images are designed to stay below the 150 MB size requirement.

## Local Kubernetes Deployment

The application has been tested on a local Kubernetes cluster using OrbStack.

The deployment includes:
- Frontend and backend Deployments with two replicas each.
- PostgreSQL with persistent volume storage.
- Kubernetes Services for internal communication.
- Resource requests, resource limits, and health probes.
- Rolling update settings designed to avoid application downtime.

### Accessing the application

Apply the Kubernetes manifests:

```bash
kubectl apply -k k8s/base
```

Check deployment status:

```bash
kubectl get pods
kubectl rollout status deployment/taskflow-backend
kubectl rollout status deployment/taskflow-frontend
```

Access the frontend locally:

```bash
kubectl port-forward service/taskflow-frontend 8080:8080
```

Open `http://localhost:8080` in your browser.

### Database credentials

Local database credentials are stored in a Kubernetes Secret created from the `.env` file. The `.env` file and any Secret manifests containing credentials must not be committed to Git.

The PostgreSQL PersistentVolumeClaim allows task data to survive PostgreSQL pod replacement in the local cluster.

## Security and Cost

No AWS infrastructure is created during the initial local development phase. Cloud deployment will happen only after the application and infrastructure configuration have been reviewed.

Secrets and Terraform state files must not be committed to Git.

## Cleanup

The final documentation will include instructions for removing deployed resources to minimise ongoing AWS costs.
