# Wasabi API 🍣
**Japanese Recipe API — Built with Next.js + Supabase**

## 背景・なぜ作ったか

冷蔵庫管理＋食品ロス削減のBtoCアプリを開発中、レシピ提案機能のために
既存APIを調査したところ空白市場を発見：

- Spoonacular等の海外API → 日本食が弱く英語のみ
- 楽天レシピAPI → 商用利用禁止
- クックパッド → 公開APIなし

**「日本食特化レシピAPI」が存在しないとわかり、先にAPIをBtoDevで
ビジネス化し、後で自分のアプリにも使う二段構え戦略に切り替えた。**

## 技術構成
- **Next.js** — APIルーティングとサーバーサイド処理
- **Supabase** — PostgreSQL + 将来のRLS・リアルタイム対応を見越して採用
- **データソース** — 農林水産省「うちの郷土料理」より約1,365件
  （スクレイパー: [wasabi-scraper](GitHubリンク)）template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
