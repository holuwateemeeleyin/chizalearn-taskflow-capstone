
terraform {
  backend "s3" {
    bucket       = "taskflow-terraform-state-575751781774-eu-west-1"
    key          = "dev/terraform.tfstate"
    region       = "eu-west-1"
    encrypt      = true
    use_lockfile = true
  }
}
