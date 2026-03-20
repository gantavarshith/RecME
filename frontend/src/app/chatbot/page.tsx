"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendMessageToChatbot } from "@/lib/api";
import { Bot, Send, User, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "Recommend a thriller for tonight",
  "What's a good movie for date night?",
  "Best sci-fi movies of all time?",
  "Movies similar to Inception",
];

let msgId = 0;

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: msgId++,
      role: "assistant",
      content:
        "Hey! I'm your RecME AI assistant 🎬. Ask me for movie recommendations, match me to your mood, or discover hidden gems. What are you in the mood to watch?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || loading) return;

    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: msgId++, role: "user", content: message },
    ]);
    setLoading(true);

    try {
      const { response } = await sendMessageToChatbot(message);
      setMessages((prev) => [
        ...prev,
        { id: msgId++, role: "assistant", content: response },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: msgId++,
          role: "assistant",
          content:
            "Sorry, I had trouble connecting to the server. Make sure the backend is running on port 8000.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-white/5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-600/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-gray-900 dark:text-white text-lg">
              RecME AI
            </h1>
            <p className="text-xs text-gray-400 dark:text-zinc-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              Online
            </p>
          </div>
        </div>

        {/* Quick Prompts */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/5 text-gray-600 dark:text-zinc-400 hover:border-purple-300 dark:hover:border-purple-700 hover:text-purple-700 dark:hover:text-purple-300 transition-all"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 flex flex-col gap-4 overflow-auto">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex items-start gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs shadow-sm ${
                    msg.role === "assistant"
                      ? "bg-gradient-to-br from-purple-500 to-violet-600"
                      : "bg-gray-700 dark:bg-zinc-700"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Bot className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    msg.role === "assistant"
                      ? "bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 border border-gray-100 dark:border-white/5 rounded-tl-sm"
                      : "bg-purple-600 text-white rounded-tr-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, delay: i * 0.15, duration: 0.6 }}
                    className="w-2 h-2 rounded-full bg-purple-400 inline-block"
                  />
                ))}
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="sticky bottom-0 pt-4 pb-2 bg-gray-50 dark:bg-zinc-950">
          <div className="flex items-end gap-3 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/5 shadow-sm focus-within:border-purple-400 dark:focus-within:border-purple-700 transition-colors">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask for a movie recommendation..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none max-h-32 overflow-auto"
              style={{ lineHeight: "1.5" }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-xs text-gray-300 dark:text-zinc-600 mt-2">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
