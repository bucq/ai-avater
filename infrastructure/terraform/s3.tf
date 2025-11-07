# S3バケット（静的ウェブサイトホスティング用）
resource "aws_s3_bucket" "web_hosting" {
  bucket = var.bucket_name

  tags = merge(
    var.tags,
    {
      Name        = "${var.project_name}-web-hosting"
      Environment = var.environment
    }
  )
}

# S3バケットのパブリックアクセス設定
resource "aws_s3_bucket_public_access_block" "web_hosting" {
  bucket = aws_s3_bucket.web_hosting.id

  # CloudFront使用時はパブリックアクセスをブロック
  block_public_acls       = var.enable_cloudfront
  block_public_policy     = var.enable_cloudfront
  ignore_public_acls      = var.enable_cloudfront
  restrict_public_buckets = var.enable_cloudfront
}

# S3バケットの静的ウェブサイトホスティング設定
resource "aws_s3_bucket_website_configuration" "web_hosting" {
  bucket = aws_s3_bucket.web_hosting.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html" # SPAのため、すべてのエラーをindex.htmlにリダイレクト
  }
}

# S3バケットのバージョニング設定（オプション）
resource "aws_s3_bucket_versioning" "web_hosting" {
  bucket = aws_s3_bucket.web_hosting.id

  versioning_configuration {
    status = "Enabled"
  }
}

# S3バケットポリシー（CloudFront未使用時のみ）
resource "aws_s3_bucket_policy" "web_hosting" {
  count  = var.enable_cloudfront ? 0 : 1
  bucket = aws_s3_bucket.web_hosting.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.web_hosting.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.web_hosting]
}

# S3バケットポリシー（CloudFront使用時）
resource "aws_s3_bucket_policy" "web_hosting_cloudfront" {
  count  = var.enable_cloudfront ? 1 : 0
  bucket = aws_s3_bucket.web_hosting.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.web_hosting.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.web_distribution[0].arn
          }
        }
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.web_hosting]
}

# CORS設定（必要に応じて）
resource "aws_s3_bucket_cors_configuration" "web_hosting" {
  bucket = aws_s3_bucket.web_hosting.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = []
    max_age_seconds = 3000
  }
}
