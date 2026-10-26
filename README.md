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
The diagram represents the AWS environment provisioned using Terraform. The application runs on Amazon EKS in the `eu-west-1` region. The frontend is exposed through a public AWS LoadBalancer, while the backend uses an internal Kubernetes Service. PostgreSQL uses persistent EBS storage through a PersistentVolumeClaim. The worker nodes run in public subnets to avoid NAT Gateway charges, with security controls applied to restrict access.

## Project Status

- [x] Initialise Git repository and publish the project to GitHub.
- [x] Build and publish the frontend and backend Docker images.
- [x] Keep both application images below 150 MB.
- [x] Deploy and test locally on Kubernetes using OrbStack.
- [x] Configure health probes, resource requests, limits, and rolling updates.
- [x] Test PostgreSQL persistence after pod replacement.
- [x] Configure Terraform networking, EKS, IAM roles, and the EBS CSI driver.
- [x] Configure remote Terraform state in S3 with encryption, versioning, and native state locking.
- [x] Deploy TaskFlow to AWS EKS and verify application access.
- [x] Configure AWS-specific Kubernetes resources and versioned image references.
- [x] Validate Terraform formatting and configuration.
- [x] Confirm that Terraform reports no infrastructure changes.
- [ ] Complete final submission evidence and documentation review.
- [ ] Review AWS costs and clean up infrastructure when approved.

## Docker Images

The application images are published to Docker Hub.

| Component | Image | Version | Approximate size |
|---|---|---|---|
| Frontend | `timiajiboye/taskflow-frontend` | `0.1.1` | 60.7 MB |
| Backend | `timiajiboye/taskflow-backend` | `0.1.7` | Under 150 MB |

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

## AWS Kubernetes Deployment

The AWS deployment uses the Kustomize overlay at `k8s/overlays/aws/`. This overlay reuses the base Kubernetes manifests and applies AWS-specific settings:

- Uses the `gp2` StorageClass for PostgreSQL persistent storage.
- Exposes the frontend through a public AWS LoadBalancer.
- Uses versioned Docker Hub images for the frontend and backend.
- Keeps the backend Service internal to the cluster.

### Deploy the application

Configure `kubectl` to use the `taskflow-dev` EKS cluster in `eu-west-1`:

```bash
aws eks update-kubeconfig --region eu-west-1 --name taskflow-dev
```

Ensure the Kubernetes Secret named `taskflow-db` exists in the target namespace before deploying. Do not commit database credentials or Secret manifests containing real credentials.

Apply the AWS overlay:

```bash
kubectl apply -k k8s/overlays/aws
```

Check deployment and pod status:

```bash
kubectl get deployments
kubectl get pods
kubectl get services
kubectl get pvc
kubectl rollout status deployment/taskflow-backend
kubectl rollout status deployment/taskflow-frontend
```

The frontend Service uses type `LoadBalancer`. Retrieve its assigned endpoint with:

```bash
kubectl get service taskflow-frontend
```

Open the assigned external address in a browser, using port `8080` if the address does not include a port.

The deployment depends on AWS permissions, a working EKS connection, available storage, and the database Secret being configured correctly. Review the live resource status if a deployment does not become ready.

## Terraform Infrastructure

Terraform configuration is located in the `terraform/` directory.

- `main.tf`: AWS provider, common tags, and module configuration.
- `variables.tf`: root input variables.
- `outputs.tf`: network outputs.
- `backend.tf`: S3 remote state backend and native S3 state locking.
- `modules/network/`: VPC, public and private subnets, Internet Gateway, and public routing.
- `modules/cluster/`: EKS cluster, cluster and worker-node IAM roles, managed node group, IAM OIDC provider, and the EBS CSI driver add-on with its IAM permissions.

The S3 state bucket is configured with public access blocked, server-side encryption, and versioning. Terraform state can contain sensitive infrastructure information and must not be committed to Git.

### Validate and preview changes

Run these commands from the project root:

```bash
terraform -chdir=terraform fmt -recursive
terraform -chdir=terraform validate
terraform -chdir=terraform plan
```

`terraform plan` previews the proposed changes; it does not deploy infrastructure.

**Deployment status:** The AWS infrastructure has been deployed and the application is running on EKS. The latest Terraform plan reports no changes. The worker nodes use public subnets to avoid NAT Gateway charges, and the EKS API endpoint is restricted to an allowed public IP address. Review the configuration and AWS costs before making further infrastructure changes.

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

The project was tested locally on Kubernetes and deployed to Amazon EKS.

The following checks have been completed:

- Frontend and backend container images were built and published to Docker Hub.
- Both application images meet the 150 MB size requirement and use non-root runtime users.
- Kubernetes deployments use readiness and liveness probes, resource requests and limits, and rolling update settings.
- PostgreSQL uses persistent storage through a PersistentVolumeClaim.
- The application was accessed through the AWS frontend LoadBalancer.
- The backend health endpoint was checked from within the Kubernetes cluster.
- Terraform formatting and validation completed successfully.
- The latest Terraform plan reported no infrastructure changes.
- The AWS Kustomize overlay rendered successfully.

### Evidence to include with the submission

Save genuine screenshots or command output in `docs/screenshots/` and `docs/logs/` as appropriate. Include evidence for:

- Docker image sizes and non-root runtime configuration.
- Kubernetes deployments, pod readiness, and rollout status.
- PostgreSQL PVC status and persistence testing.
- A successful rolling update and rollback.
- Terraform formatting, validation, and the no-changes plan.
- The application running through its AWS LoadBalancer.
- The GitHub repository and final project structure.

Only mark an evidence item complete once its screenshot or log has actually been saved. Do not include credentials, `.env` contents, or other secrets in screenshots or logs.

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
