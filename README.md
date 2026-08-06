# BCDice API on Cloudflare Workers

BCDice APIをCloudflare Workers / Hono で動作するように、[bcdice-js](https://github.com/bcdice/bcdice-js) を利用して移植したプロジェクトです。

## 特徴
- **Cloudflare Workers への対応**: Cloudflare Workersのエッジ実行環境に対応。
- **BCDice API v2 準拠**: 既存のフロントエンド・クライアントとの互換性を維持。

## 技術スタック
- **Runtime**: [Bun](https://bun.sh/)
- **Platform**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **Framework**: [Hono](https://hono.dev/)
- **Core Logic**: [BCDice](https://github.com/bcdice/BCDice) (via [bcdice-js](https://github.com/bcdice/bcdice-js))

## クイックスタート

### 1. 準備
リポジトリをクローンし、依存関係をインストールします。

```bash
git clone --recursive https://github.com/JanMaki/bcdice-api-cf.git
cd bcdice-api-cf
bun install
```

> [!NOTE]
> `bun install` 時に `postinstall` スクリプトが走り、BCDice のパッチ適用や i18n ローダーの生成が自動的に行われます。

### 2. ローカル開発
開発サーバーを起動します。

```bash
bun run dev
```

### 3. テスト
```bash
bun test
```

### 4. デプロイ
```bash
bun run deploy
```

## API 仕様
BCDice API v2 に準拠しています。
詳細な仕様については、本家リポジトリの [API v2 Documentation](https://github.com/bcdice/bcdice-api/blob/master/docs/api_v2.md) を参照してください。

## ライセンス
このプロジェクトは MIT ライセンスの下で公開されています。
BCDice 自体のライセンスについては [BCDice のリポジトリ](https://github.com/bcdice/BCDice) を確認してください。
