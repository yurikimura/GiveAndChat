"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  advanceConversation,
  fallbackReply,
  type ConversationStage,
} from "@/lib/conversation";
import { SOURCES, type SourceId } from "@/lib/grant-knowledge";

type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
  sourceIds?: SourceId[];
  urgent?: boolean;
};

type ChatResponse = {
  text: string;
  stage: ConversationStage;
  sourceIds: SourceId[];
  urgent?: boolean;
  mode: "openai" | "fallback" | "safety";
  notice?: string;
};

const prompts = [
  "仕事で燃え尽きそう",
  "失敗を引きずっている",
  "考えすぎて決められない",
  "人に与えすぎて疲れた",
];

const initialMessage: Message = {
  id: 1,
  role: "assistant",
  text: "今日は、どんなことが心に引っかかっていますか？ 答えを急がず、まず一緒に状況をほどいていきましょう。",
};

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
      <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function LeafMark() {
  return <span className="leaf-mark" aria-hidden="true"><span /><span /></span>;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [stage, setStage] = useState<ConversationStage>("opening");
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [serviceNotice, setServiceNotice] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef(2);

  const usedSources = useMemo(() => {
    const ids = new Set<SourceId>();
    messages.forEach((message) => message.sourceIds?.forEach((id) => ids.add(id)));
    return [...ids].map((id) => ({ id, ...SOURCES[id] }));
  }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, isThinking]);

  async function submit(value: string) {
    const text = value.trim();
    if (!text || isThinking) return;

    const userMessage: Message = { id: nextIdRef.current++, role: "user", text };
    const requestMessages = [...messages, userMessage].map((message) => ({
      role: message.role,
      text: message.text,
    }));
    const currentStage = stage;

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsThinking(true);
    setServiceNotice(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: currentStage, messages: requestMessages }),
      });
      if (!response.ok) throw new Error("Chat request failed");

      const generated = (await response.json()) as ChatResponse;
      setMessages((current) => [
        ...current,
        {
          id: nextIdRef.current++,
          role: "assistant",
          text: generated.text,
          sourceIds: generated.sourceIds,
          urgent: generated.urgent,
        },
      ]);
      setStage(generated.stage);
      setServiceNotice(generated.notice ?? null);
    } catch {
      const decision = advanceConversation(currentStage, text);
      const fallback = fallbackReply(decision, text);
      setMessages((current) => [
        ...current,
        {
          id: nextIdRef.current++,
          role: "assistant",
          text: fallback.text,
          sourceIds: fallback.sourceIds,
          urgent: fallback.urgent,
        },
      ]);
      setStage(fallback.stage);
      setServiceNotice("接続できなかったため、会話ステージに基づく応答を表示しています。");
    } finally {
      setIsThinking(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit(input);
  }

  function resetConversation() {
    setMessages([{ ...initialMessage, id: nextIdRef.current++ }]);
    setStage("opening");
    setInput("");
    setSourcesOpen(false);
    setServiceNotice(null);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Give & Chat ホーム"><LeafMark /><span>Give <i>&</i> Chat</span></a>
        <div className="top-actions"><span className="privacy-badge"><span /> 文脈を引き継いで応答</span><button className="text-button" onClick={resetConversation} type="button">会話をリセット</button></div>
      </header>

      <section className="workspace" id="top">
        <div className="conversation-column">
          <div className="intro">
            <p className="eyebrow">A QUIET PLACE TO RETHINK</p>
            <h1>少し立ち止まって、<br /><em>考え直す</em>時間を。</h1>
            <p className="intro-copy">組織心理学者 Adam Grant氏の研究・著作を手がかりに、会話の流れを保ちながら気持ちを整理する対話ガイドです。</p>
          </div>

          {messages.length === 1 && <div className="prompt-grid" aria-label="相談例">
            {prompts.map((prompt, index) => <button key={prompt} onClick={() => void submit(prompt)} type="button"><span>0{index + 1}</span>{prompt}<ArrowIcon /></button>)}
          </div>}

          <div className="messages" aria-live="polite">
            {messages.map((message) => <article className={`message ${message.role}${message.urgent ? " urgent" : ""}`} key={message.id}>
              <div className="message-meta">{message.role === "assistant" ? <><LeafMark /> GUIDE</> : "YOU"}</div>
              <p>{message.text}</p>
              {message.sourceIds && message.sourceIds.length > 0 && <div className="inline-sources">
                {message.sourceIds.map((id) => <a className="inline-source" href={SOURCES[id].url} key={id} target="_blank" rel="noreferrer"><span>参考</span>{SOURCES[id].label}<ArrowIcon /></a>)}
              </div>}
            </article>)}
            {isThinking && <div className="thinking" aria-label="回答を考えています"><span /><span /><span /></div>}
            <div ref={endRef} />
          </div>

          <form className="composer" onSubmit={handleSubmit}>
            {serviceNotice && <p className="service-notice" role="status">{serviceNotice}</p>}
            <label htmlFor="chat-input">いま感じていることを、まとまっていなくても大丈夫です</label>
            <div className="composer-row">
              <textarea id="chat-input" maxLength={4000} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && (event.metaKey || event.ctrlKey) && !event.nativeEvent.isComposing) { event.preventDefault(); void submit(input); } }} placeholder="ここに書いてください…" rows={2} value={input} />
              <button disabled={!input.trim() || isThinking} type="submit" aria-label="メッセージを送信"><ArrowIcon /></button>
            </div>
            <p className="composer-help"><span>改行：Enter　送信：⌘/Ctrl + Enter</span><span>回答生成のため直近の会話をOpenAI APIへ送信します。アプリのデータベースには保存しません。</span><span>診断や治療を行うサービスではありません。緊急時は119・110、または公的な相談窓口へ。</span></p>
          </form>
        </div>

        <aside className={`source-panel ${sourcesOpen ? "open" : ""}`}>
          <button className="mobile-source-toggle" onClick={() => setSourcesOpen(!sourcesOpen)} type="button"><span>この対話の根拠</span><span>{sourcesOpen ? "閉じる" : `${usedSources.length || 5}件を見る`}</span></button>
          <div className="source-panel-inner">
            <p className="eyebrow">THE THINKING BEHIND IT</p>
            <h2>答えより、<br />良い問いを。</h2>
            <p className="source-lead">Grant氏本人を再現するものではありません。公開された研究・著作の要約と会話履歴を、対話の文脈として使います。</p>
            <div className="principle-list">
              <div><span>01</span><p><strong>科学者の姿勢</strong>意見をアイデンティティにせず、仮説として確かめる。</p></div>
              <div><span>02</span><p><strong>持続可能なギブ</strong>他者への貢献と、自分を守る境界線を両立する。</p></div>
              <div><span>03</span><p><strong>進んだ距離を見る</strong>才能の高さより、学び方と小さな前進に注目する。</p></div>
            </div>
            {usedSources.length > 0 && <div className="used-sources"><p>この対話で参照</p>{usedSources.map((source) => <a href={source.url} key={source.id} target="_blank" rel="noreferrer"><span>{source.label}<small>{source.detail}</small></span><ArrowIcon /></a>)}</div>}
            <div className="source-footer"><p>PRIMARY SOURCES</p><a href="https://scholar.google.com/citations?user=YkSKaRMAAAAJ&hl=en" target="_blank" rel="noreferrer">Google Scholar</a><a href="https://www.youtube.com/channel/UCYaXXVrHBKwriEJ3x7la8_A" target="_blank" rel="noreferrer">YouTube</a><a href="https://x.com/AdamMGrant" target="_blank" rel="noreferrer">@AdamMGrant</a></div>
          </div>
        </aside>
      </section>
    </main>
  );
}
