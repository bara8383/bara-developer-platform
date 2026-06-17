# 製品レビュー

このディレクトリは、Bara Developer Platform の製品・アーキテクチャレビューを継続的に蓄積する場所です。

## レビュー目的

このレビューは、Backstage ベースの Internal Developer Platform としてリポジトリを成長させるための判断材料です。通常のコードレビューや実装タスク一覧ではありません。

各レビューでは、次を守ります。

- まず過去レビューと ADR を確認する。
- リポジトリから確認できた事実と、解釈・提案を分離する。
- 過去の提案を新しい指摘として繰り返さない。
- Backstage OSS plugin との互換性と、将来の Backstage upgrade 追従性を重視する。
- IDP 固有の製品振る舞いは `plugins/` 配下に寄せ、`packages/app` / `packages/backend` は薄い合成・配線層として保つ。

## 最新レビュー

- [2026-06-16 AI-native developer control plane 再レビュー v2](./2026-06-16-product-review-v2-ai-native-control-plane.md)

## 過去レビュー一覧

| 日付       | Version | レビュー                                                                                                  | 関連 ADR                                                                      |
| ---------- | ------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 2026-06-16 | v2      | [AI-native developer control plane 再レビュー](./2026-06-16-product-review-v2-ai-native-control-plane.md) | [ADR 0001](../adr/0001-idp-management-source-of-truth.md)、ADR 0002-0004 候補 |
| 2026-06-16 | v1      | [製品レビューと改善提案](./2026-06-16-product-review-v1.md)                                               | [ADR 0001](../adr/0001-idp-management-source-of-truth.md)                     |

## 命名規則

レビューファイルは次の形式で作成します。

```text
YYYY-MM-DD-product-review-vX.md
```

既存レビューがある場合は、最新レビュー version から `vX` を連番で採番します。
