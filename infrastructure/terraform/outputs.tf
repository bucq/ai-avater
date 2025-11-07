# S3バケット情報
output "s3_bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.web_hosting.id
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.web_hosting.arn
}

output "s3_website_endpoint" {
  description = "S3 website endpoint"
  value       = aws_s3_bucket_website_configuration.web_hosting.website_endpoint
}

# CloudFront情報
output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = var.enable_cloudfront ? aws_cloudfront_distribution.web_distribution[0].id : null
}

output "cloudfront_domain_name" {
  description = "CloudFront domain name"
  value       = var.enable_cloudfront ? aws_cloudfront_distribution.web_distribution[0].domain_name : null
}

output "cloudfront_url" {
  description = "CloudFront URL"
  value       = var.enable_cloudfront ? "https://${aws_cloudfront_distribution.web_distribution[0].domain_name}" : null
}

# GitHub Actions用の認証情報
output "github_actions_access_key_id" {
  description = "GitHub Actions IAM user access key ID"
  value       = aws_iam_access_key.github_actions.id
  sensitive   = false
}

output "github_actions_secret_access_key" {
  description = "GitHub Actions IAM user secret access key"
  value       = aws_iam_access_key.github_actions.secret
  sensitive   = true
}

# デプロイメント用の情報
output "deployment_info" {
  description = "Deployment information"
  value = {
    bucket_name        = aws_s3_bucket.web_hosting.id
    region             = var.aws_region
    distribution_id    = var.enable_cloudfront ? aws_cloudfront_distribution.web_distribution[0].id : null
    website_url        = var.enable_cloudfront ? "https://${aws_cloudfront_distribution.web_distribution[0].domain_name}" : "http://${aws_s3_bucket_website_configuration.web_hosting.website_endpoint}"
  }
}
