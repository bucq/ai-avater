# AWS リージョン
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

# プロジェクト名
variable "project_name" {
  description = "Project name"
  type        = string
  default     = "ai-avatar"
}

# 環境名（dev, staging, production）
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

# S3バケット名
variable "bucket_name" {
  description = "S3 bucket name for hosting"
  type        = string
  default     = "ai-avatar-app"
}

# CloudFrontを使用するかどうか
variable "enable_cloudfront" {
  description = "Enable CloudFront distribution"
  type        = bool
  default     = true
}

# カスタムドメイン（オプション）
variable "domain_name" {
  description = "Custom domain name (optional)"
  type        = string
  default     = ""
}

# ACM証明書ARN（カスタムドメイン使用時のみ）
variable "acm_certificate_arn" {
  description = "ACM certificate ARN for custom domain"
  type        = string
  default     = ""
}

# タグ
variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "AI Avatar System"
    ManagedBy   = "Terraform"
  }
}
