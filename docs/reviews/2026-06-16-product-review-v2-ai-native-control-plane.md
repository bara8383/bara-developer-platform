# AI-native developer control plane 再レビュー v2

- 日付: 2026-06-16
- 対象: Bara Developer Platform を「Backstage を土台にした AI-native developer control plane」として再定義した場合の既存 review / ADR 再レビュー
- レビュー種別: 既存の製品レビュー / ADR に対する方針差分レビュー、設計文書ギャップ分析、実装候補提案

## 前提: 今回採用する製品方針

Bara Developer Platform は「Backstage の見た目を変えた IDP」ではなく、**Backstage を土台にした AI-native developer control plane** として扱う。

この方針では、Backstage は Catalog、Scaffolder、Permission、Search、TechDocs、plugin ecosystem を提供する土台であり、Bara の差別化は次に置く。

1. 開発・運用対象を Project / Environment / Template / Run / Policy / Signal として統合的に制御する。
2. 人間向け UI だけでなく、AI agent が安全に参照・計画・実行できる machine-readable control surface を提供する。
3. Catalog や Scaffolder の上に、intent、policy、approval、execution、audit、feedback loop を重ねる。
4. AI の提案や自動実行を、Backstage permission、Catalog ownership、Git review、runtime audit に接続して制御する。

## 既存 review / ADR の再レビュー

### v1 review で維持すべき判断

v1 review の次の判断は、AI-native control plane 方針でも有効である。

- Backstage 本体を hard fork せず、plugin / module / extension / configuration として拡張する。
- `packages/app` と `packages/backend` は薄い合成・配線層に保ち、IDP 固有ロジックは `plugins/` 配下に閉じる。
- Project / Environment / Template / runtime record の責務を分ける。
- Template は Scaffolder と競合する独自実行基盤ではなく、原則として Scaffolder の上の curated product layer として扱う。
- Environment は、単なる Resource card ではなく lifecycle と observed state を持つ差別化要素として設計する。

### v1 review から変更すべき観点

v1 review は「Backstage 上の self-service / operations workspace」としては妥当だが、AI-native control plane としては評価軸が不足している。

| v1 の主な評価軸                        | AI-native control plane で追加すべき評価軸                                       |
| -------------------------------------- | -------------------------------------------------------------------------------- |
| 人間が使う IDP workspace               | 人間と AI agent が共有する control surface                                       |
| Project / Environment / Template の UI | intent、plan、action、run、audit の閉ループ                                      |
| Catalog / Scaffolder との責務分離      | Catalog / Scaffolder / Permission を AI 実行制御に接続する設計                   |
| MVP journey                            | AI-assisted journey と human approval boundary                                   |
| backend plugin の永続化境界            | AI action gateway、policy evaluation、audit trail の境界                         |
| product metrics                        | AI suggestion acceptance、safe automation rate、rollback rate、policy block rate |

### ADR 0001 で維持すべき判断

ADR 0001 の source-of-truth モデルは、AI-native 方針でも中核になる。特に次の点は強い。

- desired state は Git YAML / Catalog を通じてレビュー可能にする。
- runtime state、execution history、operation log は IDP DB が authoritative に扱う。
- `packages/backend` を business logic の所有者にしない。
- Catalog や Scaffolder の fork / copy を避ける。

AI-native control plane では、この source-of-truth モデルに AI 固有の record を追加する必要がある。

| 概念                    | Source of truth 候補                       | 備考                                                                             |
| ----------------------- | ------------------------------------------ | -------------------------------------------------------------------------------- |
| Intent                  | IDP DB、必要に応じて Git PR / issue に昇格 | ユーザーや AI が表明した目的。まだ実行 plan ではない。                           |
| Plan                    | IDP DB                                     | AI が作成した手順案。承認、差分、リスク、参照根拠を保持する。                    |
| Action                  | IDP backend plugin                         | Scaffolder task、Git PR、catalog write、external API call などへの安全な抽象化。 |
| Approval                | IDP DB + Permission decision snapshot      | 誰が、どの plan / action を、どの条件で許可したかを残す。                        |
| AI observation / Signal | IDP DB cache + source link                 | alert、deployment、catalog drift、docs freshness などの観測事実。                |
| AI recommendation       | IDP DB                                     | 提案内容、根拠、confidence、採否、後続結果を追跡する。                           |

## 不足している設計文書

### 1. Product charter: AI-native developer control plane

目的:

- Bara が「Backstage の re-skin」ではないことを明文化する。
- 人間向け画面、AI agent 向け API、Backstage plugin ecosystem の関係を定義する。
- MVP の価値を「self-service portal」ではなく「安全に自動化できる developer control plane」として固定する。

最低限含めるべき内容:

- target users: application developer、platform engineer、engineering lead、AI agent / automation client。
- control plane objects: Project、Environment、Template、Intent、Plan、Action、Run、Signal、Policy。
- non-goals: Backstage fork、汎用 chatbot、Scaffolder 再実装、無制限の自律実行。
- product promise: AI が提案・実行しても、ownership、policy、audit、rollback path が残る。

候補ファイル:

- `docs/product/ai-native-control-plane-charter.md`

### 2. AI action and approval model

目的:

- AI が何を読めるか、何を提案できるか、何を実行できるかを分ける。
- read-only recommendation、dry-run plan、approval-required execution、break-glass operation の境界を明確にする。
- Backstage Permission framework と Catalog ownership relation を AI action に接続する。

最低限含めるべき内容:

- action taxonomy: read、recommend、plan、propose change、execute scaffolder task、open PR、modify environment、trigger deployment。
- approval taxonomy: no approval、owner approval、platform approval、change-window approval、two-person approval。
- permission context: actor が human か AI agent か、on-behalf-of user は誰か、対象 Project / Environment の criticality は何か。
- immutable audit fields: actor、subject、tool/action、input digest、plan digest、permission decision、approval record、external execution ID、result。

候補ファイル:

- `docs/architecture/ai-action-approval-model.md`
- 将来 ADR: `docs/adr/0002-ai-action-approval-boundary.md`

### 3. Agent-facing API / MCP design

目的:

- AI agent が Bara を安全に操作するための machine-readable API surface を定義する。
- UI に閉じた機能ではなく、agent が Catalog context、Template candidates、Environment status、allowed actions を取得できるようにする。
- MCP actions など既存 Backstage backend feature と、Bara 固有 IDP backend plugin の境界を決める。

最低限含めるべき内容:

- agent API resources: projects、environments、templates、runs、signals、policies、recommendations。
- tool contract: idempotency key、dry-run、diff preview、risk summary、approval requirement、timeout、cancellation。
- context contract: entity refs、ownership、links、docs references、recent operations、observed signals。
- safety: prompt injection handling、untrusted catalog metadata、secret redaction、tool output size limits。

候補ファイル:

- `docs/architecture/agent-facing-api-and-mcp.md`
- 将来 ADR: `docs/adr/0003-agent-facing-api-surface.md`

### 4. Intent / Plan / Run lifecycle model

目的:

- 「ユーザーがやりたいこと」から「AI が提案した plan」、「承認された action」、「実行された run」、「監査と学習」までの状態遷移を定義する。
- TemplateExecution / DeploymentRun / OperationLog を AI-native control loop の一部として再配置する。

最低限含めるべき内容:

- state machine: intent created、context gathered、plan proposed、risk assessed、approval requested、approved、executing、succeeded、failed、rolled back、learned。
- record ownership: Git / Catalog / IDP DB / external system のどこが authoritative か。
- retry / rollback / cancellation semantics。
- plan drift: plan 作成後に Catalog や environment state が変わった場合の invalidation rule。

候補ファイル:

- `docs/architecture/intent-plan-run-lifecycle.md`
- 将来 ADR: `docs/adr/0004-intent-plan-run-source-of-truth.md`

### 5. AI observability and feedback loop design

目的:

- AI が操作した結果を計測し、安全性と有効性を改善する指標を定義する。
- 単なる product analytics ではなく、control plane の安全性メトリクスとして扱う。

最低限含めるべき内容:

- metrics: recommendation acceptance rate、manual edit after AI plan、policy block rate、approval latency、rollback rate、failed run cause、stale signal age。
- audit queries: 「この environment に対する AI 起点変更を一覧する」、「この template の失敗率を見る」、「policy block の理由を集計する」。
- retention: plan、prompt-derived context、tool output、approval、external execution ID の保存期間。
- privacy / secrets: prompt、catalog annotation、tool output に含まれる機密情報の扱い。

候補ファイル:

- `docs/architecture/ai-observability-feedback-loop.md`

### 6. AI-native UX principles

目的:

- Bara の UI を「AI が横にいる Backstage」ではなく、control plane の human-in-the-loop UX として整理する。
- AI の提案根拠、差分、リスク、承認要求を UI の基本要素にする。

最低限含めるべき内容:

- every recommendation must show evidence, target, risk, required approval, rollback path。
- AI が操作できない場合は、なぜできないかと必要な権限 / metadata を表示する。
- Project / Environment detail では、current state だけでなく next best actions を表示する。
- Template 実行画面では、parameter form だけでなく plan preview、policy result、expected catalog changes を表示する。

候補ファイル:

- `docs/product/ai-native-ux-principles.md`

## 実装候補

### Priority 1: 方針を固定する軽量ドキュメント実装

1. `docs/product/ai-native-control-plane-charter.md` を追加する。 **Done: 2026-06-17**
2. `docs/architecture/ai-action-approval-model.md` を追加する。 **Done: 2026-06-17**
3. `docs/architecture/intent-plan-run-lifecycle.md` を追加する。 **Done: 2026-06-17**
4. ADR 0002 として AI action approval boundary を提案する。 **Done: 2026-06-17**

完了条件:

- Backstage extension policy と矛盾しない。
- AI 固有概念が `packages/app` / `packages/backend` ではなく将来の plugin / module に閉じる方針になっている。
- MVP の人間導線と agent 導線が同じ control plane object を共有している。

Follow-up documents:

- `docs/product/ai-native-control-plane-charter.md`
- `docs/architecture/ai-action-approval-model.md`
- `docs/architecture/intent-plan-run-lifecycle.md`
- `docs/adr/0002-ai-action-approval-boundary.md`

### Priority 2: IDP backend plugin の最小 control-plane API

候補実装:

- `plugins/idp-backend` を追加し、runtime record の最小 API を提供する。
- 初期 endpoint は read-heavy にし、`Intent`、`Plan`、`ActionRun`、`OperationLog` を扱う。
- write action は dry-run / mock execution から開始し、Scaffolder task や Git PR 作成への接続は後続にする。
- DB migration は runtime / audit record のみを扱い、Project / Environment desired state は ADR 0001 の通り Catalog / Git に寄せる。

初期 API 候補:

- `GET /projects/:ref/control-context`
- `POST /intents`
- `POST /intents/:id/plans`
- `POST /plans/:id/approvals`
- `POST /plans/:id/actions:dry-run`
- `POST /plans/:id/actions:execute`
- `GET /runs/:id`
- `GET /operation-log?entityRef=...`

### Priority 3: frontend plugin の AI-native 化

候補実装:

- Project detail に `Recommended next actions` card を追加する。
- Environment detail に `Signals`、`Drift`、`Risk`、`Suggested actions` を追加する。
- Template detail / execution に `Plan preview`、`Policy checks`、`Expected Catalog changes` を追加する。
- Operation log を AI action / human action の区別、approval、external execution ID を表示できる形にする。

注意:

- AI-native UI を `packages/app` に直接実装しない。
- `plugins/idp` の中でも、API client と presentation を分け、将来 `plugins/idp-backend` に接続しやすくする。

### Priority 4: Backstage integration hardening

候補実装:

- Catalog entity annotation で AI action eligibility、environment criticality、template governance metadata を表現する案を検証する。
- Permission policy を allow-all から、Project owner / Environment criticality / Template allowed roles を評価する proposal に進める。
- Scaffolder template を AI plan の execution backend として使う integration spike を行う。
- MCP actions は直接万能操作にせず、IDP backend plugin の action gateway を経由させる。

## MVP 再定義案

AI-native control plane としての MVP は、次の 1 文に固定することを提案する。

> 開発者が Project / Environment の context を選ぶと、Bara が Catalog、Template、runtime signal をもとに安全な next action plan を提示し、必要な承認を得たうえで Scaffolder または Git PR に接続し、実行結果と audit trail を Project に戻す。

この MVP では、初期から完全自律実行を目指さない。重要なのは、AI が「提案する」だけでも、plan、approval、run、audit の control-plane record が残ることである。

## ADR 候補の更新

1. **ADR 0002: AI action approval boundary**

   - AI が read / recommend / plan / execute のどこまでできるかを定義する。
   - human approval と permission decision の snapshot を必須 record にする。

2. **ADR 0003: Agent-facing API surface**

   - Bara の agent API / MCP surface を UI の副産物ではなく正式な product interface として扱う。
   - tool は dry-run、idempotency、risk summary、approval requirement を必須にする。

3. **ADR 0004: Intent / Plan / Run source of truth**
   - Intent / Plan / ActionRun / AI Recommendation / Signal の保存先と lifecycle を定義する。
   - ADR 0001 の Project / Environment / Template / runtime record モデルを拡張する。

## 次のレビューで確認すべきこと

- Product charter が追加され、既存 docs と矛盾していないか。
- AI action / approval の設計が Backstage Permission framework と Catalog ownership に接続されているか。
- IDP backend plugin の候補が `packages/backend` の肥大化を避けているか。
- frontend の AI-native 改修が「チャット欄の追加」ではなく Project / Environment / Template の control-plane UX になっているか。
