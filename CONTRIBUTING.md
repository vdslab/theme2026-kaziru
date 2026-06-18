# Contributing Guide

このドキュメントは、本プロジェクトの開発ルールを定めるものである。

## ブランチ運用

### ブランチ構成

* `main`

  * 本番リリース用ブランチ
  * 直接コミット・直接マージは禁止

* `develop`

  * 開発用統合ブランチ
  * 直接コミット・直接マージは禁止

### ブランチ命名規則

作業ブランチは必ず対応する Issue を作成したうえで、`develop` から作成する。

| 種別       | 形式                        | 例                         |
| -------- | ------------------------- | ------------------------- |
| 機能追加     | `feat/<issue番号>-<概要>`     | `feat/12-user-login`      |
| バグ修正     | `fix/<issue番号>-<概要>`      | `fix/34-stamp-count`      |
| リファクタリング | `refactor/<issue番号>-<概要>` | `refactor/56-node-layout` |
| ドキュメント修正 | `docs/<issue番号>-<概要>`     | `docs/78-update-readme`   |
| テスト      | `test/<issue番号>-<概要>`     | `test/83-placement-score` |
| その他保守作業  | `chore/<issue番号>-<概要>`    | `chore/91-eslint-config`  |

### ブランチ作成手順

```bash
git switch develop
git pull
git switch -c feat/<issue番号>-<概要>
```

## 開発フロー

1. GitHub Issue を作成する
2. `develop` を最新化する
3. 作業ブランチを作成する
4. 実装・コミットする
5. Pull Request を作成する
6. レビューを受ける
7. `develop` にマージする
8. マージ済みブランチを削除する

## コミットメッセージ

本プロジェクトでは、Conventional Commits の考え方に基づいたコミットメッセージを使用する。

参考:
https://www.conventionalcommits.org/

### 形式

```text
<type>: <変更内容>
```

例:

```text
feat: 推奨学習帯の表示を追加
fix: ラベル位置のずれを修正
refactor: ノード描画処理を分離
docs: READMEを更新
test: 配置評価ロジックのテストを追加
chore: ESLint設定を追加
```

### 使用する type

| type       | 用途                      |
| ---------- | ----------------------- |
| `feat`     | 新機能追加                   |
| `fix`      | バグ修正                    |
| `refactor` | 振る舞いを変えないコード改善          |
| `docs`     | README、設計書、開発ルールなどの文書修正 |
| `test`     | テストの追加・修正               |
| `chore`    | 設定変更、依存関係更新、その他保守作業     |

### コミットの方針

* コミットは単一責務を意識する
* 変更内容が分かるメッセージを書く
* デバッグコードや不要なコメントを残さない
* コミットメッセージには Issue 番号を記載しない
* Issue との関連付けはブランチ名および Pull Request で管理する

## Pull Request

### PR タイトル

以下の形式を使用する。

```text
feat: 推奨学習帯を表示
fix: ラベル位置のずれを修正
docs: CONTRIBUTING.md を追加
```

### PR 説明

PR の説明欄には対応する Issue を記載する。

```text
Closes #12
```

Issue を自動でクローズするため、`Closes #<issue番号>` の形式を使用する。

原則、変更内容の概要を記載する。

例:

```md
Closes #12

## 概要

CONTRIBUTING.md を追加し、開発ルールを文書化した。

## 主な内容

- ブランチ運用
- Conventional Commits
- Pull Request 運用
- コーディング方針
```

### マージ条件

* レビューで Approve を得ていること
* コンフリクトが解消されていること

## コーディング方針

* 可読性を優先する
* 責務ごとにコンポーネントや関数を分割する
* 同じロジックを重複して実装しない
* 不要なコードやコメントを残さない
* 命名は意味が分かるものを使用する
