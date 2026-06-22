# Subagent Outputs

Codex custom agents の最終成果物を agent ごとに保存します。

```text
docs/ai/output/<agent-name>/NNN-<descriptive-kebab-case-name>.md
```

- `<agent-name>` は `.codex/agents/*.toml` の `name` を使います。
- `NNN` は agent ごとの 3 桁連番です。既存の最大番号に 1 を加え、上書きしません。
- 一時ログではなく、意思決定・実装・品質レビュー・プロダクトレビューに必要な完成版だけを保存します。
- read-only agent の成果物は、agent の返答を受け取った親エージェントが保存します。
- 成果物の見出し、本文、メタデータは日本語で記述します。コード、コマンド、ファイルパス、API 名などの固有表記は原文のままで構いません。
