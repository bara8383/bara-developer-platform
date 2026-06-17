# Intent / Plan / Run lifecycle

- Status: Draft
- Date: 2026-06-17
- Related review: `docs/reviews/2026-06-16-product-review-v2-ai-native-control-plane.md`

## 概要

Intent / Plan / Run lifecycle は、AI と人間が同じ control-plane object を使って安全に変更するための最小 lifecycle である。

```text
Intent -> Plan -> Approval -> Dry-run -> Execute -> Observe -> OperationLog
```

初期実装では、Plan と Dry-run を重視し、Execute は Scaffolder task または Git PR への接続を優先する。

## Lifecycle stages

### 1. Intent

Intent は「何を達成したいか」を表す。作成者は人間でも agent でもよい。

必須情報の候補:

- `intentId`
- `createdBy`
- `entityRef` または `projectRef`
- `environmentRef`（必要な場合）
- `goal`
- `source`: ui / agent / api

### 2. Plan

Plan は Intent を実行可能な steps に変換したもの。実行前に人間が読める必要がある。

必須情報の候補:

- expected Catalog changes
- expected Git diff または Scaffolder task input
- policy result
- risk summary
- required approval level
- rollback / recovery note

### 3. Approval

Approval は Plan の特定 version に対して与える。Plan が変わった場合は承認を再取得する。

Approval は `docs/architecture/ai-action-approval-model.md` の action level と approval record に従う。

### 4. Dry-run

Dry-run は副作用なしで plan を検証する。失敗した場合は、Execute に進めない。

例:

- Scaffolder dry-run
- rendered manifest preview
- policy check
- required owner / environment compatibility check

### 5. Execute

Execute は副作用を持つ可能性がある。初期方針では、独自 executor ではなく次の接続先を優先する。

1. Backstage Scaffolder task
2. Git PR
3. 既存 CI/CD system の承認済み API

### 6. Observe

実行後は external execution ID、status、link、結果 summary を ActionRun に戻す。

### 7. OperationLog

OperationLog は append-only とし、Intent / Plan / Approval / Dry-run / Execute / Observe の重要イベントを記録する。

## State ownership

| Data                                                | Owner                                             |
| --------------------------------------------------- | ------------------------------------------------- |
| Project / Environment desired state                 | Git YAML / Catalog                                |
| Template definition                                 | Git YAML / Scaffolder template                    |
| Intent / Plan / Approval / ActionRun / OperationLog | 将来の IDP backend plugin                         |
| External task status                                | Scaffolder、Git provider、CI/CD などの外部 system |

## Failure handling

- Plan generation failure: Intent に失敗理由を残し、外部副作用は発生させない。
- Policy deny: OperationLog に deny reason を残し、Execute へ進めない。
- Dry-run failure: Plan を修正して再承認する。
- Execute failure: external execution ID と failure summary を保存し、retry 可能性と rollback note を表示する。
