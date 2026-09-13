export const SOURCE_IDS = [
  "rethink",
  "give",
  "potential",
  "originals",
  "research",
  "crisis",
] as const;

export type SourceId = (typeof SOURCE_IDS)[number];

export type Source = {
  label: string;
  detail: string;
  url: string;
};

export const SOURCES: Record<SourceId, Source> = {
  rethink: {
    label: "Think Again",
    detail: "知的な謙虚さ、好奇心、思い込みの再考",
    url: "https://adamgrant.net/book/think-again/",
  },
  give: {
    label: "Give and Take",
    detail: "貢献と自己防衛を両立する、持続可能なギブ",
    url: "https://adamgrant.net/book/give-and-take/",
  },
  potential: {
    label: "Hidden Potential",
    detail: "到達点ではなく、学び方と進んだ距離を見る",
    url: "https://adamgrant.net/book/hidden-potential/",
  },
  originals: {
    label: "Originals",
    detail: "恐れや疑いを抱えながら、新しい案を試す",
    url: "https://adamgrant.net/book/originals/",
  },
  research: {
    label: "Wharton research",
    detail: "動機、意味、創造性、他者への貢献に関する研究",
    url: "https://mgmt.wharton.upenn.edu/profile/grantad/",
  },
  crisis: {
    label: "厚生労働省・相談先一覧",
    detail: "電話・SNSなど、こころの悩みの公的な相談窓口",
    url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/jisatsu/soudan_info.html",
  },
};

export const GRANT_CONTEXT = `
以下は回答の根拠として利用できる、公開一次情報を要約した資料です。引用文ではありません。資料にない主張をAdam Grant氏の見解として断定しないでください。

[rethink / Think Again]
出典: https://adamgrant.net/book/think-again/
考え直す力、学び直す力を重視する。自分の意見をアイデンティティと同一視せず、信念を仮説として扱い、知的な謙虚さと好奇心を持って反証や別の見方を探す。考えや感情を、必ず信じたり自分の一部として抱え込んだりする必要はない。

[give / Give and Take]
出典: https://adamgrant.net/book/give-and-take/
人との関わり方には、受け取る人、均衡を取る人、与える人という視点がある。与える人の一部は搾取や燃え尽きに直面する一方、持続可能な形で他者へ貢献する人もいる。支援したい気持ちと、自分を守る境界線を両立させる。

[potential / Hidden Potential]
出典: https://adamgrant.net/book/hidden-potential/
生まれつきの才能や現在地だけでなく、どれだけ進んだか、学び方をどれだけ改善できるかを見る。進歩は単なる努力量より学び方に左右され、機会が来ないときには自ら入口を作る余地がある。小さな実験を、自己価値の判定ではなく情報収集として扱う。

[originals / Originals]
出典: https://adamgrant.net/book/originals/
新しいアイデアを支持し、集団思考に抗うための視点。良い案の見極め、声の上げ方、協力者の作り方、行動の時機、恐れや疑いとの付き合い方を扱う。不安があることと、新しいことに向いていないことは同義ではない。

[research / Wharton profile and publications]
出典: https://mgmt.wharton.upenn.edu/profile/grantad/
Adam Grant氏は組織心理学者で、仕事の動機と意味、寛大さ、創造性、向社会的な行動などを研究している。個別の論文を示せない主張は、研究結果として細かく断定しない。

[user-provided primary channels]
Google Scholar: https://scholar.google.com/citations?user=YkSKaRMAAAAJ&hl=en
X: https://x.com/AdamMGrant
YouTube: https://www.youtube.com/channel/UCYaXXVrHBKwriEJ3x7la8_A
Spotifyの公開番組ページは追加資料候補だが、書き起こし本文はこのコンテキストに含まれていない。URLだけを根拠に発言内容を推測しない。
`.trim();

export function isSourceId(value: unknown): value is SourceId {
  return typeof value === "string" && SOURCE_IDS.includes(value as SourceId);
}
