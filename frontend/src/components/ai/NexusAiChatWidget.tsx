"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, X, Minimize2, Maximize2, RotateCcw, ShieldCheck, User as UserIcon } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth.store";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  intent?: string;
  suggestedActions?: string[];
  timestamp: string;
}

export function NexusAiChatWidget() {
  const { user, isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-welcome",
      sender: "assistant",
      text: "Hello! I am Nexus AI, your enterprise workforce intelligence assistant. You can ask me about employee attrition risks, department headcount, leave balances, attendance telemetry, or statutory payroll questions.",
      suggestedActions: [
        "What is the company headcount?",
        "What is our overall attrition risk?",
        "How many leaves do I have left?",
        "Who is on leave today?"
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (overrideMessage?: string) => {
    const textToSend = (overrideMessage || input).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/ai/chat", { message: textToSend });
      const assistantMsg: ChatMessage = {
        id: "ai-" + Date.now(),
        sender: "assistant",
        text: res.data.reply || "I have processed your query based on current active records.",
        intent: res.data.intent,
        suggestedActions: res.data.suggestedActions,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: "err-" + Date.now(),
        sender: "assistant",
        text: "I encountered an issue retrieving real-time telemetry. Please ensure your session is active or try re-phrasing your prompt.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "reset-" + Date.now(),
        sender: "assistant",
        text: "Conversation context cleared. How can I assist your workforce strategy today?",
        suggestedActions: [
          "What is the company headcount?",
          "What is our overall attrition risk?",
          "How many leaves do I have left?",
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-semibold shadow-xl shadow-amber-500/20 hover:shadow-amber-500/35 hover:scale-105 active:scale-95 transition-all duration-200 border border-amber-300/40"
          title="Open Nexus AI Assistant"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="text-xs sm:text-sm font-bold tracking-tight">Ask Nexus AI</span>
        </button>
      )}

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div
          className={`fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-50 w-[calc(100vw-32px)] sm:w-[420px] transition-all duration-300 flex flex-col rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 backdrop-blur-2xl bg-white/90 dark:bg-slate-900/95 overflow-hidden ${
            isMinimized ? "h-14" : "h-[540px] max-h-[85vh]"
          }`}
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-600/10 dark:from-amber-500/20 dark:via-orange-500/20 dark:to-amber-600/20 border-b border-black/5 dark:border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-md">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Nexus Intelligence</h3>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Online (Offline-Safe)
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Zero External Leaks • Rule & LLM Fallback</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <button
                onClick={clearChat}
                className="p-1.5 hover:text-amber-500 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="Clear Conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:text-amber-500 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-rose-500 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 text-xs sm:text-sm">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm leading-relaxed ${
                        m.sender === "user"
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-medium rounded-br-xs"
                          : "bg-black/5 dark:bg-white/5 text-slate-800 dark:text-slate-200 border border-black/5 dark:border-white/10 rounded-bl-xs"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    </div>

                    <span className="text-[9px] text-slate-400 mt-1 px-1">{m.timestamp}</span>

                    {/* Suggested Prompt Chips */}
                    {m.suggestedActions && m.suggestedActions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                        {m.suggestedActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(action)}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition-all text-left"
                          >
                            ⚡ {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 max-w-[50%] border border-black/5 dark:border-white/10">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[10px] text-slate-400 ml-1">Analyzing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/10 flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about attrition, headcount, leave..."
                  className="flex-1 bg-white/70 dark:bg-slate-800/70 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500 transition-all"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all shadow-sm"
                  title="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
