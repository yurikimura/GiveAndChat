# Give & Chat

Adam Grant氏の公開された研究・著作を手がかりに、気持ちを整理するための日本語対話ガイドです。外部AIや生成AI APIを使わず、ブラウザ内の会話ステートマシンで動作します。

## このMVPでできること

- 会話の段階を保持し、同じ問いへ戻らず次の段階へ進行
- 表記ゆれや同義表現を候補語スコアで照合し、番号以外の回答も選択肢として認識
- 会話で得た事実・解釈・目的・選択を、ブラウザ内のメモリとして保持
- 各回答から、根拠となる公式ページ・研究プロフィールへ移動
- 自傷・自殺を示す表現を検知した場合に、緊急連絡先と厚生労働省の相談先を案内
- 同じ段階で「分からない」が続いた場合は質問を止め、回答を迫らない

## 位置づけ

本サービスはAdam Grant氏本人または所属組織とは関係ありません。氏の人物像を再現するものでも、診断・治療・緊急支援を提供するものでもありません。

## 開発

```bash
npm install
npm run dev
```

## 主な資料

- [Adam Grant公式サイト](https://adamgrant.net/)
- [Wharton公式プロフィール](https://mgmt.wharton.upenn.edu/profile/grantad/)
- [Google Scholar](https://scholar.google.com/citations?user=YkSKaRMAAAAJ&hl=en)
- [TED — ReThinking with Adam Grant](https://www.ted.com/podcasts/rethinking-with-adam-grant)
- [厚生労働省 — 相談先一覧](https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/jisatsu/soudan_info.html)
