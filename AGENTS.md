# AGENTS.md

このファイルは、このリポジトリで作業する Codex 向けの永続的なプロジェクト指示です。リポジトリルートは Backstage ベースの internal developer platform 本体です。

## ディレクトリ構成

- `packages/app/`: Backstage frontend です。
- `packages/backend/`: Backstage backend です。
- `plugins/`: プロジェクト固有の Backstage plugin を置く場所です。新機能や IDP 独自の業務ロジックは原則ここに置いてください。
- `examples/`: catalog entity や software template のサンプルです。
- `docs/`: セットアップ、運用、知識メモ、AI コーディングルールなどのドキュメントです。
- `app-config.yaml`: ローカル開発向けを含む基本設定です。
- `app-config.production.yaml`: 本番向け設定です。変更時は本番影響を明示してください。
