
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

## Security and Cost

No AWS infrastructure is created during the initial local development phase. Cloud deployment will happen only after the application and infrastructure configuration have been reviewed.

Secrets and Terraform state files must not be committed to Git.

## Cleanup

The final documentation will include instructions for removing deployed resources to minimise ongoing AWS costs.
