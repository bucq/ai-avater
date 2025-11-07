# AI Avatar Backend API

FastAPI + Mangum バックエンド (AWS Lambda対応)

## 特徴

- **ローカル開発**: LM Studio (google/gemma-3-1b) 経由でチャット
- **Lambda環境**: AWS Bedrock (Nova Model) を使用
- **環境自動切り替え**: `ENVIRONMENT` 変数で自動判定
- **CORS対応**: S3 SPAからのアクセスに対応

## ディレクトリ構造

```
backend/
├── app/
│   ├── main.py              # FastAPI + Mangum エントリポイント
│   ├── config.py            # 環境変数管理
│   ├── routers/
│   │   ├── health.py        # GET /api/health
│   │   └── chat.py          # POST /api/chat
│   ├── services/
│   │   ├── ai_service.py    # AI統合 (LM Studio/Bedrock)
│   │   └── emotion_analyzer.py  # 感情分析
│   └── models/
│       └── schemas.py       # Pydantic models
├── requirements.txt
├── local_server.py          # ローカル開発用サーバー
└── .env.example             # 環境変数テンプレート
```

## セットアップ

### 1. 仮想環境作成

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 2. 依存関係インストール

```bash
pip install -r requirements.txt
```

### 3. 環境変数設定

```bash
cp .env.example .env

# .env ファイルを編集
# ENVIRONMENT=local
# LM_STUDIO_ENDPOINT=http://localhost:1234
# LM_STUDIO_MODEL=google/gemma-3-1b
```

### 4. LM Studio 起動

1. LM Studio を起動
2. `google/gemma-3-1b` モデルをロード
3. ローカルサーバーを起動 (デフォルト: http://localhost:1234)

## ローカル開発

### サーバー起動

```bash
python local_server.py
```

サーバーが起動すると:
- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### API テスト

#### ヘルスチェック

```bash
curl http://localhost:8000/api/health
```

レスポンス:
```json
{
  "status": "ok",
  "timestamp": "2025-11-08T12:00:00",
  "environment": "local",
  "ai_backend": "lm_studio"
}
```

#### チャット

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "こんにちは!",
    "conversation_history": []
  }'
```

レスポンス:
```json
{
  "text": "こんにちは!今日はどんなお話をしましょうか?",
  "emotion": "happy",
  "intensity": 0.8,
  "keywords": ["こんにちは", "お話"],
  "audio_url": "",
  "lip_sync_data": {
    "duration": 0.0,
    "mouth_cues": []
  }
}
```

## Lambda 環境テスト (SAM CLI)

### ローカルでLambda環境をシミュレート

```bash
cd ../infrastructure
sam local start-api --env-vars env.json
```

- API: http://localhost:3000

## デプロイ

### Lambda へデプロイ

```bash
cd ../infrastructure
sam build
sam deploy --guided
```

## エンドポイント

### GET /api/health

ヘルスチェック

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-08T12:00:00",
  "environment": "local",
  "ai_backend": "lm_studio"
}
```

### POST /api/chat

チャット応答生成

**Request:**
```json
{
  "message": "こんにちは!",
  "conversation_history": [
    {"role": "user", "content": "はじめまして"},
    {"role": "assistant", "content": "こんにちは!"}
  ]
}
```

**Response:**
```json
{
  "text": "こんにちは!よろしくお願いします!",
  "emotion": "happy",
  "intensity": 0.8,
  "keywords": ["こんにちは"],
  "audio_url": "",
  "lip_sync_data": {
    "duration": 0.0,
    "mouth_cues": []
  }
}
```

## 環境変数

| 変数 | デフォルト | 説明 |
|------|-----------|------|
| `ENVIRONMENT` | local | 環境名 (local/development/production) |
| `LOG_LEVEL` | INFO | ログレベル |
| `LM_STUDIO_ENDPOINT` | http://localhost:1234 | LM Studio URL |
| `LM_STUDIO_MODEL` | google/gemma-3-1b | モデル名 |
| `BEDROCK_MODEL_ID` | amazon.nova-micro-v1:0 | Bedrock モデルID |
| `BEDROCK_REGION` | us-east-1 | Bedrock リージョン |

## AI バックエンドの切り替え

環境変数 `ENVIRONMENT` で自動判定:

- `local` / `development` → LM Studio
- `production` → AWS Bedrock

## トラブルシューティング

### LM Studio に接続できない

```bash
# LM Studio が起動しているか確認
curl http://localhost:1234/v1/models

# .env の LM_STUDIO_ENDPOINT を確認
cat .env | grep LM_STUDIO
```

### モジュールが見つからない

```bash
# 仮想環境がアクティブか確認
which python  # Mac/Linux
where python  # Windows

# 依存関係を再インストール
pip install -r requirements.txt
```

### ポートが使用中

```bash
# ポートを変更
# local_server.py の port=8000 を変更
```

## 開発メモ

### Phase 1 (現在)
- ✅ LM Studio 統合
- ✅ Bedrock 統合 (基本実装)
- ✅ シンプルな感情分析
- ⏳ 音声合成 (未実装)
- ⏳ リップシンク (未実装)

### Phase 2 (今後)
- Amazon Polly 統合
- Rhubarb Lip Sync 統合
- 高度な感情分析
- 会話履歴の永続化

## 関連ドキュメント

- [プロジェクト概要](../CLAUDE.md)
- [システム構成](../document/02-システム構成.md)
- [API仕様](../document/10-API仕様.md)
- [SAM移行計画](../document/16-SAM移行計画.md)
