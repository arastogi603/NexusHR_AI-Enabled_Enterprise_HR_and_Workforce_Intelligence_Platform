"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Send,
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  RotateCcw,
  ShieldCheck,
  User as UserIcon,
  Settings,
  Key,
  Check,
  AlertCircle,
  Cpu
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth.store";
import { queryGemini } from "@/lib/ai/geminiService";
import { queryOfflineLlm } from "@/lib/ai/offlineLlm";
import toast from "react-hot-toast";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  source?: "GEMINI_LIVE" | "OFFLINE_LLM";
  modelUsed?: string;
  suggestedActions?: string[];
  timestamp: string;
}

export function NexusAiChatWidget() {
  const { user, isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [geminiKey, setGeminiKey] = useState("");
  const [inputKey, setInputKey] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load API key from env or localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem("nexus_gemini_api_key") || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    if (savedKey) {
      setGeminiKey(savedKey);
      setInputKey(savedKey);
    }
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-welcome",
      sender: "assistant",
      text: "Hello! I am Nexus AI, your enterprise workforce intelligence assistant. I operate in dual-mode: powered by **Google Gemini API** when online, and backed by the **Nexus Offline LLM Reasoning Engine** with zero downtime.",
      source: "OFFLINE_LLM",
      modelUsed: "Nexus-Workforce-LLM-v2",
      suggestedActions: [
        "What is my leave balance?",
        "What is the biometric shift grace period?",
        "Explain Section 115BAC tax deductions",
        "Show company headcount and attrition"
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputKey.trim();
    setGeminiKey(clean);
    if (clean) {
      localStorage.setItem("nexus_gemini_api_key", clean);
      toast.success("Google Gemini API Key saved!");
    } else {
      localStorage.removeItem("nexus_gemini_api_key");
      toast("Operating in Nexus Offline LLM Engine mode.", { icon: "🧠" });
    }
    setShowKeyModal(false);
  };

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

    const userContext = {
      name: user?.name || user?.email?.split("@")[0] || "Team Member",
      email: user?.email || "user@nexushr.demo",
      role: user?.role || "EMPLOYEE",
    };

    // 1. Try Google Gemini API if key is present
    if (geminiKey) {
      try {
        const historyForGemini = messages.slice(-6).map((m) => ({
          role: m.sender === "user" ? ("user" as const) : ("model" as const),
          parts: [{ text: m.text }],
        }));

        const geminiRes = await queryGemini(textToSend, geminiKey, userContext, historyForGemini);
        const aiMsg: ChatMessage = {
          id: "gemini-" + Date.now(),
          sender: "assistant",
          text: geminiRes.reply,
          source: "GEMINI_LIVE",
          modelUsed: geminiRes.modelUsed,
          suggestedActions: geminiRes.suggestedQuestions,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setLoading(false);
        return;
      } catch (err: any) {
        console.warn("Gemini API error, falling back to Offline LLM:", err.message);
        toast("Gemini API limit reached. Using Offline LLM reasoning engine.", { icon: "🧠" });
      }
    }

    // 2. Intelligent Offline LLM Fallback
    try {
      // Simulate minor token generation pause for authentic LLM feel
      await new Promise((r) => setTimeout(r, 400));
      const offlineRes = queryOfflineLlm(textToSend, userContext);
      const aiMsg: ChatMessage = {
        id: "offline-llm-" + Date.now(),
        sender: "assistant",
        text: offlineRes.reply,
        source: "OFFLINE_LLM",
        modelUsed: offlineRes.modelUsed,
        suggestedActions: offlineRes.suggestedQuestions,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errFallback: ChatMessage = {
        id: "err-" + Date.now(),
        sender: "assistant",
        text: "I am ready to assist with your HR questions. Please ask about leaves, shift attendance, statutory payroll, or company policies.",
        source: "OFFLINE_LLM",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errFallback]);
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
        source: geminiKey ? "GEMINI_LIVE" : "OFFLINE_LLM",
        modelUsed: geminiKey ? "gemini-1.5-flash" : "Nexus-Workforce-LLM-v2",
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
      {/* Draggable Circular Floating Trigger Button */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.15}
        whileDrag={{ scale: 1.12, cursor: "grabbing" }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-6 right-6 z-50 select-none touch-none ${isOpen ? "hidden" : "block"}`}
      >
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 text-white flex items-center justify-center shadow-2xl shadow-orange-500/40 border-2 border-white/20 hover:border-orange-300 transition-all cursor-grab active:cursor-grabbing group relative"
          title="Nexus AI Assistant · Drag to move anywhere"
          aria-label="Open Nexus AI Assistant"
        >
          <div className="relative flex items-center justify-center pointer-events-none">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white/50 shadow-sm" />
          </div>

          {/* Quick hover label */}
          <span className="absolute -top-8 px-2.5 py-1 rounded-lg bg-slate-900/95 dark:bg-[#121622]/95 backdrop-blur-md text-[10px] font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10">
            Nexus AI (Drag me)
          </span>
        </button>
      </motion.div>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 font-sans ${
            isMinimized
              ? "bottom-6 right-6 w-72 h-14"
              : "bottom-4 right-4 sm:bottom-6 sm:right-6 w-[92vw] sm:w-[440px] h-[580px] max-h-[85vh]"
          } rounded-3xl bg-[#0d111d]/95 dark:bg-[#090d16]/95 backdrop-blur-2xl border border-white/15 shadow-2xl flex flex-col overflow-hidden`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-white/[0.04] border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">Nexus AI Assistant</h3>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold border flex items-center gap-1 ${
                      geminiKey
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${geminiKey ? "bg-emerald-400 animate-pulse" : "bg-indigo-400"}`} />
                    {geminiKey ? "Gemini Live" : "Offline LLM"}
                  </span>
                </div>
                <p className="text-[10px] text-white/50">
                  {geminiKey ? "Google Generative AI 1.5 Flash" : "Nexus In-Browser Reasoning Engine"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowKeyModal(!showKeyModal)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
                title="Configure Google Gemini API Key"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={clearChat}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
                title="Clear Conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* API Key Configuration Modal Overlay */}
          {showKeyModal && (
            <div className="p-3.5 bg-black/80 border-b border-white/10 shrink-0 text-xs text-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-orange-400">
                  <Key className="w-3.5 h-3.5" /> Google Gemini API Key
                </span>
                <button onClick={() => setShowKeyModal(false)} className="text-white/40 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-white/60">
                Enter your Google Gemini API key to activate live generative AI. If empty or offline, Nexus automatically operates via its internal Offline LLM Engine.
              </p>
              <form onSubmit={handleSaveKey} className="flex items-center gap-1.5">
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/15 text-white text-xs outline-none focus:border-orange-500/60"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
                >
                  Save
                </button>
              </form>
            </div>
          )}

          {/* Body */}
          {!isMinimized && (
            <>
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"} space-y-1`}
                  >
                    <div className="flex items-center gap-1.5 px-1">
                      {msg.sender === "user" ? (
                        <span className="text-[10px] text-white/40 font-medium">You · {msg.timestamp}</span>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] text-orange-400 font-semibold">
                          <span>Nexus AI</span>
                          {msg.source && (
                            <span className="text-[9px] text-white/40 font-mono">
                              ({msg.source === "GEMINI_LIVE" ? "Gemini 1.5 Flash" : "Offline LLM"})
                            </span>
                          )}
                          <span className="text-white/30 font-normal">· {msg.timestamp}</span>
                        </div>
                      )}
                    </div>

                    <div
                      className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 rounded-tr-none font-medium"
                          : "bg-white/[0.05] border border-white/10 text-white/90 rounded-tl-none font-normal"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Suggested Action Chips */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1.5 max-w-[95%]">
                        {msg.suggestedActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(action)}
                            className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] text-white/70 hover:text-white border border-white/10 text-[10.5px] transition-all text-left cursor-pointer"
                          >
                            {action} →
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/[0.04] border border-white/10 w-fit">
                    <Sparkles className="w-4 h-4 text-orange-400 animate-spin" />
                    <span className="text-xs text-white/60">
                      {geminiKey ? "Querying Google Gemini API..." : "Nexus LLM reasoning engine synthesizing..."}
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <div className="p-3 bg-white/[0.02] border-t border-white/10 shrink-0">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about leaves, attendance, payroll, or policies..."
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-2xl bg-white/[0.05] border border-white/10 text-white placeholder-white/30 text-xs outline-none focus:border-orange-500/50 transition-colors"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || loading}
                    className="absolute right-2 p-1.5 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-md disabled:opacity-40 transition-all cursor-pointer"
                    title="Send Prompt"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between text-[10px] text-white/40 mt-1.5 px-1">
                  <span>Press Enter to send</span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> RBAC Protected
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
