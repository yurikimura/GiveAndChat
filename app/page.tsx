"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Source = { label: string; detail: string; url: string };
type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
  source?: Source;
  urgent?: boolean;
};

const SOURCES = {
  rethink: {
    label: "Think Again",
    detail: "科学者のように考え、思い込みを問い直す",
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
    detail: "不安があっても、試しながら前へ進む",
    url: "https://adamgrant.net/book/originals/",
  },
  research: {
    label: "Wharton research",
    detail: "向社会的動機と、他者への影響が生む意味",
    url: "https://mgmt.wharton.upenn.edu/profile/grantad/",
  },
  crisis: {
    label: "厚生労働省・相談先一覧",
    detail: "電話・SNSなど、こころの悩みの公的な相談窓口",
    url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/jisatsu/soudan_info.html",
  },
} satisfies Record<string, Source>;

const prompts = ["仕事で燃え尽きそう", "失敗を引きずっている", "考えすぎて決められない", "人に与えすぎて疲れた"];
const initialMessage: Message = {
  id: 1,
  role: "assistant",
  text: "今日は、どんなことが心に引っかかっていますか？ 答えを急がず、まず一緒に状況をほどいていきましょう。",
};
const crisisPattern = /死にたい|自殺|消えたい|生きていたくない|終わりにしたい|自分を傷つけ|殺して|suicid|kill myself|hurt myself/i;

function replyFor(input: string): Omit<Message, "id"> {
  if (crisisPattern.test(input)) {
    return {
      role: "assistant", urgent: true, source: SOURCES.crisis,
      text: "いま、とても切迫した苦しさの中にいるのですね。ここで一人で抱え続けないでください。今すぐ自分を傷つける可能性がある場合は、119（救急）または110へ連絡し、安全な場所で信頼できる人にそばにいてもらってください。厚生労働省の相談先一覧では、電話やSNSの窓口を選べます。私は緊急支援の代わりにはなれませんが、連絡する相手や最初の一言を一緒に考えることはできます。いま、あなたの近くに連絡できる人はいますか？",
    };
  }
  if (/与え|助け|断れ|頼ま|疲れ|燃え尽|バーンアウト|giver|give/i.test(input)) {
    return {
      role: "assistant", source: SOURCES.give,
      text: "人を助けたい気持ちと、もう余力がない感覚が同時にあるのかもしれません。Grant氏の『Give and Take』では、与えること自体ではなく、燃え尽きずに続けられる形が重要だと考えます。いまのお願いを「私にしかできないこと」「誰かと分けられること」「今回は断ってよいこと」の3つに分けてみませんか。まず、ひとつだけ手放せるとしたら何でしょう？",
    };
  }
  if (/失敗|できない|才能|成長|自信|遅れ|向いて|劣っ|だめ|ダメ/i.test(input)) {
    return {
      role: "assistant", source: SOURCES.potential,
      text: "いまは、結果を自分の価値の判定のように感じているのかもしれません。『Hidden Potential』の視点では、現在地の高さより、どれだけ学び方を改善し進んだかを見ます。今日の目標を「成功する」から「次に使える情報をひとつ得る」に変えるとしたら、どんな小さな実験ができそうでしょう？",
    };
  }
  if (/決め|迷|考えすぎ|正解|意見|対立|間違|思い込|不安/i.test(input)) {
    return {
      role: "assistant", source: SOURCES.rethink,
      text: "確実な正解を探すほど、動けなくなることがあります。Grant氏が勧めるのは、信念を守る人ではなく仮説を試す科学者の姿勢です。「私は何を事実だと思っている？」「それが違うと分かる証拠は？」「安全に試せる最小の一歩は？」の3つを置いてみましょう。いまの考えを、事実ではなく仮説として言い換えるとどうなりますか？",
    };
  }
  if (/意味|やる気|空虚|むなし|停滞|仕事|頑張れ|動け/i.test(input)) {
    return {
      role: "assistant", source: SOURCES.research,
      text: "やる気の欠如を、意志の弱さだけで説明しなくて大丈夫です。Grant氏の研究には、自分の行動が誰にどう役立つかを具体的に見えるようにすると、意味や粘り強さにつながるという視点があります。あなたの今日の行動が少し楽にする相手を、一人だけ思い浮かべるとしたら誰でしょう。自分自身でも構いません。",
    };
  }
  if (/怖|挑戦|始め|アイデア|創造|先延ば|完璧/i.test(input)) {
    return {
      role: "assistant", source: SOURCES.originals,
      text: "怖さや迷いがあることは、挑戦に向いていない証拠ではありません。『Originals』では、独創的な人も不安や疑いを抱え、よくない案も出しながら試し続けると捉えます。完成させる前提を外して、20分だけ試作品を作るなら、最初に何を置けそうでしょう？",
    };
  }
  return {
    role: "assistant", source: SOURCES.rethink,
    text: "話してくれてありがとうございます。いまの言葉の中には、変えたい気持ちと、簡単には動けない理由の両方がありそうです。結論を急がずに確かめたいです。①いま分かっている事実、②自分が加えている解釈、③本当は大切にしたいこと——この3つに分けると、それぞれ何が入りそうでしょう？",
  };
}

function ArrowIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
}
function LeafMark() {
  return <span className="leaf-mark" aria-hidden="true"><span /><span /></span>;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const usedSources = useMemo(() => {
    const byLabel = new Map<string, Source>();
    messages.forEach((message) => { if (message.source) byLabel.set(message.source.label, message.source); });
    return [...byLabel.values()];
  }, [messages]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages, isThinking]);

  function submit(value: string) {
    const text = value.trim();
    if (!text || isThinking) return;
    setMessages((current) => [...current, { id: Date.now(), role: "user", text }]);
    setInput("");
    setIsThinking(true);
    window.setTimeout(() => {
      setMessages((current) => [...current, { id: Date.now() + 1, ...replyFor(text) }]);
      setIsThinking(false);
    }, 650);
  }
  function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); submit(input); }
  function resetConversation() {
    setMessages([{ ...initialMessage, id: Date.now() }]);
    setInput("");
    setSourcesOpen(false);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Give & Chat ホーム"><LeafMark /><span>Give <i>&</i> Chat</span></a>
        <div className="top-actions"><span className="privacy-badge"><span /> この会話は端末内のみ</span><button className="text-button" onClick={resetConversation} type="button">会話をリセット</button></div>
      </header>

      <section className="workspace" id="top">
        <div className="conversation-column">
          <div className="intro">
            <p className="eyebrow">A QUIET PLACE TO RETHINK</p>
            <h1>少し立ち止まって、<br /><em>考え直す</em>時間を。</h1>
            <p className="intro-copy">組織心理学者 Adam Grant氏の研究・著作を手がかりに、気持ちを整理するための対話ガイドです。</p>
          </div>

          {messages.length === 1 && <div className="prompt-grid" aria-label="相談例">
            {prompts.map((prompt, index) => <button key={prompt} onClick={() => submit(prompt)} type="button"><span>0{index + 1}</span>{prompt}<ArrowIcon /></button>)}
          </div>}

          <div className="messages" aria-live="polite">
            {messages.map((message) => <article className={`message ${message.role}${message.urgent ? " urgent" : ""}`} key={message.id}>
              <div className="message-meta">{message.role === "assistant" ? <><LeafMark /> GUIDE</> : "YOU"}</div>
              <p>{message.text}</p>
              {message.source && <a className="inline-source" href={message.source.url} target="_blank" rel="noreferrer"><span>参考</span>{message.source.label}<ArrowIcon /></a>}
            </article>)}
            {isThinking && <div className="thinking" aria-label="回答を考えています"><span /><span /><span /></div>}
            <div ref={endRef} />
          </div>

          <form className="composer" onSubmit={handleSubmit}>
            <label htmlFor="chat-input">いま感じていることを、まとまっていなくても大丈夫です</label>
            <div className="composer-row">
              <textarea id="chat-input" onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && (event.metaKey || event.ctrlKey) && !event.nativeEvent.isComposing) { event.preventDefault(); submit(input); } }} placeholder="ここに書いてください…" rows={2} value={input} />
              <button disabled={!input.trim() || isThinking} type="submit" aria-label="メッセージを送信"><ArrowIcon /></button>
            </div>
            <p className="composer-help"><span>改行：Enter　送信：⌘/Ctrl + Enter</span><span>診断や治療を行うサービスではありません。緊急時は119・110、または公的な相談窓口へ。</span></p>
          </form>
        </div>

        <aside className={`source-panel ${sourcesOpen ? "open" : ""}`}>
          <button className="mobile-source-toggle" onClick={() => setSourcesOpen(!sourcesOpen)} type="button"><span>この対話の根拠</span><span>{sourcesOpen ? "閉じる" : `${usedSources.length || 5}件を見る`}</span></button>
          <div className="source-panel-inner">
            <p className="eyebrow">THE THINKING BEHIND IT</p>
            <h2>答えより、<br />良い問いを。</h2>
            <p className="source-lead">Grant氏本人を再現するものではありません。公開された研究・著作を、日々の内省に応用しています。</p>
            <div className="principle-list">
              <div><span>01</span><p><strong>科学者の姿勢</strong>意見をアイデンティティにせず、仮説として確かめる。</p></div>
              <div><span>02</span><p><strong>持続可能なギブ</strong>他者への貢献と、自分を守る境界線を両立する。</p></div>
              <div><span>03</span><p><strong>進んだ距離を見る</strong>才能の高さより、学び方と小さな前進に注目する。</p></div>
            </div>
            {usedSources.length > 0 && <div className="used-sources"><p>この対話で参照</p>{usedSources.map((source) => <a href={source.url} key={source.label} target="_blank" rel="noreferrer"><span>{source.label}<small>{source.detail}</small></span><ArrowIcon /></a>)}</div>}
            <div className="source-footer"><p>PRIMARY SOURCES</p><a href="https://scholar.google.com/citations?user=YkSKaRMAAAAJ&hl=en" target="_blank" rel="noreferrer">Google Scholar</a><a href="https://www.youtube.com/channel/UCYaXXVrHBKwriEJ3x7la8_A" target="_blank" rel="noreferrer">YouTube</a><a href="https://x.com/AdamMGrant" target="_blank" rel="noreferrer">@AdamMGrant</a></div>
          </div>
        </aside>
      </section>
    </main>
  );
}
