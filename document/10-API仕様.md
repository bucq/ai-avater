# 10. API仕様

[[09-データ構造|← 前へ]] | [[00-INDEX|目次]] | [[11-ファイル構成|次へ →]]

---

## 10.1 エンドポイント一覧

| エンドポイント | メソッド | 説明 |
|--------------|---------|------|
| /api/chat | POST | チャット応答生成 |
| /api/health | GET | ヘルスチェック |

ベースURL: `http://localhost:8000` (開発環境)

## 10.2 POST /api/chat

### リクエスト

```json
{
  "message": "こんにちは",
  "conversationHistory": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ]
}
```

### レスポンス

```json
{
  "text": "こんにちは！今日はどうされましたか？",
  "emotion": "happy",
  "intensity": 0.8,
  "keywords": ["こんにちは"],
  "audioUrl": "https://storage.../audio.mp3",
  "lipSyncData": {
    "duration": 2.5,
    "mouthCues": [
      {"start": 0.0, "end": 0.2, "value": "X"},
      {"start": 0.2, "end": 0.4, "value": "A"}
    ]
  }
}
```

### エラーレスポンス

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "メッセージは500文字以内で入力してください",
    "details": {}
  }
}
```

### エラーコード

| コード | HTTPステータス | 説明 |
|-------|--------------|------|
| INVALID_INPUT | 400 | 入力検証エラー |
| RATE_LIMIT_EXCEEDED | 429 | レート制限超過 |
| AI_SERVICE_ERROR | 502 | AI APIエラー |
| TTS_SERVICE_ERROR | 502 | 音声合成エラー |
| INTERNAL_SERVER_ERROR | 500 | サーバー内部エラー |

## 10.3 GET /api/health

### レスポンス

```json
{
  "status": "ok",
  "timestamp": "2025-10-30T12:00:00Z"
}
```

## 10.4 関連ドキュメント

- [[06-AI対話機能|AI対話機能]]
- [[09-データ構造|データ構造]]

---

**タグ**: #API #仕様 #エンドポイント
**更新日**: 2025-10-30
