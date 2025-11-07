# デプロイメント手順書

このドキュメントでは、AI Avatar SystemをAWS S3 + CloudFrontにデプロイする完全な手順を説明します。

## 前提条件

- AWS アカウント
- AWS CLI がインストールされている
- Terraform がインストールされている（v1.0以上）
- GitHubアカウント
- Node.js 20以上

## 目次

1. [初回セットアップ](#初回セットアップ)
2. [Terraformでインフラ構築](#terraformでインフラ構築)
3. [GitHub Secretsの設定](#github-secretsの設定)
4. [デプロイメント](#デプロイメント)
5. [トラブルシューティング](#トラブルシューティング)

---

## 初回セットアップ

### 1. AWS CLIの設定

```bash
# AWS CLIの認証情報を設定
aws configure

# 入力項目:
# AWS Access Key ID: <your-access-key>
# AWS Secret Access Key: <your-secret-key>
# Default region name: ap-northeast-1
# Default output format: json
```

### 2. Terraformの初期化

```bash
cd terraform

# terraform.tfvarsファイルを作成
cp terraform.tfvars.example terraform.tfvars

# terraform.tfvarsを編集（重要）
# - bucket_name を一意の名前に変更
# - 必要に応じて他の設定を調整
```

**terraform.tfvars 編集例:**

```hcl
aws_region        = "ap-northeast-1"
project_name      = "ai-avatar"
environment       = "production"
bucket_name       = "ai-avatar-app-20250107"  # ← 一意の名前に変更
enable_cloudfront = true

tags = {
  Project     = "AI Avatar System"
  ManagedBy   = "Terraform"
  Environment = "production"
}
```

---

## Terraformでインフラ構築

### 1. Terraform初期化

```bash
cd terraform

# プロバイダーのダウンロードと初期化
terraform init
```

### 2. 実行プランの確認

```bash
# 作成されるリソースを確認
terraform plan

# 出力例:
# + aws_s3_bucket.web_hosting
# + aws_cloudfront_distribution.web_distribution
# + aws_iam_user.github_actions
# など
```

### 3. インフラのデプロイ

```bash
# リソースを作成
terraform apply

# "yes" と入力して実行
```

**⚠️ 重要: 実行後の出力を保存**

```bash
# 出力を確認して保存
terraform output

# 以下の情報をメモ:
# - github_actions_access_key_id
# - github_actions_secret_access_key (sensitive)
# - cloudfront_distribution_id
# - s3_bucket_name
```

**シークレットアクセスキーの取得:**

```bash
# センシティブな値を表示
terraform output github_actions_secret_access_key
```

---

## GitHub Secretsの設定

### 1. GitHubリポジトリの設定画面を開く

1. GitHubリポジトリページにアクセス
2. `Settings` → `Secrets and variables` → `Actions` を開く
3. `New repository secret` をクリック

### 2. 以下のSecretsを登録

| Secret名 | 値 | 説明 |
|---------|-----|------|
| `AWS_ACCESS_KEY_ID` | Terraformの出力値 | GitHub Actions用のAWSアクセスキーID |
| `AWS_SECRET_ACCESS_KEY` | Terraformの出力値 | GitHub Actions用のAWSシークレットキー |
| `S3_BUCKET_NAME` | Terraformの出力値 | S3バケット名 |
| `CLOUDFRONT_DISTRIBUTION_ID` | Terraformの出力値 | CloudFrontディストリビューションID |

**設定例:**

```
Name: AWS_ACCESS_KEY_ID
Secret: AKIAIOSFODNN7EXAMPLE
```

---

## デプロイメント

### 自動デプロイ（推奨）

`main` ブランチにプッシュすると自動的にデプロイされます。

```bash
# コードの変更をコミット
git add .
git commit -m "Update avatar system"

# mainブランチにプッシュ
git push origin main
```

GitHub Actionsが自動的に:
1. プロジェクトをビルド
2. S3にファイルをアップロード
3. CloudFrontのキャッシュを無効化

### 手動デプロイ

GitHub Actionsの画面から手動実行も可能です:

1. GitHubリポジトリの `Actions` タブを開く
2. `Deploy to AWS S3` ワークフローを選択
3. `Run workflow` → `Run workflow` をクリック

### ローカルからの手動デプロイ

```bash
# プロジェクトをビルド
npm run build

# S3に同期
aws s3 sync dist/ s3://your-bucket-name \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html"

# index.htmlを別途アップロード
aws s3 cp dist/index.html s3://your-bucket-name/index.html \
  --cache-control "no-cache, no-store, must-revalidate"

# CloudFrontキャッシュを無効化
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

---

## デプロイ後の確認

### 1. S3バケットの確認

```bash
# バケット内のファイルを確認
aws s3 ls s3://your-bucket-name --recursive
```

### 2. CloudFront URLにアクセス

```bash
# CloudFront URLを取得
terraform output cloudfront_url
```

ブラウザで出力されたURLにアクセスしてアプリケーションが動作することを確認。

### 3. GitHub Actionsのログを確認

GitHub リポジトリの `Actions` タブでデプロイログを確認できます。

---

## カスタムドメインの設定（オプション）

### 1. ACM証明書の発行（us-east-1リージョン）

```bash
# us-east-1リージョンに切り替え
export AWS_DEFAULT_REGION=us-east-1

# 証明書のリクエスト
aws acm request-certificate \
  --domain-name avatar.example.com \
  --validation-method DNS \
  --subject-alternative-names "*.avatar.example.com"

# 証明書ARNをメモ
```

### 2. DNS検証の完了

Route 53またはドメイン管理サービスでCNAMEレコードを追加。

### 3. terraform.tfvarsを更新

```hcl
domain_name = "avatar.example.com"
acm_certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/xxxxx"
```

### 4. Terraformを再適用

```bash
terraform apply
```

### 5. Route 53でAliasレコードを作成

```bash
# CloudFrontのドメイン名を取得
terraform output cloudfront_domain_name

# Route 53でAレコード（Alias）を作成し、CloudFrontを指定
```

---

## インフラの削除

**⚠️ 注意: すべてのリソースが削除されます**

```bash
cd terraform

# S3バケット内のファイルを削除
aws s3 rm s3://your-bucket-name --recursive

# Terraformリソースを削除
terraform destroy

# "yes" と入力して実行
```

---

## トラブルシューティング

### S3へのアップロードが失敗する

**エラー:** `Access Denied`

**解決策:**
1. IAMユーザーのポリシーを確認
2. S3バケットポリシーを確認
3. GitHub Secretsが正しく設定されているか確認

```bash
# IAMユーザーのポリシーを確認
aws iam list-user-policies --user-name ai-avatar-github-actions
```

### CloudFrontのキャッシュが更新されない

**解決策:**

```bash
# 手動でキャッシュを無効化
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### ビルドが失敗する

**解決策:**

```bash
# ローカルでビルドテスト
npm ci
npm run build

# エラーログを確認
npm run build 2>&1 | tee build.log
```

### VRMファイルが読み込めない

**解決策:**
1. S3にファイルが正しくアップロードされているか確認
2. CORS設定を確認
3. ファイルのパスが正しいか確認（`/assets/models/avatar.vrm`）

```bash
# ファイルの存在確認
aws s3 ls s3://your-bucket-name/assets/models/
```

---

## セキュリティのベストプラクティス

### 1. IAMアクセスキーのローテーション

定期的にアクセスキーを更新:

```bash
# 新しいアクセスキーを作成
aws iam create-access-key --user-name ai-avatar-github-actions

# 古いキーを無効化
aws iam update-access-key \
  --access-key-id OLD_KEY_ID \
  --status Inactive \
  --user-name ai-avatar-github-actions

# GitHub Secretsを更新

# 古いキーを削除
aws iam delete-access-key \
  --access-key-id OLD_KEY_ID \
  --user-name ai-avatar-github-actions
```

### 2. CloudFront WAFの有効化（オプション）

DDos攻撃や不正アクセスから保護。

### 3. S3バケットのログ記録

アクセスログを別のバケットに保存して監査。

---

## コスト見積もり

### 月間コスト概算（東京リージョン、月間10万PV想定）

- **S3ストレージ**: 約$0.50（100MB想定）
- **S3リクエスト**: 約$0.40
- **CloudFront**: 約$1.00（10GB転送想定）
- **合計**: 約$2.00〜$3.00/月

**注意:** VRMファイルのサイズや転送量により変動します。

---

## サポート

問題が発生した場合:

1. GitHub Issuesで報告
2. Terraformのログを確認: `terraform apply -debug`
3. AWS CloudWatchログを確認

---

## 参考リンク

- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
