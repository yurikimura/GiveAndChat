import assert from "node:assert/strict";
import test from "node:test";

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

test("server-renders Give & Chat", async () => {
  const response = await worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    env,
    ctx,
  );
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Give &amp; Chat/);
  assert.match(html, /考え直す/);
  assert.match(html, /OpenAI API/);
});

test("treats the prototype wording as experiment choice one", async () => {
  const response = await worker.fetch(
    new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        stage: "experiment_choice",
        messages: [
          {
            role: "assistant",
            text: "①小さな相談AIの試作品を作る、②研究者に話を聞く、③別の大学院を調べる",
          },
          { role: "user", text: "小さな相談AIを作る" },
        ],
      }),
    }),
    env,
    ctx,
  );
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.stage, "prototype_scope");
  assert.equal(result.intent, "experiment_selected");
  assert.match(result.text, /①の選択/);
  assert.doesNotMatch(result.text, /事実.*解釈.*大切にしたい/);
});

test("advances through reflection without returning to the first question", async () => {
  const reflectionResponse = await worker.fetch(
    new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        stage: "reflection",
        messages: [
          {
            role: "assistant",
            text: "①確認できる事実、②自分が加えている解釈、③本当は大切にしたいこと",
          },
          {
            role: "user",
            text: "大学院に落ちた、希望が潰えた、人の心に寄り添うAIを作りたい",
          },
        ],
      }),
    }),
    env,
    ctx,
  );
  const reflection = await reflectionResponse.json();
  assert.equal(reflection.stage, "experiment_choice");
  assert.match(reflection.text, /小さな相談AI/);

  const unsureResponse = await worker.fetch(
    new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        stage: "future_prediction",
        messages: [{ role: "user", text: "分からない" }],
      }),
    }),
    env,
    ctx,
  );
  const unsure = await unsureResponse.json();
  assert.equal(unsure.stage, "future_prediction");
  assert.doesNotMatch(unsure.text, /未来の予測を一文/);
});
