
variable "name" {
  description = "Name prefix for cluster resources"
  type        = string
}

variable "kubernetes_version" {
  description = "Kubernetes version for the EKS cluster"
  type        = string
  default     = "1.36"
}

variable "vpc_id" {
  description = "ID of the VPC for the cluster"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for the cluster"
  type        = list(string)
}

variable "tags" {
  description = "Tags applied to cluster resources"
  type        = map(string)
  default     = {}
}

variable "node_instance_type" {
  description = "EC2 instance type for EKS worker nodes"
  type        = string
  default     = "t3.small"
}

variable "node_desired_size" {
  description = "Desired number of worker nodes"
  type        = number
  default     = 2
}

variable "node_min_size" {
  description = "Minimum number of worker nodes"
  type        = number
  default     = 2
}

variable "node_max_size" {
  description = "Maximum number of worker nodes"
  type        = number
  default     = 2
}

variable "public_subnet_ids" {
  description = "Public subnet IDs for the worker nodes"
  type        = list(string)
}

variable "cluster_public_access_cidrs" {
  description = "Trusted public IP ranges allowed to access the EKS API"
  type        = list(string)
  default     = ["102.88.167.232/32"]
}