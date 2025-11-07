# Terraform Infrastructure

このディレクトリには、AI Avatar SystemのAWSインフラストラクチャをコード化したTerraform設定が含まれています。

## 構成されるリソース

- **S3バケット**: 静的ウェブサイトホスティング用
- **CloudFront**: CDN（コンテンツ配信ネットワーク）
- **IAM**: GitHub Actions用の認証情報

## ファイル構成

```
terraform/
├── main.tf              # プロバイダー設定
├── variables.tf         # 変数定義
├── s3.tf               # S3バケット設定
├── cloudfront.tf       # CloudFront設定
├── iam.tf              # IAM設定
├── outputs.tf          # 出力値定義
├── terraform.tfvars.example  # 変数の例
└── README.md           # このファイル
```

## クイックスタート

### 1. 初期設定

```bash
# terraform.tfvarsファイルを作成
cp terraform.tfvars.example terraform.tfvars

# terraform.tfvarsを編集（bucket_nameを一意の名前に変更）
vim terraform.tfvars
```

### 2. Terraform初期化

```bash
terraform init
```

### 3. 実行プランの確認

```bash
terraform plan
```

### 4. インフラの構築

```bash
terraform apply
```

### 5. 出力値の確認

```bash
# すべての出力を表示
terraform output

# 特定の値を表示
terraform output s3_bucket_name
terraform output cloudfront_url

# センシティブな値を表示
terraform output github_actions_secret_access_key
```

## 重要な出力値

デプロイ後、以下の値をGitHub Secretsに登録してください:

```bash
# GitHub Secretsに設定する値を取得
echo "AWS_ACCESS_KEY_ID=$(terraform output -raw github_actions_access_key_id)"
echo "AWS_SECRET_ACCESS_KEY=$(terraform output -raw github_actions_secret_access_key)"
echo "S3_BUCKET_NAME=$(terraform output -raw s3_bucket_name)"
echo "CLOUDFRONT_DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)"
```

## カスタマイズ

### CloudFrontを無効化する場合

`terraform.tfvars`:

```hcl
enable_cloudfront = false
```

### カスタムドメインを使用する場合

1. ACM証明書を発行（us-east-1リージョン）
2. `terraform.tfvars`に追加:

```hcl
domain_name = "avatar.example.com"
acm_certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/xxxxx"
```

## インフラの削除

```bash
# S3バケット内のファイルを削除
aws s3 rm s3://$(terraform output -raw s3_bucket_name) --recursive

# すべてのリソースを削除
terraform destroy
```

## トラブルシューティング

### S3バケット名の重複エラー

```
Error: Error creating S3 bucket: BucketAlreadyExists
```

**解決策**: `terraform.tfvars`の`bucket_name`を別の一意の名前に変更

### CloudFrontのデプロイが遅い

CloudFrontディストリビューションの作成には15〜30分かかることがあります。

### ステートファイルの管理

本番環境では、ステートファイルをリモートバックエンド（S3）に保存することを推奨:

1. ステート管理用のS3バケットを作成
2. `main.tf`のbackendブロックのコメントを解除
3. バケット名を設定

```hcl
backend "s3" {
  bucket = "ai-avatar-terraform-state"
  key    = "terraform.tfstate"
  region = "ap-northeast-1"
}
```

## セキュリティ

- `*.tfvars`ファイルは.gitignoreに含まれています
- AWS認証情報はコミットしないでください
- GitHub Secretsを使用してCI/CDで認証情報を管理してください

## 詳細なドキュメント

詳細な手順は [DEPLOYMENT.md](../DEPLOYMENT.md) を参照してください。
