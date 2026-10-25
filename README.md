# AWS DevOps Capstone: TaskFlow

TaskFlow is a simple task management application built to demonstrate containerisation, Kubernetes orchestration, infrastructure automation, and deployment reliability.

## Project Objectives

- Provision cloud infrastructure using Terraform.
- Build and publish Docker images for the frontend and backend, each under 150 MB.
- Deploy application workloads using Kubernetes.
- Configure health probes, resource limits, and rolling updates.
- Use persistent storage for PostgreSQL.
- Configure remote Terraform state and state locking.
- Document architecture, testing, deployment, security, and cleanup.

## Architecture

```text
                         Developer
                             |
                       GitHub Repository
                             |
                  Terraform Infrastructure
                             |
                            AWS
                             |
                 +-----------+-----------+
                 |                       |
              VPC Network            EKS Cluster
                 |                       |
          +------+-------+        +------+-------+
          |              |        |              |
     Public Subnets  Private Subnets      Worker Nodes
          |              |                 |
      Internet GW   Cluster Network   Kubernetes Pods
                                            |
                                   +--------+--------+
                                   |        |        |
                                Frontend  Backend  PostgreSQL
                                   |        |        |
                                   +--------+--------+
                                            |
                                      Persistent PVC

       Local development and Kubernetes testing use OrbStack.
```

The diagram represents the intended AWS architecture. The Terraform configuration has been prepared and validated, but the AWS VPC, EKS cluster, and worker nodes have not been deployed.

## Project Status

- [x] Initialise Git repository and publish the project to GitHub.
- [x] Build the TaskFlow frontend and backend.
- [x] Build and publish Docker images to Docker Hub.
- [x] Keep both application images below 150 MB.
- [x] Deploy and test locally on Kubernetes using OrbStack.
- [x] Configure health probes, resource requests, limits, and rolling updates.
- [x] Test PostgreSQL persistence after pod replacement.
- [x] Configure Terraform modules for networking and EKS.
- [x] Configure an encrypted, versioned S3 bucket for remote Terraform state and native state locking.
- [x] Validate the Terraform configuration and review the plan.
- [ ] Complete the AWS networking, security, and cost review.
- [ ] Deploy to AWS if approved.
- [ ] Capture final evidence and complete deployment documentation.

## Docker Images

The application images are published to Docker Hub.

| Component | Image | Version | Approximate size |
|---|---|---|---|
| Frontend | `timiajiboye/taskflow-frontend` | `0.1.0` | 60.7 MB |
| Backend | `timiajiboye/taskflow-backend` | `0.1.6` | About 98 MB |

Both application images use non-root runtime users and meet the 150 MB image-size requirement.

## Local Kubernetes Deployment

The application has been tested on a local Kubernetes cluster using OrbStack.

The deployment includes:

- Two frontend replicas and two backend replicas.
- PostgreSQL with persistent volume storage.
- Kubernetes Services for internal communication.
- Resource requests, limits, and health probes.
- Rolling update settings with zero unavailable replicas during a normal rolling update.

### Deploy locally

From the project root, apply the Kubernetes manifests:

```bash
kubectl apply -k k8s/base
```

Check the pods and rollout status:

```bash
kubectl get pods
kubectl rollout status deployment/taskflow-backend
kubectl rollout status deployment/taskflow-frontend
```

Access the frontend:

```bash
kubectl port-forward service/taskflow-frontend 8080:8080
```

Open [http://localhost:8080](http://localhost:8080) in your browser. Keep the port-forward command running while using the application.

### Database persistence

PostgreSQL stores task data on a PersistentVolumeClaim. Persistence was tested locally by replacing the PostgreSQL pod and confirming that previously created tasks remained available.

### Database credentials

Local database credentials are supplied through a Kubernetes Secret created from the local `.env` file. The `.env` file and any manifests containing real credentials must not be committed to Git.

## Terraform Infrastructure

Terraform configuration is located in the `terraform/` directory.

- `main.tf`: AWS provider, common tags, and module configuration.
- `variables.tf`: root input variables.
- `outputs.tf`: network outputs.
- `backend.tf`: S3 remote state backend and native S3 state locking.
- `modules/network/`: VPC, public and private subnets, Internet Gateway, and public routing.
- `modules/cluster/`: EKS control-plane IAM role, EKS cluster, worker-node IAM role, and managed node group.

The S3 state bucket is configured with public access blocked, server-side encryption, and versioning. Terraform state can contain sensitive infrastructure information and must not be committed to Git.

### Validate and preview changes

Run these commands from the project root:

```bash
terraform -chdir=terraform fmt -recursive
terraform -chdir=terraform validate
terraform -chdir=terraform plan
```

`terraform plan` previews the proposed changes; it does not deploy infrastructure.

**Important:** The current configuration is not a completed AWS deployment. Review subnet routing, worker-node connectivity, endpoint access, IAM permissions, and expected costs before applying it.

## Security and Cost Decisions

- Keep credentials and `.env` files out of Git.
- Keep Terraform state in the configured private, encrypted, versioned S3 bucket.
- Restrict public access to the EKS API to trusted IP addresses and update the allowlist if the public IP changes.
- Review worker-node security groups and network connectivity before deployment.
- The current worker-node design uses public subnets to avoid NAT Gateway charges. Public subnet placement requires careful security configuration.
- The monthly AWS budget is an alert, not a spending cap.
- EKS control-plane, EC2, storage, and load-balancing resources may incur charges. AWS deployment remains on hold pending a cost review.

## Cleanup

Do not run `terraform destroy` unless you have confirmed that the Terraform state contains only resources you intend to remove.

If AWS infrastructure is deployed later, use the correct Terraform workspace and configuration to review the proposed destruction first:

```bash
terraform -chdir=terraform plan -destroy
```

Review the output before approving any destruction. Remove the application infrastructure when it is no longer needed to avoid ongoing charges.

The S3 state bucket is separate from the infrastructure managed by the Terraform configuration. Delete it only after the infrastructure is safely removed and the state file is no longer needed.

## Testing and Evidence

Record screenshots or logs demonstrating:

- Successful frontend and backend builds.
- Docker image sizes and non-root runtime users.
- Kubernetes pod readiness and rollout status.
- Task creation and persistence after PostgreSQL pod replacement.
- Successful rolling update and rollback.
- Terraform formatting, validation, and plan output.
- AWS deployment results, if deployment is approved.

## Technology Stack

- **Frontend:** HTML, CSS, and JavaScript.
- **Backend:** Node.js/TypeScript, Express, and PostgreSQL.
- **Containers:** Docker.
- **Orchestration:** Kubernetes.
- **Infrastructure as Code:** Terraform.
- **Cloud platform:** AWS.
- **Local environment:** OrbStack.
- **Source control:** Git and GitHub.
- **Container registry:** Docker Hub.
