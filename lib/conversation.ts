import type { SourceId } from "./grant-knowledge";

export const CONVERSATION_STAGES = [
  "opening",
  "reflection",
  "future_prediction",
  "experiment_choice",
  "prototype_scope",
  "action_plan",
  "open_conversation",
  "crisis",
] as const;

export type ConversationStage = (typeof CONVERSATION_STAGES)[number];

export type ChatTurn = {
  role: "assistant" | "user";
  text: string;
};

export type Reflection = {
  fact: string;
  interpretation: string;
  value: string;
};

export type StageDecision = {
  from: ConversationStage;
  to: ConversationStage;
  intent:
    | "crisis"
    | "start_reflection"
    | "reflection_captured"
    | "reflection_partial"
    | "future_prediction_captured"
    | "reduce_load"
    | "experiment_selected"
    | "clarify_experiment"
    | "prototype_scope_selected"
    | "action_follow_up"
    | "continue_openly";
  selection?: 1 | 2 | 3;
  reflection?: Reflection;
};

export const crisisPattern =
  /死にたい|自殺|消えたい|生きていたくない|終わりにしたい|自分を傷つけ|殺して|suicid|kill myself|hurt myself/i;

const unsurePattern =
  /^(?:(?:まだ|正直|よく)\s*)?(?:分|わ)からない(?:です)?[。．.!！…]*$/i;

function cleanPart(value: string) {
  return value.trim().replace(/\s*(?:という)?こと[。．.]?$/, "");
}

export function isConversationStage(value: unknown): value is ConversationStage {
  return (
    typeof value === "string" &&
    CONVERSATION_STAGES.includes(value as ConversationStage)
  );
}

export function extractReflection(input: string): Reflection | null {
  const fact = input.match(
    /(?:今(?:わか|分)っている(?:現実|事実)|(?:現実|事実))\s*[:：]\s*([\s\S]*?)(?=\s*(?:(?:自分が)?(?:加|抱|咥)えている)?解釈\s*[:：]|\s*(?:本当は)?大切にしたいこと\s*[:：]|$)/i,
  )?.[1]?.trim();
  const interpretation = input.match(
    /(?:(?:自分が)?(?:加|抱|咥)えている)?解釈\s*[:：]\s*([\s\S]*?)(?=\s*(?:本当は)?大切にしたいこと\s*[:：]|$)/i,
  )?.[1]?.trim();
  const value = input.match(
    /(?:本当は)?大切にしたいこと\s*[:：]\s*([\s\S]+)$/i,
  )?.[1]?.trim();

  if (fact && interpretation && value) {
    return {
      fact: cleanPart(fact),
      interpretation: cleanPart(interpretation),
      value: cleanPart(value),
    };
  }

  const parts = input
    .split(/\s*(?:、|，|,|\n+)\s*/)
    .map(cleanPart)
    .filter(Boolean);

  if (parts.length !== 3) return null;
  return { fact: parts[0], interpretation: parts[1], value: parts[2] };
}

function numberedChoice(input: string): 1 | 2 | 3 | null {
  const value = input.trim();
  if (/^(?:①|1)(?:[。．.)）]|番)?$/.test(value)) return 1;
  if (/^(?:②|2)(?:[。．.)）]|番)?$/.test(value)) return 2;
  if (/^(?:③|3)(?:[。．.)）]|番)?$/.test(value)) return 3;
  return null;
}

export function detectExperimentChoice(input: string): 1 | 2 | 3 | null {
  const numbered = numberedChoice(input);
  if (numbered) return numbered;

  const value = input.replace(/\s+/g, "");
  if (
    /(?:小さ|ミニ|簡単|まず|試作|プロトタイプ).*(?:相談|対話|心|メンタル)?(?:AI|人工知能|チャットボット).*(?:作|始|試)|(?:相談|対話|心|メンタル)(?:AI|人工知能|チャットボット).*(?:作|始|試)/i.test(
      value,
    )
  ) {
    return 1;
  }
  if (
    /(?:心理|メンタル|支援).*(?:研究者|研究する人|専門家).*(?:話|聞|相談)|(?:研究者|研究する人|専門家).*(?:話|聞|相談)/i.test(
      value,
    )
  ) {
    return 2;
  }
  if (
    /(?:別|他).*(?:大学院|研究室).*(?:調|探|見る)|(?:大学院|研究室).*(?:3|三)つ.*(?:調|探)/i.test(
      value,
    )
  ) {
    return 3;
  }
  return null;
}

export function detectPrototypeScope(input: string): 1 | 2 | 3 | null {
  const numbered = numberedChoice(input);
  if (numbered) return numbered;

  const value = input.replace(/\s+/g, "");
  if (/悩み|対象|ユーザー|場面|誰.*支え/i.test(value)) return 1;
  if (/対話|会話|ターン|流れ|ループ/i.test(value)) return 2;
  if (/Adam|Grant|グラント|資料|根拠|対応表|出典/i.test(value)) return 3;
  return null;
}

export function advanceConversation(
  from: ConversationStage,
  input: string,
): StageDecision {
  if (crisisPattern.test(input)) {
    return { from, to: "crisis", intent: "crisis" };
  }

  const reflection = extractReflection(input);
  if ((from === "opening" || from === "reflection") && reflection) {
    return {
      from,
      to: "experiment_choice",
      intent: "reflection_captured",
      reflection,
    };
  }

  if (unsurePattern.test(input.trim())) {
    return { from, to: from === "opening" ? "reflection" : from, intent: "reduce_load" };
  }

  switch (from) {
    case "opening":
      return { from, to: "reflection", intent: "start_reflection" };
    case "reflection":
      return { from, to: "future_prediction", intent: "reflection_partial" };
    case "future_prediction":
      return {
        from,
        to: "experiment_choice",
        intent: "future_prediction_captured",
      };
    case "experiment_choice": {
      const selection = detectExperimentChoice(input);
      if (!selection) {
        return { from, to: from, intent: "clarify_experiment" };
      }
      return {
        from,
        to: selection === 1 ? "prototype_scope" : "action_plan",
        intent: "experiment_selected",
        selection,
      };
    }
    case "prototype_scope": {
      const selection = detectPrototypeScope(input);
      return {
        from,
        to: "action_plan",
        intent: "prototype_scope_selected",
        ...(selection ? { selection } : {}),
      };
    }
    case "action_plan":
      return { from, to: "open_conversation", intent: "action_follow_up" };
    case "crisis":
      return { from, to: "open_conversation", intent: "continue_openly" };
    case "open_conversation":
    default:
      return { from, to: "open_conversation", intent: "continue_openly" };
  }
}

export type GeneratedReply = {
  text: string;
  stage: ConversationStage;
  sourceIds: SourceId[];
  urgent?: boolean;
  intent: StageDecision["intent"];
};

export function fallbackReply(decision: StageDecision, input: string): GeneratedReply {
  const base = {
    stage: decision.to,
    intent: decision.intent,
    sourceIds: ["rethink"] as SourceId[],
  };

  if (decision.intent === "crisis") {
    return {
      ...base,
      stage: "crisis",
      urgent: true,
      sourceIds: ["crisis"],
      text: "いま、とても切迫した苦しさの中にいるのですね。ここで一人で抱え続けないでください。今すぐ自分を傷つける可能性がある場合は、119（救急）または110へ連絡し、安全な場所で信頼できる人にそばにいてもらってください。厚生労働省の相談先一覧では、電話やSNSの窓口を選べます。私は緊急支援の代わりにはなれませんが、連絡する相手や最初の一言を一緒に考えることはできます。いま、あなたの近くに連絡できる人はいますか？",
    };
  }

  if (decision.intent === "reflection_captured" && decision.reflection) {
    const { fact, interpretation, value } = decision.reflection;
    const aiGoal = /AI|人工知能|チャットボット/i.test(value);
    const choices = aiGoal
      ? "①小さな相談AIの試作品を作る、②心理支援を研究する人に話を聞く、③別の大学院・研究室を3つ調べる"
      : "①目的に近い人へ話を聞く、②20分で試作品を作る、③別の経路を3つ書き出す";
    return {
      ...base,
      text: `整理すると、事実は「${fact}」、そこから加わった解釈は「${interpretation}」、大切にしたい目的は「${value}」ですね。\n\n『Think Again』の視点では、一つの経路が閉じたことと、目的へのすべての経路が閉じたことは分けて考えられます。大学院を、目的そのものではなく試していた仮説の一つとして置き直せます。\n\n今後30日で試すなら、${choices}——どれが一番近いですか？`,
    };
  }

  if (decision.intent === "experiment_selected") {
    if (decision.selection === 1) {
      return {
        ...base,
        sourceIds: ["potential", "originals"],
        text: "「小さな相談AIを作る」を①の選択として受け取りました。大学院とは別の経路で、作りたいものを小さく試して学ぶ実験ですね。\n\n最初の7日間は完成を目指さず、範囲を一つだけ決めましょう。①支える悩み・場面を一つに絞る、②5ターンの会話の流れを作る、③Adam Grant氏の資料と回答の対応表を作る——最初に取り組みたいのはどれですか？",
      };
    }
    if (decision.selection === 2) {
      return {
        ...base,
        sourceIds: ["potential", "research"],
        text: "②の「心理支援を研究する人に話を聞く」を選んだと受け取りました。これは答えをもらう場ではなく、相談AIに必要な条件を確かめる小さな調査にできます。まず聞きたいことを一問に絞るなら、何を確かめたいですか？",
      };
    }
    return {
      ...base,
      sourceIds: ["rethink", "potential"],
      text: "③の「別の大学院・研究室を調べる」を選んだと受け取りました。合否を自分の価値の判定にせず、目的への経路を比較する情報収集として進められます。三つの候補を見るとき、研究テーマ、指導者、実装機会のどれを最優先にしたいですか？",
    };
  }

  if (decision.intent === "prototype_scope_selected") {
    const choices: Record<number, string> = {
      1: "「支える悩み・場面を一つに絞る」から始めるのですね。対象を狭くするほど、役に立ったかを確かめやすくなります。今日20分で、想定する一人と、その人が相談を始める最初の一文を書いてみませんか？",
      2: "「5ターンの会話の流れを作る」から始めるのですね。今回のようなループを防ぐには、各ターンの目的と次の段階を一行ずつ決めるのが有効です。最初の5段階を一緒に書き出してみますか？",
      3: "「資料と回答の対応表を作る」から始めるのですね。根拠を先に整理すると、Grant氏らしさを雰囲気ではなく出典で支えられます。まず『Think Again』について、悩み・使う考え方・出典の3列で一行作ってみませんか？",
    };
    return {
      ...base,
      sourceIds: decision.selection === 3 ? ["rethink", "research"] : ["potential", "originals"],
      text:
        (decision.selection && choices[decision.selection]) ||
        `「${input}」を最初の範囲として受け取りました。これを7日間の実験にするために、今日20分で終えられる最初の作業は何になりそうでしょう？`,
    };
  }

  if (decision.intent === "reduce_load") {
    if (decision.from === "experiment_choice") {
      return {
        ...base,
        sourceIds: ["potential"],
        text: "いま決められなくても大丈夫です。決断ではなく、情報を得るための仮の実験として選べます。今日は①相談AIの名前だけ決める、②研究者に聞きたいことを一つメモする、③大学院の候補を一つ保存する——どれなら負担が少なそうですか？",
      };
    }
    return {
      ...base,
      text: "「分からない」で大丈夫です。答えを作るのではなく、負担を小さくしましょう。いま最も近いのは、①悲しい、②悔しい、③不安、④まだ言葉にしたくない、のどれでしょう？ 番号だけでも構いません。",
    };
  }

  if (decision.intent === "reflection_partial") {
    return {
      ...base,
      text: `「${input}」を次の材料として受け取りました。同じ問いには戻りません。次に、その出来事が未来をどう決めると感じているかを確かめたいです。いま浮かぶ未来の予測を、一文にするとどんな言葉になりますか？`,
    };
  }

  if (decision.intent === "future_prediction_captured") {
    return {
      ...base,
      text: `「${input}」が、いま未来について浮かんでいる予測なのですね。予測は事実ではなく、確かめられる仮説として扱えます。目的へ近づく小さな実験を置くなら、①試作品を作る、②人に話を聞く、③別の経路を調べる——どれが近いですか？`,
    };
  }

  if (decision.intent === "clarify_experiment") {
    return {
      ...base,
      text: `「${input}」という考えも含めて受け取りました。先ほどの選択肢に無理に合わせる必要はありません。それを30日で確かめられる小さな実験にすると、最初の一歩は何になりそうでしょう？`,
    };
  }

  if (decision.intent === "start_reflection") {
    return {
      ...base,
      text: "話してくれてありがとうございます。結論を急がず、いまの状況を一度だけ整理してみましょう。①確認できる事実、②そこから自分が加えている解釈、③本当は大切にしたいこと——それぞれに何が入りそうでしょう？",
    };
  }

  return {
    ...base,
    sourceIds: ["rethink", "potential"],
    text: `「${input}」を、ここまでの会話につながる言葉として受け取りました。いま大切にしたい目的を失わずに、次の一歩をさらに小さくすると何ができそうでしょう？`,
  };
}
