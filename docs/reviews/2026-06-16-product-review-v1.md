# 製品レビューと改善提案 v1

- 日付: 2026-06-16
- 対象: Backstage ベースの Internal Developer Platform としての Bara Developer Platform
- レビュー種別: 実装タスク洗い出しではなく、製品・アーキテクチャ観点のレビュー

## 既存レビュー / ADR の確認

### リポジトリから確認できた事実

- このレビュー作成前の時点では `docs/reviews/` は存在しておらず、参照すべき過去の product review はありませんでした。
- このレビュー作成前の時点では `docs/adr/` は存在しておらず、参照すべき承認済み ADR はありませんでした。
- 既存の設計メモでは、IDP 固有機能は Backstage の plugin / module / extension / configuration として実装し、`packages/app` と `packages/backend` は薄い合成・配線層に保つ方針が明示されています。
- 既存の管理モデルメモでは、Catalog は発見・公開参照、Git YAML はレビュー可能な desired state、DB は runtime state・履歴・イベント・監査ログを扱う、という三層の責務分担が整理されています。
- 既存の UI 互換性メモでは、現在の shell customization は app-level extension として扱い、将来の OSS plugin 互換性を維持する意図が示されています。

### 今回のレビュー方針

「独自ロジックを plugins 配下へ寄せる」という一般的な提案は、すでにプロジェクト方針として明文化されています。そのため本レビューでは、それを新しい指摘として繰り返すのではなく、現在の製品方向性、情報設計、初期実装がその方針と整合しているか、また今後どの製品判断が必要かに焦点を当てます。

## 現状サマリー

### 事実

- フロントエンドアプリは `createApp` により Backstage の New Frontend System を利用しており、Catalog plugin、internal IDP frontend plugin、navigation module を登録しています。
- バックエンドは主に Backstage feature の合成ファイルであり、app、proxy、scaffolder、auth、catalog、permission、search、Kubernetes、notifications、signals、MCP actions などの標準 Backstage backend plugin を登録しています。
- `plugins/idp` には独自 frontend plugin が存在し、`/idp/*` 配下にダッシュボード、プロジェクト、環境、テンプレート、テンプレート詳細、テンプレート実行の画面を提供しています。
- IDP plugin は現時点ではモックデータを利用するブラウザローカルのインメモリ API を使っています。コードコメントでも、IDP DB、Scaffolder、GitHub、AWS 連携を追加する段階で Backstage backend plugin/API に置き換える前提が示されています。
- IDP の型モデルには、Project、Environment、Template、TemplateExecution、Deployment、OperationLog の概念がすでに含まれています。
- `app-config.yaml` には `Scaffolded Backstage App` や `My Company` といった汎用的なプロダクト名が残っている一方、IDP plugin 側では Bara 固有の概念が使われています。
- `app-config.yaml` は Backstage の example entity と sample software template を登録しています。ただし、`docs/idp-management-model.md` で説明されている `examples/idp-projects/` の PoC は、今回確認したリポジトリ状態には存在していませんでした。

### 解釈

このリポジトリは、製品の方向性を固めている初期段階にあります。Backstage 互換性を重視した土台、IDP 固有のフロントエンド上のコンセプト、設計メモは揃っていますが、実行可能な製品としてはまだ一貫した MVP というよりプロトタイプ / デモに近い状態です。主な課題はコード品質ではなく、Project とは何か、Environment の状態をどこが正とするか、Template は Scaffolder とどう関係するか、最初の価値あるユーザー導線を何にするか、という製品契約の判断です。

## 良い点

- Backstage の生成 app を hard fork せず、plugin / module / extension / configuration の境界で拡張するというアーキテクチャ上のガードレールが明確です。
- 現在のフロントエンド統合は薄く、`packages/app` は IDP 画面ロジックを直接持たず feature 登録に留まっています。
- 現在のバックエンドのエントリポイントも薄く、主に Backstage backend feature の登録に留まっています。
- Project、Environment、Template、実行履歴、操作ログなどのドメイン概念を扱う IDP 固有 UI が `plugins/idp` に分離されており、配置として妥当です。
- 管理モデル文書で Git YAML、Catalog、DB の責務が分離されています。これは Catalog、DB table、Git configuration が競合する source of truth になりがちな IDP の典型的な失敗を避けるうえで重要です。
- UI は Backstage の生の Component / System / Resource だけを見せるのではなく、Project / Environment / Template という IDP 利用者に近い語彙を提示しています。これは Backstage との差別化に有効です。

## 製品上の課題

### 1. 製品コンセプトは有望だが、まだ明文化が不足している

事実:

- IDP UI は Projects、Environments、Templates、operational activity を中心に構成されています。
- Backstage app-level の title や organization はまだ汎用的な名称のままです。

評価:

現在見えている製品コンセプトは「Backstage 上に構築された、project portfolio、runtime environment、ゴールデンパステンプレートを落ち着いて扱える self-service / operations workspace」と整理できます。この方向性は妥当ですが、ユーザー向け docs や アプリ設定にはまだ短い製品メッセージとして表現されていません。ここが曖昧なままだと、今後の機能追加が Bara 固有の IDP 価値ではなく、汎用 Backstage ポータルの拡張に流れるリスクがあります。

### 2. ターゲットユーザーが暗黙的で、明示されていない

事実:

- UI には プロジェクトオーナー、テンプレート実行、リポジトリ、環境、deployment/app/infra/alert のステータス、操作ログ が含まれています。

評価:

少なくとも次の 3 種類のユーザーが想定されます。

1. service を作成し environment を確認するアプリケーション開発者。
2. template を公開し、連携機能を運用するプラットフォームエンジニア。
3. portfolio 全体の状態を把握したいエンジニアリングマネージャー / テックリード。

MVP では主対象ユーザーを 1 つ選び、そのユーザーの最初の導線に最適化すべきです。最初から 3 者を同じ重みで扱うと、ナビゲーションやデータモデルの判断が曖昧になります。

### 3. MVP の導線が 1 つの成果に固定されていない

事実:

- IDP plugin には ダッシュボード、プロジェクト一覧 / 詳細、環境一覧 / 詳細、テンプレート一覧 / 詳細、テンプレート実行 画面があります。
- template execution は現時点では インメモリの実行レコードを作成するだけです。

評価:

画面の範囲は広い一方、製品として達成できる成果はまだ強制されていません。MVP としては、例えば次のような 1 本の 一貫した縦断導線 に絞ると判断しやすくなります。

> 「開発者が ゴールデンパステンプレートを選択し、Project に作成または紐付け、Environment を指定し、その結果として Catalog entity と実行ステータス を確認できる。」

この 一貫した縦断導線 が成立するまでは、画面は広く見えても製品体験としては曖昧に感じられる可能性があります。

### 4. Backstage との差別化は見え始めているが、まだ脆い

事実:

- Backstage にはすでに Catalog と Scaffolder があります。
- IDP plugin は Project / Environment / Template という上位の workspace を導入しています。

評価:

差別化は「見た目を整えた Backstage」ではなく、「Backstage の上に 意図を持った運用モデルを載せること」であるべきです。具体的には project portfolio、environment lifecycle、ゴールデンパステンプレート governance、runtime operations です。現在の UI はその方向を示していますが、Catalog や Scaffolder との関係を明確にしないと、Backstage の既存概念を別名で重複実装するリスクがあります。

## 技術設計上の課題

### 1. Project / Environment / Template の責務は文書化されているが、承認済み判断として固定されていない

事実:

- `docs/idp-management-model.md` には具体的な責務分担が書かれていますが、未決事項も残っています。
- このレビュー作成前には ADR が存在していませんでした。

評価:

この判断は plugin boundary、database schema、Catalog processor、Scaffolder integration、移行戦略に影響するため、ADR として扱うべき重要度があります。

### 2. IDP frontend が backend architecture より先行している

事実:

- frontend plugin には domain type と local execution behavior があります。
- 今回確認したリポジトリ状態には IDP backend plugin が存在していません。

評価:

プロトタイプとしては問題ありませんが、この状態をそのまま 製品アーキテクチャ にしてはいけません。永続化を追加する前に、TemplateExecution、DeploymentRun、OperationLog、idempotency key、external execution reference などの runtime record を所有する IDP backend plugin の境界を設計する必要があります。

### 3. Catalog entity PoC の文書とリポジトリ内容に不整合がある

事実:

- 管理モデル文書では `examples/idp-projects/location.yaml` と `examples/idp-projects/payment-platform.yaml` が説明されています。
- 今回確認したリポジトリ状態にはそれらのファイルが存在していませんでした。
- `app-config.yaml` にも、文書で説明されている `examples/idp-projects/location.yaml` の catalog location は含まれていませんでした。

評価:

これは製品レビュー上の不確実性です。PoC が計画済みだが未 commit なのか、文書がコードより先行しているのかを整理する必要があります。将来レビューでは、これはアーキテクチャ欠陥ではなく ドキュメントと実装の整合性リスク として扱うべきです。

### 4. 権限設計は デモ段階 である

事実:

- permission は有効化されていますが、バックエンドは allow-all permission policy を登録しています。
- local auth は guest provider を利用しています。

評価:

ローカル開発 としては妥当ですが、製品としては Project ownership、Environment operation、Template execution authorization を Backstage permission framework と Catalog ownership relation にどう対応させるか決める必要があります。

## UX 上の課題

### 1. サイドバーと root page の優先順位が、主要導線を曖昧にする可能性がある

事実:

- `app-config.yaml` は Catalog index page を root page として設定しています。
- IDP plugin は `/idp/*` 配下で利用できます。
- custom sidebar は Catalog と Scaffolder を明示的に優先表示し、その後に discovered nav items を表示しています。

評価:

Bara の 製品としての約束 が IDP workspace であるなら、最初の画面は 素の Catalog ではなく IDP dashboard であるべきかもしれません。一方で、製品としての約束 が「Backstage + Bara operating model」であれば Catalog を root に残す判断も成立します。これは生成 app の初期設定を引きずるのではなく、明示的な製品判断として決めるべきです。

### 2. Project 作成導線が暗黙的で、解決されていない

事実:

- UI には template execution と project detail 画面があります。
- durable な Project 作成フロー は今回確認した実装には存在していません。

評価:

利用者は「先に Project を作るのか、それとも Template から service を作ると Project ができるのか」を知る必要があります。どちらも成立しますが、製品として一貫した選択が必要です。

- Project-first: Project を作成または選択し、その下に Environment や service を作る。
- Template-first: template 実行により Project や Catalog entry が作成または更新される。

### 3. Environment 管理 には ライフサイクルモデル が必要である

事実:

- frontend type model には Environment type と status field が存在します。
- Environment detail UI は deployment/app/infra/alert status を表示できます。

評価:

Environment は vanilla Backstage との差別化要素になり得ます。ただし、そのためには request、provision、external infrastructure への link、observe、deploy、decommission という lifecycle が明確である必要があります。lifecycle が曖昧なままだと、Environment は単なる Resource card に留まります。

## Backstage 互換性リスク

### 現時点のリスクは低い

- `packages/app` と `packages/backend` は business logic container ではなく composition layer として見えます。
- IDP UI は plugin に分離されています。
- navigation module は discovered nav items を消費しているため、将来追加する frontend plugin も手動 sidebar rewrite なしに表示されやすい構造です。

### 将来の中程度リスク

- Project / Environment が インメモリまたは独自 DB だけの概念になると、Catalog の ownership / search / relation semantics から乖離する可能性があります。
- Template が Scaffolder の curated layer ではなく独自 execution mechanism になると、Backstage Scaffolder を拡張するのではなく重複実装するリスクがあります。
- global UI customization が app shell の関心事を超えて広がると、将来追加する OSS plugin page に個別 CSS 修正が必要になる可能性があります。

### 将来の高リスク

- business router、database access、external API client を `packages/backend/src/index.ts` に直接追加すると、既存の extension policy に反し、Backstage upgrade が難しくなります。
- Backstage Catalog や Scaffolder の内部実装をコピーして改造すると hard fork 化しやすくなります。configuration、extension point、backend module、upstream contribution を優先すべきです。

## 優先度付き改善案

### Priority 1

1. **Project / Environment / Template / runtime record の source of truth ADR を合意する。**  
   既存の management-model 文書を土台にしつつ、今後の実装がこの判断を 意図せず覆さないよう ADR として固定します。

2. **MVP のユーザー導線を 1 文で定義する。**  
   推奨 MVP は「開発者が Project を作成または選択し、承認済み Template を Environment に対して実行し、Catalog linkage と execution status を確認できる」です。これにより Catalog / Scaffolder を再利用しつつ、汎用 Backstage とは異なる製品価値を明確にできます。

3. **root experience を意図的に選ぶ。**  
   `/` を Catalog のままにするか、IDP dashboard にするかを決めます。Catalog を root に残す場合でも、IDP dashboard では Catalog / Scaffolder との関係を説明すべきです。

4. **docs と example Catalog data の整合性を取る。**  
   文書化済みの `examples/idp-projects/` PoC file と config registration を追加するか、`docs/idp-management-model.md` 側で PoC を「実装済み」ではなく「提案」として明示します。

### Priority 2

1. **永続化前に IDP backend plugin を設計する。**  
   backend plugin は TemplateExecution、DeploymentRun、OperationLog、external execution reference、retry、audit record などの runtime state を所有します。`packages/backend` からは、plugin として存在した後に登録するだけにします。

2. **Template を Scaffolder 上の curated product layer として定義する。**  
   可能な限り Backstage Scaffolder を execution engine として使います。IDP Template は availability、audience、display order、governance、environment compatibility、recommended parameters などの product metadata を追加する層とします。

3. **Environment lifecycle と state ownership を定義する。**  
   どの field が Git/Catalog で宣言され、どれが infrastructure から観測され、どれが IDP DB に cache されるのかを決めます。

4. **汎用的な product label を置き換える。**  
   product positioning が承認された段階で app title、organization name、MCP description を更新します。

### Priority 3

1. **review cadence と review index を整備する。**  
   `docs/reviews/README.md` を future product review の入口として維持し、各 review と ADR / follow-up decision を明示的にリンクします。

2. **MVP 定義後に product metrics を導入する。**  
   候補指標は time to first service、template success rate、failed environment provisioning rate、stale project count、owner coverage、production environment health coverage です。

3. **OSS plugin onboarding QA を文書化する。**  
   new frontend-system support、route/nav behavior、permission integration、theme compatibility、backend module boundary、production config impact を確認する checklist を用意します。

## 次回実装候補

以下は タスクバックログ ではなく、今後の製品判断を支えるための候補テーマです。

1. **Catalog-backed Project / Environment PoC alignment**

   - management-model 文書と repository examples の不整合を解消します。
   - Project を System、Environment を Resource として示すのか、custom kind を選ぶのかを明確にします。

2. **IDP backend plugin design spike**

   - template execution、操作ログ、deployment run の API boundary を定義します。
   - DB schema は runtime record のみを authoritative source として扱います。

3. **MVP journey prototype**

   - Template run UI を Scaffolder または backend plugin abstraction に接続します。
   - 1 つの flow で Catalog reference と execution status を表示します。

4. **Permission model proposal**

   - Project owner、Environment type、Template allowed roles を Backstage permission decision にどう対応させるか整理します。

## ADR 候補

1. **今回追加: Project、Environment、Template、runtime record の source of truth。**  
   `docs/adr/0001-idp-management-source-of-truth.md` として作成し、status は review 用に `Proposed` としています。

2. **将来 ADR: IDP dashboard と Catalog のどちらを product root にするか。**  
   primary product mental model と onboarding path を変える判断なので ADR 化が必要です。

3. **将来 ADR: Template execution ownership。**  
   IDP Template が常に Backstage Scaffolder に委譲するのか、どの条件で custom execution を許すのか、execution status をどう記録するのかを決めます。

4. **将来 ADR: Environment entity representation。**  
   Environment を Backstage `Resource` のままにするのか、custom Catalog kind にするのか、hybrid model にするのかを決めます。
