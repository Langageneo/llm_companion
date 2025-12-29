import fs from "fs";
import readline from "readline";
import OpenAI from "openai";
import { SYSTEM_PROMPT } from "./system.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 20000
});

const SHORT_FILE = "./memory/short.json";
const LONG_FILE = "./memory/long.json";
const SUMMARY_FILE = "./memory/summary.json";
const SHORT_LIMIT = 10;

function read(file, fallback) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
  }
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function write(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

async function summarize(messages) {
  const res = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: "Résume clairement les éléments importants de cette conversation." },
      { role: "user", content: JSON.stringify(messages) }
    ]
  });
  return res.choices[0].message.content;
}

async function ask(prompt) {
  const short = read(SHORT_FILE, { messages: [] });
  const long = read(LONG_FILE, { summaries: [] });
  const summary = read(SUMMARY_FILE, { last_summary: "" });

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...(summary.last_summary ? [{ role: "system", content: "Contexte précédent : " + summary.last_summary }] : []),
    ...short.messages,
    { role: "user", content: prompt }
  ];

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages
  });

  const answer = response.choices[0].message.content;

  short.messages.push({ role: "user", content: prompt });
  short.messages.push({ role: "assistant", content: answer });

  if (short.messages.length >= SHORT_LIMIT * 2) {
    const sum = await summarize(short.messages);
    long.summaries.push(sum);
    summary.last_summary = sum;
    short.messages = [];
    write(LONG_FILE, long);
    write(SUMMARY_FILE, summary);
  }

  write(SHORT_FILE, short);
  console.log("\n" + answer + "\n");
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('LLM compagnon actif. Tape "exit" pour quitter.');

function loop() {
  rl.question("> ", async (input) => {
    if (input.toLowerCase() === "exit") {
      rl.close();
      return;
    }
    try {
      await ask(input);
    } catch {
      console.log("Erreur réseau. Réessaie.");
    }
    loop();
  });
}

loop();
