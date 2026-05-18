variable "project_id" {
  description = "Google Cloud project ID."
  type        = string
}

variable "region" {
  description = "Google Cloud region for regional resources."
  type        = string
  default     = "asia-south1"
}

variable "cluster_location" {
  description = "GKE cluster location. Use a region for a regional cluster or a zone for a zonal cluster."
  type        = string
  default     = "asia-south1"
}

variable "cluster_name" {
  description = "Name of the GKE cluster."
  type        = string
  default     = "weconnect-gke"
}

variable "network_name" {
  description = "Name of the VPC network."
  type        = string
  default     = "weconnect-vpc"
}

variable "subnet_name" {
  description = "Name of the GKE subnet."
  type        = string
  default     = "weconnect-subnet"
}

variable "subnet_cidr" {
  description = "Primary CIDR range for the GKE subnet."
  type        = string
  default     = "10.10.0.0/20"
}

variable "pods_cidr_name" {
  description = "Secondary range name for pods."
  type        = string
  default     = "weconnect-pods"
}

variable "pods_cidr" {
  description = "Secondary CIDR range for pods."
  type        = string
  default     = "10.20.0.0/16"
}

variable "services_cidr_name" {
  description = "Secondary range name for services."
  type        = string
  default     = "weconnect-services"
}

variable "services_cidr" {
  description = "Secondary CIDR range for services."
  type        = string
  default     = "10.30.0.0/20"
}

variable "node_pool_name" {
  description = "Name of the primary node pool."
  type        = string
  default     = "weconnect-node-pool"
}

variable "machine_type" {
  description = "Machine type for GKE worker nodes."
  type        = string
  default     = "e2-medium"
}

variable "disk_size_gb" {
  description = "Boot disk size for GKE nodes."
  type        = number
  default     = 50
}

variable "node_service_account" {
  description = "Optional custom service account email for node pool VMs. Leave null to use the default compute service account."
  type        = string
  default     = null
}

variable "min_node_count" {
  description = "Minimum number of nodes in the autoscaling node pool."
  type        = number
  default     = 1
}

variable "max_node_count" {
  description = "Maximum number of nodes in the autoscaling node pool."
  type        = number
  default     = 3
}

variable "initial_node_count" {
  description = "Initial node count for the node pool."
  type        = number
  default     = 1
}

variable "release_channel" {
  description = "GKE release channel."
  type        = string
  default     = "REGULAR"

  validation {
    condition     = contains(["RAPID", "REGULAR", "STABLE", "UNSPECIFIED"], var.release_channel)
    error_message = "release_channel must be one of RAPID, REGULAR, STABLE, or UNSPECIFIED."
  }
}
