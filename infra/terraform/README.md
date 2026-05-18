# Terraform GKE Setup

This Terraform configuration creates the Google Cloud infrastructure needed for a GKE-based WeConnect deployment:

- Required Google Cloud APIs
- A custom VPC
- A subnet with secondary IP ranges for GKE pods and services
- A GKE cluster with Workload Identity enabled
- A managed node pool with autoscaling

## Files

- `versions.tf`: Terraform and provider configuration
- `variables.tf`: Input variables
- `main.tf`: Network, cluster, and node pool resources
- `outputs.tf`: Useful outputs after apply
- `terraform.tfvars.example`: Example input values

## Usage

1. Copy the example variables file:

```bash
cp terraform.tfvars.example terraform.tfvars
```

2. Update `terraform.tfvars` with your real GCP project values.

3. Authenticate with Google Cloud:

```bash
gcloud auth application-default login
```

4. Initialize Terraform:

```bash
terraform init
```

5. Preview the plan:

```bash
terraform plan
```

6. Create the infrastructure:

```bash
terraform apply
```

7. Fetch cluster credentials:

```bash
gcloud container clusters get-credentials <cluster-name> --location <cluster-location> --project <project-id>
```

After the cluster exists, you can:

- Apply the Kubernetes app manifests from `k8s/`
- Install monitoring from `helm/monitoring/`
- Install the app observability chart from `helm/weconnect-observability/`
