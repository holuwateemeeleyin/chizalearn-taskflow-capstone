# TaskFlow: AWS DevOps Capstone

TaskFlow is a simple task management application used to demonstrate Docker, Kubernetes, and Terraform. It runs locally on OrbStack and has been deployed to Amazon EKS.

## Architecture

```text
Developer
   |
 GitHub
   |
 Terraform
   |
 AWS (eu-west-1)
   |
 VPC and EKS
   |
 Kubernetes
   |-------- Frontend (LoadBalancer)
   |-------- Backend (internal Service)
   |-------- PostgreSQL (persistent storage)
```

The frontend is publicly accessible through an AWS LoadBalancer. The backend communicates internally with PostgreSQL, which uses persistent EBS storage.

## Technology stack

- Frontend: HTML, CSS and JavaScript
- Backend: Node.js, TypeScript and Express
- Database: PostgreSQL
- Containers: Docker
- Orchestration: Kubernetes
- Infrastructure: Terraform and AWS
- Registry: Docker Hub
- Local development: OrbStack

## Docker images

Both images are published on Docker Hub and are below the required 150 MB limit.

| Component | Image | Version | Approx. size |
|---|---|---|---|
| Frontend | `timiajiboye/taskflow-frontend` | `0.1.1` | 60.7 MB |
| Backend | `timiajiboye/taskflow-backend` | `0.1.9` | 98.3 MB |

Both images use non-root runtime users.

## Run locally

Start your local Kubernetes cluster and run these commands from the project root:

```bash
kubectl apply -k k8s/base
kubectl get pods
kubectl get services
```

Access the frontend:

```bash
kubectl port-forward service/taskflow-frontend 8080:8080
```

Open `http://localhost:8080` in your browser. Keep the port-forward command running while using the application.

The local deployment includes two frontend replicas, two backend replicas, and PostgreSQL with persistent storage.

## Deploy to AWS

The AWS-specific Kubernetes configuration is in `k8s/overlays/aws/`.

Configure access to the EKS cluster:

```bash
aws eks update-kubeconfig --region eu-west-1 --name taskflow-dev
```

Ensure the required database Secret exists, then apply the deployment:

```bash
kubectl apply -k k8s/overlays/aws
```

Check the deployment:

```bash
kubectl get deployments
kubectl get pods
kubectl get services
kubectl get pvc
kubectl rollout status deployment/taskflow-backend
kubectl rollout status deployment/taskflow-frontend
```

The frontend Service receives a public AWS LoadBalancer address. Retrieve it with:

```bash
kubectl get service taskflow-frontend
```

## Terraform

Terraform configuration is in `terraform/`.

- `modules/network/`: VPC, subnets, Internet Gateway and routing.
- `modules/cluster/`: EKS, IAM roles, managed worker nodes and EBS CSI driver.
- `backend.tf`: S3 remote state and state locking.
- `variables.tf` and `outputs.tf`: input variables and outputs.

The S3 state bucket has public access blocked, encryption and versioning enabled. Terraform state and credentials must not be committed to Git.

Validate the configuration and review infrastructure changes from the project root:

```bash
terraform -chdir=terraform fmt -recursive
terraform -chdir=terraform validate
terraform -chdir=terraform plan
```

The latest plan reported no infrastructure changes.

## Security and cost

- Keep `.env` files, database credentials and Kubernetes Secrets out of Git.
- The EKS API endpoint is restricted to an allowed public IP address. Update the allowlist if your public IP changes.
- Worker nodes use public subnets to avoid NAT Gateway charges. Their security configuration must restrict unnecessary access.
- The AWS budget is an alert, not a spending limit.
- EKS, EC2, EBS and LoadBalancer resources can incur ongoing charges.

## Testing and evidence

Testing has covered:

- Docker image sizes and non-root runtime users.
- Kubernetes readiness and liveness probes, resource limits and rolling updates.
- PostgreSQL persistent storage.
- Rolling update and rollback.
- AWS application access and backend startup.
- Terraform formatting, validation and planning.

Screenshots and command logs are stored in `docs/screenshots/` and `docs/logs/`. Only include evidence that has actually been captured, and ensure it contains no secrets.

## Cleanup

Review the proposed infrastructure removal before destroying anything:

```bash
terraform -chdir=terraform plan -destroy
```

Do not run `terraform destroy` until you have checked the plan and confirmed that the resources can be removed. Keep the S3 state bucket until the infrastructure has been safely removed and the state is no longer needed.