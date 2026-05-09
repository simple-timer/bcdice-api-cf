# BCDice API on Cloudflare Workers

```bash
bun install
bun run dev
```

```bash
bun run deploy
```

## 既知の問題 (Known Issues)

### テストデータのTOMLパースエラー
- **対象ファイル**: `Aionia.toml`, `DoubleCross_Korean.toml`, `PastFutureParadox.toml`, `RuneQuest.toml`
- **原因**: BCDice v3.16.1 時点のテストデータに含まれる不備（キーの重複等）。BunのパーサーはTOML仕様に厳格なためエラーとなります。
- **詳細**: この不備は BCDice の [e06258b](https://github.com/bcdice/BCDice/commit/e06258b519dd564ffae2abca9a3d83e661d6cd5e) で修正されましたが、本プロジェクトが追従している v3.16.1 では未修正のままとなっています。
- **対応**: テストランナー (`test/v2/dicebot.test.ts`) 側でパースエラーをハンドリングし、スキップするようにしています。
