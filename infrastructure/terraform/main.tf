terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Terraformステート管理用S3バケット（別途作成が必要）
  # backend "s3" {
  #   bucket = "ai-avatar-terraform-state"
  #   key    = "terraform.tfstate"
  #   region = "ap-northeast-1"
  # }
}

provider "aws" {
  region = var.aws_region
}

# CloudFront用のプロバイダー（us-east-1リージョンが必要）
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
