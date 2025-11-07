# Infrastructure - AWS SAM

AI Avatar System のインフラストラクチャ定義 (AWS SAM)

## 構成

```
infrastructure/
├── template.yaml           # SAM テンプレート (CloudFormation)
├── samconfig.toml         # SAM CLI 設定
├── env.json               # ローカル開発用の環境変数 (gitignore)
├── scripts/
│   ├── deploy.sh          # デプロイスクリプト
│   ├── deploy-frontend.sh # フロントエンドデプロイ
│   └── local-invoke.sh    # ローカルテスト
└── README.md              # このファイル
```

## リソース

### フロントエンド
- **S3 Bucket**: 静的ファイルホスティング
- **CloudFront**: CDN配信

### バックエンド
- **API Gateway**: REST APIエンドポイント
- **Lambda**: FastAPI + Mangum バックエンド

## 前提条件

### 必要なツール

```bash
# AWS CLI
aws --version
# aws-cli/2.x.x 以上

# SAM CLI
sam --version
# SAM CLI, version 1.100.0 以上

# Python
python --version
# Python 3.12 以上
```

### AWS認証情報設定

```bash
# AWS認証情報を設定
aws configure

# または環境変数で設定
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_DEFAULT_REGION=ap-northeast-1
```

## デプロイ

### 初回デプロイ

```bash
cd infrastructure

# ガイド付きデプロイ
sam build
sam deploy --guided

# 対話形式で以下を入力:
#   Stack Name: ai-avatar-dev
#   AWS Region: ap-northeast-1
#   Parameter Environment: dev
#   Parameter OpenAIApiKey: sk-...
#   Confirm changes before deploy: Y
#   Allow SAM CLI IAM role creation: Y
#   Save arguments to configuration file: Y
```

初回デプロイ後、設定は `samconfig.toml` に保存されます。

### 2回目以降のデプロイ

```bash
# シンプルなデプロイ
./scripts/deploy.sh

# または本番環境
./scripts/deploy.sh prod
```

### フロントエンドデプロイ

バックエンドデプロイ後、フロントエンドをデプロイ:

```bash
# 1. フロントエンドをビルド
cd ../frontend
npm run build

# 2. S3にデプロイ
cd ../infrastructure
./scripts/deploy-frontend.sh

# 本番環境の場合
./scripts/deploy-frontend.sh prod
```

## ローカルテスト

### オプション1: FastAPI 直接起動 (推奨)

開発時は SAM CLI を使わず、FastAPI を直接起動する方が高速です:

```bash
cd ../backend
python local_server.py
# → http://localhost:8000
# → http://localhost:8000/docs (Swagger UI)
```

### オプション2: SAM Local (Lambda環境テスト)

Lambda 環境に近い状態でテストしたい場合:

```bash
# ローカルAPIサーバー起動
./scripts/local-invoke.sh api
# → http://localhost:3000

# 特定の関数を実行
./scripts/local-invoke.sh function
```

### 環境変数設定 (SAM Local用)

`env.json` ファイルを作成 (初回のみ):

```json
{
  "BackendFunction": {
    "OPENAI_API_KEY": "sk-your-key-here",
    "OPENAI_MODEL": "gpt-4",
    "GOOGLE_CREDENTIALS_JSON": "",
    "ENVIRONMENT": "local"
  }
}
```

**重要**: `env.json` は `.gitignore` に含まれています。API キーを含むため Git にコミットしないでください。

## デプロイ後の設定

### 1. 出力値の確認

```bash
# スタック出力を表示
aws cloudformation describe-stacks \
  --stack-name ai-avatar-dev \
  --query 'Stacks[0].Outputs' \
  --output table
```

### 2. フロントエンド環境変数更新

デプロイ後に表示される API URL を使って、フロントエンドの環境変数を更新:

```bash
# frontend/.env.production
VITE_API_URL=https://YOUR_API_GATEWAY_ID.execute-api.ap-northeast-1.amazonaws.com/dev
```

## モニタリング

### CloudWatch Logs

```bash
# Lambda ログをリアルタイム表示
aws logs tail /aws/lambda/ai-avatar-backend-dev --follow

# エラーログのみ表示
aws logs filter-pattern \
  --log-group-name /aws/lambda/ai-avatar-backend-dev \
  --filter-pattern "ERROR"
```

### CloudWatch Metrics

AWS コンソールで以下を監視:
- Lambda 実行時間
- Lambda エラー率
- API Gateway リクエスト数
- CloudFront キャッシュヒット率

## トラブルシューティング

### ビルドエラー

```bash
# キャッシュをクリアして再ビルド
sam build --use-container --parallel
```

### デプロイエラー

```bash
# スタックの状態を確認
aws cloudformation describe-stacks \
  --stack-name ai-avatar-dev \
  --query 'Stacks[0].StackStatus'

# スタックイベントを確認
aws cloudformation describe-stack-events \
  --stack-name ai-avatar-dev \
  --max-items 10
```

### Lambda 関数のテスト

```bash
# Lambda を直接呼び出し
aws lambda invoke \
  --function-name ai-avatar-backend-dev \
  --payload '{"httpMethod":"GET","path":"/api/health"}' \
  response.json

cat response.json
```

## クリーンアップ

### スタック削除

```bash
# 開発環境削除
sam delete --stack-name ai-avatar-dev

# または
aws cloudformation delete-stack --stack-name ai-avatar-dev
```

**注意**: S3 バケットにファイルが残っている場合、先に削除が必要です:

```bash
# S3 バケットを空にしてから削除
aws s3 rm s3://ai-avatar-frontend-dev-ACCOUNT_ID/ --recursive
```

## 環境別設定

### Dev 環境

- Stack: `ai-avatar-dev`
- Region: `ap-northeast-1`
- ログ保持期間: 7日

### Prod 環境

- Stack: `ai-avatar-prod`
- Region: `ap-northeast-1`
- ログ保持期間: 30日
- 変更セット確認必須

## コスト見積もり

### 月間コスト (想定: 月100万リクエスト)

- **Lambda**: $0-5
- **API Gateway**: $3.50
- **S3**: $1-5
- **CloudFront**: $1-10
- **合計**: $10-25/月

無料枠内であれば $0-5/月 も可能。

## 関連ドキュメント

- [document/16-SAM移行計画.md](../document/16-SAM移行計画.md) - 詳細な移行計画
- [document/14-デプロイメント.md](../document/14-デプロイメント.md) - デプロイメント戦略
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)

## サポート

問題が発生した場合:
1. CloudWatch Logs を確認
2. GitHub Issues を確認
3. ドキュメントを参照
