# Backstage Architecture Notes

## 位置づけ

このドキュメントは、Backstage ベースの Internal Developer Platform である本リポジトリに独自機能を追加するときの設計メモです。細かい手順書ではなく、Codex や開発者が実装方針を判断するための前提をまとめます。

`AGENTS.md` は短い行動原則とディレクトリ概要に留め、このファイルに Backstage 固有のアーキテクチャ知識を集約します。

## このリポジトリにおける Backstage 拡張の基本方針

- 独自機能や IDP 固有の業務ロジックは、原則として `plugins/` 配下の plugin または module に閉じる。
- `packages/app` と `packages/backend` は、plugin / module / app-level extension を登録してつなぐ配線層として扱う。
- 公式 plugin や Backstage 生成コードを直接コピーして改造するのではなく、公開 API、extension point、module、設定、app-level extension で拡張する。
- OSS plugin との互換性を保つため、Backstage の New Frontend System と Backend System の境界を尊重する。
- 見た目、ナビゲーション、共通レイアウトなどアプリ全体の関心事は app-level extension として扱い、個別 plugin の実装にグローバルな前提を押し込まない。
- backend 側の横断関心事は service または既存 plugin の extension point を通じて共有し、plugin 間の直接結合を避ける。

## New Frontend System の考え方

New Frontend System では、アプリは frontend feature の集合として構成されます。frontend plugin、frontend module、extension はすべて feature として登録され、extension tree によってページ、ナビゲーション、API、テーマ、アプリシェルなどが組み立てられます。

この方式では、`packages/app` の React コンポーネントにすべてを直接書くのではなく、各 plugin が自分のページや UI 断片を extension として公開し、アプリ側はそれらをインストール・設定・接続します。

### frontend plugin

frontend plugin は、ユーザーに見える機能単位です。典型的には次のようなものを提供します。

- 独立したページやルート
- Software Catalog など他 plugin に差し込むカードやタブ
- plugin 専用の API client や state
- navigation item や search result などの extension

本リポジトリで独自画面や業務 UI を追加する場合は、まず `plugins/` 配下に frontend plugin として切り出せるかを検討します。

### frontend module

frontend module は、既存 plugin を追加で拡張するための単位です。新しい独立機能を作るというより、既存 plugin の extension point や入力に対して、追加の UI、設定、連携部品を提供します。

例としては、Catalog entity page に独自カードを追加する、Search の表示部品を追加する、既存 plugin の extension tree に組織固有の部品を差し込む、といった用途です。

### extension

extension は、frontend system で実際に接続される最小の UI / API / 設定単位です。ページ、カード、ナビゲーション項目、テーマ、アプリ root wrapper などは extension として表現されます。

実装時は、extension の ID、接続先、入力・出力、設定可能性を安定した公開面として扱います。後から OSS plugin や別 module と共存できるように、特定の配置や順序に依存しすぎない設計を優先します。

### app-level extension

app-level extension は、特定 plugin の内側ではなく、アプリ全体の shell や見た目を調整するための extension です。

本リポジトリでは、テーマ、サイドバー、トップバー、root wrapper など、全 plugin にまたがる UI 調整は app-level extension として扱います。一方で、特定業務の画面やロジックは app-level extension に肥大化させず、plugin 側に置きます。

## `packages/app` の扱い

`packages/app` は Backstage frontend app の起点です。現在も `createApp` に OSS plugin とローカル module を登録する配線層として使っています。

今後の変更では、次の方針を守ります。

- plugin / module / app-level extension の登録、依存関係追加、アプリ全体の shell 設定に限定する。
- 独自業務 UI、API 呼び出し、状態管理、entity 固有ロジックを `packages/app` に直接増やさない。
- OSS plugin のページや component をコピーして `packages/app` で改造しない。
- 例外的に `packages/app` を触る場合は、「アプリ全体の配線か」「plugin に閉じるべきではないか」を先に確認する。
- グローバル CSS や root wrapper は、OSS plugin の表示を壊しやすいため、範囲を狭くし、plugin 固有の見た目調整は可能な限り plugin / module 側に寄せる。

## Backend System の考え方

Backend System では、backend は backend feature の集合として構成されます。backend plugin、backend module、service implementation を `createBackend` で登録し、各 feature が必要な依存関係を宣言して初期化されます。

この方式では、巨大な Express app や singleton に処理を直接追加するのではなく、plugin が機能境界を持ち、module が既存 plugin を拡張し、service が横断機能を提供します。

### backend plugin

backend plugin は、backend 側の独立した機能単位です。HTTP router、scheduler task、database table、permission、catalog processor などを持つことがあります。

本リポジトリで独自 backend API や業務ロジックを追加する場合は、まず `plugins/` 配下の backend plugin として実装することを検討します。既存 OSS plugin の責務に自然に属する拡張であれば、backend module を優先します。

### backend module

backend module は、特定の backend plugin を拡張する単位です。module は対象 plugin の extension point に接続して、processor、action、provider、policy、collator などを追加します。

たとえば Scaffolder action、Catalog processor、Auth provider、Search collator の追加は、既存 plugin を fork せず backend module として実装するのが基本です。

### extension point

extension point は、plugin が module に対して公開する拡張口です。module は extension point を通じて plugin の内部機能を安全に拡張できます。

設計上は、extension point を plugin の公開 API として扱います。独自 plugin を作る場合も、将来 module で差し替えたい処理や追加したい処理があるなら、最初から extension point を設けることを検討します。

### service

service は、複数の plugin / module から利用される横断機能です。logger、config、database、discovery、auth、permissions などの標準 service に加えて、組織固有の共通 client や policy を service として表現できる場合があります。

ただし、service は便利な共有手段である一方、過度に使うと plugin 境界が曖昧になります。特定 plugin の業務ロジックは service に逃がさず、その plugin の内部または extension point として設計します。

## `packages/backend` の扱い

`packages/backend` は Backstage backend の起点です。現在も `createBackend` に OSS plugin と module を `backend.add(...)` で登録する配線層として使っています。

今後の変更では、次の方針を守ります。

- backend plugin / backend module / service implementation の登録に限定する。
- 独自 router、handler、database 操作、外部 API client、業務ロジックを `packages/backend/src/index.ts` に直接書かない。
- 公式 backend plugin のコードをコピーして改造しない。
- OSS plugin に拡張口がある場合は、backend module と extension point を使う。
- 独自機能が既存 plugin の拡張ではなく新しい責務を持つ場合は、`plugins/` 配下に backend plugin を作る。
- production 設定に影響する変更は、`app-config.production.yaml` への影響を明示する。

## OSS plugin 互換性を保つための注意点

- OSS plugin は可能な限り dependency として導入し、公開された frontend / backend feature を登録する。
- New Frontend System 対応 plugin を優先する。legacy frontend plugin を使う場合は、公式の互換レイヤーや移行パスを検討する。
- extension ID、route ref、API ref、permission、config schema など、plugin が公開する契約を尊重する。
- app-level の theme / layout / CSS は、plugin 内部 DOM 構造に依存しない。
- backend では、OSS plugin の内部クラスや非公開 module path に依存しない。
- OSS plugin の挙動変更が必要な場合は、fork やコピー改造よりも、設定、extension point、module、upstream contribution を優先する。
- 独自 plugin から OSS plugin の内部実装へ直接 import しない。必要なら `*-node` package など公開 API に依存する。

## 独自機能を追加するときの判断軸

| 追加したいもの                             | 置き場所の第一候補                            | 判断基準                                             |
| ------------------------------------------ | --------------------------------------------- | ---------------------------------------------------- |
| 新しい業務画面                             | `plugins/` の frontend plugin                 | 独立したページ、ルート、API client、状態を持つ       |
| 既存画面へのカード・タブ追加               | `plugins/` の frontend module                 | Catalog など既存 plugin の extension tree に差し込む |
| アプリ全体のテーマ・ナビゲーション         | `packages/app` で登録する app-level extension | 全 plugin にまたがる shell / appearance の調整       |
| 新しい backend API / worker                | `plugins/` の backend plugin                  | 独立した backend 責務、router、DB、schedule を持つ   |
| Scaffolder action / Catalog processor 追加 | `plugins/` の backend module                  | 既存 OSS plugin の extension point に接続する        |
| 複数 plugin で使う共通 client              | service または共有 library                    | 横断機能だが、業務ロジック本体ではない               |
| plugin / module の登録                     | `packages/app` / `packages/backend`           | 配線だけを行い、機能実装は持たない                   |

迷った場合は、次の順で考えます。

1. 既存 OSS plugin の設定や extension point で表現できるか。
2. 既存 plugin の拡張なら module として書けるか。
3. 独立した責務なら `plugins/` 配下の plugin として切り出せるか。
4. アプリ全体の見た目や配線だけなら `packages/app` / `packages/backend` に置いてよいか。
5. 公式 plugin や生成コードのコピー改造になっていないか。

この判断により、Backstage のアップデート、OSS plugin の追加、Codex による将来実装のいずれでも、変更範囲を小さく保ちます。
