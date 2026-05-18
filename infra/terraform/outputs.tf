output "project_id" {
  description = "Google Cloud project ID."
  value       = var.project_id
}

output "region" {
  description = "Google Cloud region."
  value       = var.region
}

output "cluster_name" {
  description = "GKE cluster name."
  value       = google_container_cluster.primary.name
}

output "cluster_location" {
  description = "GKE cluster location."
  value       = google_container_cluster.primary.location
}

output "network_name" {
  description = "VPC network name."
  value       = google_compute_network.vpc.name
}

output "subnetwork_name" {
  description = "Subnetwork name."
  value       = google_compute_subnetwork.gke.name
}

output "kubectl_get_credentials_command" {
  description = "Command to fetch kubectl credentials for the created cluster."
  value       = "gcloud container clusters get-credentials ${google_container_cluster.primary.name} --location ${google_container_cluster.primary.location} --project ${var.project_id}"
}
