# CloudFront Origin Access Control
resource "aws_cloudfront_origin_access_control" "web_distribution" {
  count = var.enable_cloudfront ? 1 : 0

  name                              = "${var.project_name}-oac"
  description                       = "Origin Access Control for ${var.project_name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "web_distribution" {
  count = var.enable_cloudfront ? 1 : 0

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  comment             = "${var.project_name} - ${var.environment}"
  price_class         = "PriceClass_200" # 日本・アジア・北米・ヨーロッパ

  # カスタムドメイン設定（オプション）
  aliases = var.domain_name != "" ? [var.domain_name] : []

  # S3オリジン
  origin {
    domain_name              = aws_s3_bucket.web_hosting.bucket_regional_domain_name
    origin_id                = "S3-${var.bucket_name}"
    origin_access_control_id = aws_cloudfront_origin_access_control.web_distribution[0].id
  }

  # デフォルトキャッシュ動作
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${var.bucket_name}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600    # 1時間
    max_ttl                = 86400   # 24時間
    compress               = true
  }

  # アセットファイル用のキャッシュ動作（長期キャッシュ）
  ordered_cache_behavior {
    path_pattern     = "/assets/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${var.bucket_name}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 31536000  # 1年
    default_ttl            = 31536000  # 1年
    max_ttl                = 31536000  # 1年
    compress               = true
  }

  # 地理的制限（オプション）
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # SSL証明書設定
  viewer_certificate {
    # カスタムドメイン使用時
    acm_certificate_arn      = var.domain_name != "" ? var.acm_certificate_arn : null
    ssl_support_method       = var.domain_name != "" ? "sni-only" : null
    minimum_protocol_version = var.domain_name != "" ? "TLSv1.2_2021" : null

    # デフォルトドメイン使用時
    cloudfront_default_certificate = var.domain_name == "" ? true : false
  }

  # カスタムエラーレスポンス（SPA対応）
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  tags = merge(
    var.tags,
    {
      Name        = "${var.project_name}-cloudfront"
      Environment = var.environment
    }
  )
}
