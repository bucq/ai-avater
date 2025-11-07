# GitHub Actions用のIAMユーザー
resource "aws_iam_user" "github_actions" {
  name = "${var.project_name}-github-actions"

  tags = merge(
    var.tags,
    {
      Name        = "${var.project_name}-github-actions"
      Environment = var.environment
      Purpose     = "CI/CD deployment"
    }
  )
}

# GitHub Actions用のアクセスキー
resource "aws_iam_access_key" "github_actions" {
  user = aws_iam_user.github_actions.name
}

# S3へのアクセス権限ポリシー
resource "aws_iam_user_policy" "github_actions_s3" {
  name = "${var.project_name}-github-actions-s3-policy"
  user = aws_iam_user.github_actions.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.web_hosting.arn,
          "${aws_s3_bucket.web_hosting.arn}/*"
        ]
      }
    ]
  })
}

# CloudFrontのキャッシュ無効化権限（CloudFront使用時のみ）
resource "aws_iam_user_policy" "github_actions_cloudfront" {
  count = var.enable_cloudfront ? 1 : 0

  name = "${var.project_name}-github-actions-cloudfront-policy"
  user = aws_iam_user.github_actions.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation",
          "cloudfront:GetInvalidation",
          "cloudfront:ListInvalidations"
        ]
        Resource = aws_cloudfront_distribution.web_distribution[0].arn
      }
    ]
  })
}
