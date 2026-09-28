# AGENTS.md

## プロジェクト概要

- AtCoder の問題難易度、アルゴリズム分類、ユーザーのレート・提出状況を可視化する React の SPA。
- 主な技術は React 19、Vite 8、JavaScript/JSX、D3 Shape、Papa Parse。
- 本番配信は Netlify を前提とし、AtCoder のユーザー情報取得には Netlify Function を使用する。
- UI の主要言語は日本語。明示的な依頼がない限り、既存の日本語文言と用語を維持する。

## 重要なディレクトリとファイル

- `src/App.jsx`: CSV 読み込み、ユーザー情報、提出履歴、自動最適化などのアプリケーション状態を管理する。
- `src/components/`: UI コンポーネント。可視化本体は `PieBeeswarm/`、難易度表示は `DiffCircle/` に置かれている。
- `src/utils/`: MDS、beeswarm、統計、難易度帯、最適化などの計算ロジック。可能な限り副作用のない関数として保つ。
- `src/api/`: ブラウザ側の外部 API 呼び出し。
- `public/all_problems.csv`: 実行時に読み込む主要データ。`tag`、`problem_id`、`title`、`difficulty`、`diff_band`、`url` の列を前提とする。
- `netlify/functions/atcoder-proxy.js`: 本番環境の AtCoder API プロキシ。
- `vite.config.js`: 開発環境の `/api/atcoder` プロキシ設定。
- `style.css`: アプリ全体のスタイル。
- `docs/CONTRIBUTING.md`: Issue、ブランチ、コミット、Pull Request の運用ルール。

## セットアップとコマンド

- 依存関係の再現には `npm ci` を使用する。
- 開発サーバー: `npm run dev`
- lint: `npm run lint`
- フォーマット確認: `npm run format:check`
- 本番ビルド: `npm run build`
- ビルド確認: `npm run preview`
- Windows PowerShell で実行ポリシーにより `npm.ps1` が拒否される場合は、同じコマンドを `npm.cmd` で実行する。
- 現時点では自動テスト用の npm script はない。存在しないテストコマンドを完了条件として扱わない。

## 実装方針

- 既存の JavaScript/JSX 構成を維持し、依頼なしに TypeScript や別フレームワークへ移行しない。
- React は関数コンポーネントと Hooks を使用し、派生値は必要に応じて `useMemo`、イベント関数は必要に応じて `useCallback` を使う。
- コンポーネントは UI と操作を担当し、再利用できる計算処理は `src/utils/` に分離する。
- 可読性と単一責務を優先し、既存ロジックの重複実装や不要な抽象化を避ける。
- 非同期処理では loading、error、空データ、古いリクエストや計算結果の反映に注意する。
- ユーザー名など URL に入る入力値は必ず安全にエンコードする。
- AtCoder API の経路を変更する場合は、Vite の開発用プロキシ、Netlify の redirect、Netlify Function、本番 URL の整合性を確認する。
- 可視化ロジックを変更する場合は、配置だけでなく選択状態、ラベル、レート線、進捗リング、レスポンシブ表示への影響も確認する。
- `public/all_problems.csv` の列名や難易度の意味を変える場合は、読み込み・集計・表示の全経路を同時に確認する。
- アクセシビリティを後退させない。操作要素には適切な要素、`type`、ラベル、必要な `aria-*` を使用する。

## コードスタイル

- Prettier 設定に従い、2 スペース、ダブルクォート、セミコロン、末尾カンマ、1 行 100 文字を基準とする。
- コンポーネントは原則 default export、共有ユーティリティや定数は named export という既存傾向に合わせる。
- 命名は役割が分かる英語を使い、コメントは処理の説明ではなく理由や制約を補足するときに限る。
- デバッグ用ログ、無効化コード、不要なコメントを残さない。
- `npm run format` はリポジトリ全体を書き換えるため、必要な場合のみ実行し、実行後に差分を確認する。

## 変更時の確認

1. 変更箇所に応じて `npm run lint` と `npm run format:check` を実行する。
2. アプリや設定を変更した場合は `npm run build` を実行する。
3. UI・可視化・API連携を変更した場合は開発サーバーで対象フローを手動確認する。
4. 自動テストがないため、手動確認した内容と未確認事項を最終報告または Pull Request に明記する。
5. コマンドが環境や既存状態により失敗した場合、無関係な修正で隠さず、実行したコマンドと原因を報告する。

## リポジトリ運用と安全

- Issue、ブランチ、コミット、Pull Request を扱う場合は `docs/CONTRIBUTING.md` に従う。
- コミットメッセージと PR タイトルは Conventional Commits 形式を使用する。
- ユーザーから明示的に依頼されない限り、Issue、ブランチ、コミット、PRを勝手に作成しない。
- 新しい本番依存関係の追加、公開 API や CSV スキーマの変更、大規模な設計変更は、必要性と影響を説明してから行う。
- `.env`、API キー、トークン、ユーザー固有情報などの秘密情報を追加・記録しない。
- `node_modules/`、`dist/`、`.cache/` などの依存物・生成物を手作業で編集またはコミットしない。
- 作業範囲外の変更や未追跡ファイルを保持し、上書き・削除・一括整形しない。
