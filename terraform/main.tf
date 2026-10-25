terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  common_tags = {
    Project     = "TaskFlow"
    Environment = "dev"
    ManagedBy   = "Terraform"
  }
}

module "network" {
  source = "./modules/network"

  name               = "taskflow-dev"
  vpc_cidr           = "10.20.0.0/16"
  availability_zones = slice(data.aws_availability_zones.available.names, 0, 2)

  tags = local.common_tags
}


module "cluster" {
  source = "./modules/cluster"

  name               = "taskflow-dev"
  kubernetes_version = "1.36"
  vpc_id             = module.network.vpc_id
  private_subnet_ids = module.network.private_subnet_ids
  public_subnet_ids  = module.network.public_subnet_ids

  tags = local.common_tags
}