# Give & Chat

Adam Grant氏の公開された研究・著作を手がかりに、気持ちを整理するための日本語対話ガイドです。明示的な会話ステートマシンとOpenAI Responses APIを組み合わせています。

## このMVPでできること

- 会話の段階を保持し、同じ問いへ戻らず次の段階へ進行
- 直近の会話履歴と、出典付きのAdam Grant資料要約をOpenAI APIへ渡して回答を生成
- 各回答から、根拠となる公式ページ・研究プロフィールへ移動
- 自傷・自殺を示す表現を検知した場合に、緊急連絡先と厚生労働省の相談先を案内
- APIが利用できない場合は、ステートマシンによる応答へ自動的に切り替え

## 位置づけ

本サービスはAdam Grant氏本人または所属組織とは関係ありません。氏の人物像を再現するものでも、診断・治療・緊急支援を提供するものでもありません。

## 開発

```bash
npm install
cp .env.example .env.local
# .env.local にサーバー側の OPENAI_API_KEY を設定
npm run dev
```

`OPENAI_MODEL`は既定で`gpt-5.6-terra`です。会話は直近16メッセージだけを回答生成時に送信し、Responses APIには`store: false`を指定しています。APIキーを`NEXT_PUBLIC_`で始まる変数に入れないでください。

## 主な資料

- [Adam Grant公式サイト](https://adamgrant.net/)
- [Wharton公式プロフィール](https://mgmt.wharton.upenn.edu/profile/grantad/)
- [Google Scholar](https://scholar.google.com/citations?user=YkSKaRMAAAAJ&hl=en)
- [TED — ReThinking with Adam Grant](https://www.ted.com/podcasts/rethinking-with-adam-grant)
- [厚生労働省 — 相談先一覧](https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/jisatsu/soudan_info.html)
