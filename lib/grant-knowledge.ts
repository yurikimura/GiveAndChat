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
