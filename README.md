```txt
npm install
npm run dev
```

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```

## 既知の問題 (Known Issues)

### テストデータのTOMLパースエラー
- **対象ファイル**: `Aionia.toml`, `DoubleCross_Korean.toml`, `PastFutureParadox.toml`, `RuneQuest.toml`
npm install
npm run dev

npm run deploy

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

npm run cf-typegen

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```

## 既知の問題 (Known Issues)

### テストデータのTOMLパースエラー
- **対象ファイル**: `Aionia.toml`, `DoubleCross_Korean.toml`, `PastFutureParadox.toml`, `RuneQuest.toml`
- **原因**: BCDice v3.16.1 時点のテストデータに含まれる不備（キーの重複等）。Bunのパーサーは仕様に厳格なためエラーとなります。
- **対応**: テストランナー (`test/v2/dicebot.test.ts`) 側でパースエラーをハンドリングし、失敗として報告した上でスキップするようにしています。

### ロジック差異によるテスト失敗
- **対象ファイル**: `BattleTech.toml`, `KillDeathBusiness_Korean.toml`, `Repeat.toml` 等、約200件
- **原因**: Ruby版とJS版の間での改行・空白の扱いや、`StringScanner` の挙動の差異、翻訳データの進捗差異など。
- **対応**: `bcdice-js` における `StringScanner` の修正 (PR #73) や v3.16.1 への追従 (PR #70) 等の修正を適用することで順次解消されます。
