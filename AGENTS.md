# AGENTS.md

このファイルは、このリポジトリで作業する Codex 向けの永続的なプロジェクト指示です。リポジトリルートは Backstage ベースの internal developer platform 本体です。

## 最初に読むこと

作業前に必ず以下を読んでください。

- `docs/backstage-customization-rules.md`
- `README.md`
- `package.json`

## 重要な前提

Backstage app はリポジトリルート直下にあります。

Backstage 関連の実装では以下を基準にしてください。

- app root: `.`
- frontend app: `packages/app/`
- backend app: `packages/backend/`
- plugins: `plugins/`
- config: `app-config*.yaml`

## ディレクトリ構成

- `packages/app/`: Backstage frontend application です。frontend plugin/module 登録、route 追加、navigation 追加などの配線に限定してください。
- `packages/backend/`: Backstage backend です。backend plugin/module 登録などの配線に限定してください。
- `plugins/`: プロジェクト固有の Backstage plugin を置く場所です。新機能や IDP 独自の業務ロジックは原則ここに置いてください。
- `examples/`: catalog entity や software template のサンプルです。
- `docs/`: セットアップ、運用、知識メモ、AI コーディングルールなどのドキュメントです。
- `app-config.yaml`: ローカル開発向けを含む基本設定です。
- `app-config.production.yaml`: 本番向け設定です。変更時は本番影響を明示してください。

## Runtime と package manager

- Node.js は `22` または `24` を使ってください。
- Yarn は Corepack 経由で使ってください。
- package manager は `yarn@4.4.1` です。
- `npm`、`pnpm`、`package-lock.json`、`pnpm-lock.yaml` は導入しないでください。package manager を変える必要がある場合は、事前に理由と影響を説明して確認してください。

確認用コマンド:

```bash
node --version
corepack --version
yarn --version
```

Yarn が使えない場合は、Corepack を有効化します。

```bash
corepack enable
```

## よく使うコマンド

特に断りがない限り、リポジトリルートで実行します。

```bash
yarn install
yarn start
yarn tsc
yarn lint:all
yarn test
yarn test:all
yarn build:all
yarn build:backend
yarn test:e2e
```

ローカル起動時の既定URL:

- frontend: `http://localhost:3000`
- backend: `http://localhost:7007`

## 変更方針

- ユーザーや他の作業者の変更を勝手に戻さないでください。
- 変更は依頼された目的に絞り、無関係な整形やリファクタリングを混ぜないでください。
- 既存の Backstage 構成と plugin pattern を優先してください。
- Backstage 本体の直接改造を避けてください。
- 新機能は原則 `plugins/` 配下に作ってください。
- `packages/app/` は frontend plugin/module 登録、route 追加、navigation 追加などの配線に限定してください。
- `packages/backend/` は backend plugin/module 登録などの配線に限定してください。
- IDP 独自の業務ロジックを `packages/app/` や `packages/backend/` に直接書かないでください。
- 外部 OSS Backstage plugin を将来的に取り込める構成を維持してください。
- Backstage upgrade を困難にする変更を避けてください。
- 新しい npm / Backstage 依存を追加する場合は、事前に目的、代替案、影響範囲を説明して確認してください。
- `node_modules`、ビルド成果物、生成物は探索・編集対象にしないでください。ただし依存内部の調査を明示的に依頼された場合は例外です。

## 作業前の確認

実装前に、変更予定ファイルを確認してください。

特に以下を変更する場合は注意してください。

- `packages/app/**`
- `packages/backend/**`
- `package.json`
- `app-config*.yaml`

## ルール違反が必要な場合

上記ルールに反する変更が必要な場合は、実装前に以下を説明してください。

- なぜ必要か
- `plugins/` に置けない理由
- 代替案
- Backstage upgrade への影響
- 外部 OSS plugin 取り込みへの影響

## 設定と secret

- secret、token、credential、個人環境のパスをコミットしないでください。
- 設定ファイルに secret 値を直書きせず、環境変数や環境ごとの secret store を使う前提にしてください。
- `GITHUB_TOKEN`、`POSTGRES_*` などは環境変数参照を維持してください。
- `app-config.production.yaml`、本番DB、auth provider、catalog location、GitHub integration、TechDocs、Kubernetes、MCP actions に関わる変更は慎重に扱ってください。
- 本番設定、認証、権限、外部連携の変更では、変更理由と影響範囲を明示してください。

## 検証方針

- TypeScript の狭い変更: 近いテスト、または `yarn tsc` を実行してください。
- frontend の挙動変更: 関連する app test を実行し、ユーザー導線が変わる場合は `yarn test:e2e` を検討してください。
- backend の挙動変更: 関連する backend test を実行し、起動や packaging に影響する場合は `yarn build:backend` を実行してください。
- 広範囲の変更: `yarn lint:all`、`yarn tsc`、`yarn test` を実行してください。
- 検証コマンドを実行できない場合は、理由と未検証範囲を報告してください。

## ドキュメント更新

- このファイルは小さく保ちます。
- Codex が同じ誤りを繰り返した場合や、PR で同じ指摘が繰り返された場合は、その内容を最も近い `AGENTS.md` に追記してください。
- 一般的な説明や長い手順は `docs/` に置き、`AGENTS.md` からは要点だけ参照してください。
