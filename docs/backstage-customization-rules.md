# Backstage Customization Rules

## 基本方針

* Backstage本体は原則として直接改造しない
* IDP独自機能は原則として `plugins/` 配下に実装する
* `packages/app/` はfrontend pluginやmoduleの登録、画面ルーティング、ナビゲーション、plugin mountなどの配線用途に限定する
* `packages/backend/` はbackend plugin登録、module登録、設定読み込みなどの配線用途に限定する
* `app-config.yaml` と `app-config.production.yaml` はBackstage/Pluginの設定を記述する場所として扱う
* `docs/` は設計、運用ルール、AIコーディングルール、意思決定記録を置く場所として扱う
* 外部OSS Backstage pluginを将来的に取り込めるよう、Backstage標準構成を維持する
* Backstage upgradeを困難にする変更を避ける

## 変更してよい場所

* `plugins/**`
* `app-config.yaml`
* `app-config.production.yaml`
* `examples/**`
* `catalog-info.yaml`
* `docs/**`

## 最小限だけ変更してよい場所

* `packages/app/**`

  * frontend plugin/module登録
  * route追加
  * sidebar / navigation追加
  * plugin mount追加
  * app全体設定の最小変更

* `packages/backend/**`

  * backend plugin登録
  * backend module登録
  * 設定読み込み
  * plugin wiring

* `package.json`

  * plugin追加時に必要なworkspace依存関係の追加
  * Backstage公式手順に沿った依存関係の追加
  * ただし workspace構成そのものの安易な変更は禁止

## 原則変更しない場所

* `node_modules/**`
* `packages/app/` への業務ロジック直書き
* `packages/backend/` への業務ロジック直書き
* `@backstage/*` パッケージの内部実装
* Backstage core相当の内部実装
* Backstage標準構成を壊す変更

## 禁止事項

* AWS/GitHub/Terraform/OpenTofu/DB操作などのIDP業務ロジックを `packages/backend/` に直接書かない
* UIの業務ロジックを `packages/app/` に直接書かない
* Backstage upgradeを困難にする変更をしない
* 外部OSS Backstage pluginを取り込めなくなるような構成変更をしない
* `package.json` の workspace構成を安易に変更しない
* Backstage本体の挙動をフォーク的に改造しない
* ルート直下に別のNode/React/Expressアプリを勝手に作らない

## 推奨配置

| やりたいこと               | 配置場所                                                             |
| -------------------- | ---------------------------------------------------------------- |
| 新しい画面                | `plugins/<feature-name>/`                                        |
| 新しいfrontend plugin   | `plugins/<feature-name>/`                                        |
| 新しいbackend plugin    | `plugins/<feature-name>-backend/`                                |
| AWS操作                | `plugins/cloud-resources-backend/`                               |
| GitHub repo作成        | `plugins/repository-manager-backend/`                            |
| Terraform/OpenTofu実行 | `plugins/deployment-runner-backend/`                             |
| 申請・承認処理              | `plugins/approval-workflow-backend/`                             |
| テンプレート管理             | `plugins/software-templates/` または `plugins/software-templates-backend/` |
| メニュー追加               | `packages/app/`                                                  |
| frontend plugin登録    | `packages/app/`                                                  |
| backend plugin登録     | `packages/backend/`                                              |
| GitHub token設定       | `app-config.yaml` またはローカル設定                                      |
| Catalog定義            | `examples/`、`catalog-info.yaml`、または各生成リポジトリの `catalog-info.yaml` |
| 設計方針・ルール             | `docs/`                                                          |

## 判断基準

実装場所に迷った場合は、以下で判断する。

* 「IDP独自の機能本体」なら `plugins/`
* 「Backstageアプリに機能を表示するための接続」なら `packages/app/`
* 「Backstageバックエンドに機能を登録するための接続」なら `packages/backend/`
* 「環境や連携先の設定」なら `app-config*.yaml`
* 「設計・運用・AIへの指示」なら `docs/`

## AIエージェント向け作業ルール

AIエージェントは作業前にこのファイルを読み、変更予定ファイルを確認すること。

以下に該当する場合は、実装前に理由、代替案、影響範囲を説明すること。

* `packages/app/` に大きな変更を入れる場合
* `packages/backend/` に大きな変更を入れる場合
* `package.json` の workspace構成を変更する場合
* Backstage標準構成から外れる場合
* `plugins/` 以外にIDP独自ロジックを書く場合

## このリポジトリでの前提

このリポジトリでは、Backstage app はリポジトリルート直下にある。
そのため、一般的なBackstage解説に出てくる `packages/`、`plugins/`、`app-config.yaml` は、そのままこのリポジトリルート直下のパスを指す。

現在の `packages/app/src/App.tsx` は、`createApp({ features: [...] })` にfrontend plugin/moduleを登録する薄い構成である。
そのため、独自UI実装を `packages/app/` に直接書くのではなく、原則として `plugins/` 配下にfrontend pluginを作成し、`packages/app/` では登録だけ行う。

現在の `packages/backend/src/index.ts` は、`createBackend()` にbackend plugin/moduleを `backend.add(import(...))` で登録する構成である。
そのため、独自backend処理を `packages/backend/` に直接書くのではなく、原則として `plugins/` 配下にbackend plugin/moduleを作成し、`packages/backend/` では登録だけ行う。
