import assert from "node:assert/strict";
import test from "node:test";
import {
  INITIAL_MEMORY,
  createLocalResponse,
  detectExperimentChoice,
} from "../lib/conversation.ts";

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
const { default: worker } = await import(workerUrl.href);

const env = {
  ASSETS: {
    fetch: async () => new Response("Not found", { status: 404 }),
  },
};

const ctx = {
  waitUntil() {},
  passThroughOnException() {},
};

test("server-renders the private local conversation experience", async () => {
  const response = await worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    env,
    ctx,
  );
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Give &amp; Chat/);
  assert.match(html, /外部AIへ送信せず/);
  assert.doesNotMatch(html, /OpenAI API/);
});

test("recognizes semantic variations of experiment choice one", () => {
  const phrases = [
    "小さな相談AIを作る",
    "まずチャットボットを試作したい",
    "心に寄り添うAIを始めます",
    "プロトタイプにします",
    "①を選ぶ",
  ];
  for (const phrase of phrases) {
    assert.equal(detectExperimentChoice(phrase), 1, phrase);
  }
});

test("keeps context and advances without returning to the first question", () => {
  const reflected = createLocalResponse(
    "reflection",
    "大学院に落ちた、希望が潰えた、人の心に寄り添うAIを作りたい",
    INITIAL_MEMORY,
  );
  assert.equal(reflected.reply.stage, "experiment_choice");
  assert.match(reflected.reply.text, /小さな相談AI/);

  const selected = createLocalResponse(
    reflected.reply.stage,
    "小さな相談AIを作る",
    reflected.memory,
  );
  assert.equal(selected.reply.stage, "prototype_scope");
  assert.equal(selected.memory.experimentChoice, 1);
  assert.match(selected.reply.text, /①の選択/);
  assert.doesNotMatch(selected.reply.text, /事実.*解釈.*大切にしたい/);

  const scoped = createLocalResponse(
    selected.reply.stage,
    "会話のループをなくすところから",
    selected.memory,
  );
  assert.equal(scoped.reply.stage, "action_plan");
  assert.equal(scoped.memory.prototypeScope, 2);
  assert.match(scoped.reply.text, /5ターンの会話/);
});

test("does not repeat a question when the user remains unsure", () => {
  const first = createLocalResponse(
    "future_prediction",
    "分からない",
    INITIAL_MEMORY,
  );
  const second = createLocalResponse(
    first.reply.stage,
    "まだ分からない",
    first.memory,
  );
  assert.equal(second.reply.stage, "future_prediction");
  assert.match(second.reply.text, /同じ問いはここで止めます/);
  assert.doesNotMatch(second.reply.text, /未来の予測を一文/);
});

test("accepts a custom experiment and moves forward", () => {
  const result = createLocalResponse(
    "experiment_choice",
    "一週間、毎日アイデアを一つメモしたい",
    INITIAL_MEMORY,
  );
  assert.equal(result.reply.stage, "action_plan");
  assert.equal(result.memory.experimentChoice, "custom");
  assert.match(result.reply.text, /あなた自身の実験/);
});
