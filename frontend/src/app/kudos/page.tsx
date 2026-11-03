"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Heart,
  Sparkles,
  Users,
  Plus,
  Gift,
  Coffee,
  CheckCircle2,
  TrendingUp,
  X,
  MessageSquare,
  ThumbsUp,
  Smile
} from "lucide-react";
import toast from "react-hot-toast";
import { getStoredEmployees, generateKudosPosts } from "@/lib/demo-data-generator";

interface KudosPost {
  id: string;
  senderName: string;
  senderRole: string;
  receiverName: string;
  receiverRole: string;
  badge: "Innovation" | "Collaboration" | "Execution" | "Customer Delight";
  points: number;
  message: string;
  likes: number;
  timeAgo: string;
}

export default function KudosHubPage() {
  const [walletPoints, setWalletPoints] = useState(850);
  const [showSendModal, setShowSendModal] = useState(false);
  const [recipient, setRecipient] = useState("Aditi Sharma");
  const [selectedBadge, setSelectedBadge] = useState<KudosPost["badge"]>("Innovation");
  const [pointsToSend, setPointsToSend] = useState(50);
  const [kudosNote, setKudosNote] = useState("");

  const [kudosFeed, setKudosFeed] = useState<KudosPost[]>(() => {
    return generateKudosPosts(getStoredEmployees());
  });

  const handleLike = (id: string) => {
    setKudosFeed((prev) =>
      prev.map((k) => (k.id === id ? { ...k, likes: k.likes + 1 } : k))
    );
    toast("Kudos cheered! 🎉", { icon: "❤️" });
  };

  const handleSendKudos = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kudosNote.trim()) return;

    const newKudos: KudosPost = {
      id: `kudos-${Date.now()}`,
      senderName: "You (Staff Member)",
      senderRole: "Employee",
      receiverName: recipient,
      receiverRole: "Team Member",
      badge: selectedBadge,
      points: pointsToSend,
      message: kudosNote,
      likes: 1,
      timeAgo: "Just now",
    };

    setKudosFeed([newKudos, ...kudosFeed]);
    setShowSendModal(false);
    setKudosNote("");
    toast.success(`Sent ${pointsToSend} Kudos Points to ${recipient}!`);
  };

  const handleRedeemPerk = (perkName: string, cost: number) => {
    if (walletPoints < cost) {
      toast.error("Insufficient Nexus Points balance");
      return;
    }
    setWalletPoints((prev) => prev - cost);
    toast.success(`Redeemed "${perkName}"! Voucher code sent to your email.`);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-y-auto lg:overflow-hidden gap-3 font-sans pop-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Peer Kudos & Gamified Rewards Hub
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              </h1>
              <p className="text-xs text-white/50">
                Celebrate team milestones, send micro-bonuses, and redeem points for corporate perks.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowSendModal(true)}
          className="px-4 py-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Send Kudos to Colleague</span>
        </button>
      </div>

      {/* Main Grid: Feed + Wallet & Perks */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
        {/* Left Column (8 cols): Live Kudos Activity Stream */}
        <div className="lg:col-span-8 flex flex-col gap-3 min-h-0 overflow-y-auto pr-1">
          {kudosFeed.map((kudos) => (
            <motion.div
              key={kudos.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 sm:p-5 rounded-3xl space-y-3 pop-card"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {kudos.senderName[0]}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 flex-wrap">
                      <span>{kudos.senderName}</span>
                      <span className="text-white/40 font-normal">recognized</span>
                      <span className="text-orange-400 font-bold">{kudos.receiverName}</span>
                    </div>
                    <span className="text-[10px] text-white/40 block">
                      {kudos.senderRole} → {kudos.receiverRole} · {kudos.timeAgo}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    💡 {kudos.badge}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    +{kudos.points} Pts
                  </span>
                </div>
              </div>

              <p className="text-xs text-white/80 leading-relaxed pl-13">
                &ldquo;{kudos.message}&rdquo;
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 pl-13">
                <button
                  onClick={() => handleLike(kudos.id)}
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-400/20" />
                  <span className="font-semibold">{kudos.likes} Cheers</span>
                </button>
                <span className="text-[10px] text-white/40">Nexus Culture Recognition</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Column (4 cols): Nexus Rewards Wallet & Redeemable Perks */}
        <div className="lg:col-span-4 flex flex-col gap-3 min-h-0">
          {/* Wallet Balance Card */}
          <div className="glass-card p-4 sm:p-5 rounded-3xl space-y-3 bg-gradient-to-br from-orange-500/10 to-amber-500/5 border-orange-500/20">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
                My Rewards Wallet
              </span>
              <Sparkles className="w-4 h-4 text-orange-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">{walletPoints}</h2>
              <span className="text-xs text-orange-400 font-semibold font-mono">Nexus Points</span>
            </div>
            <p className="text-[11px] text-white/50">
              Earned from peer cheers and quarterly achievements. Redeemable for company wellness and lifestyle perks.
            </p>
          </div>

          {/* Perks Store */}
          <div className="glass-card p-4 sm:p-5 rounded-3xl flex-1 flex flex-col space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-amber-400" />
              Redeemable Company Perks
            </h3>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Coffee className="w-3.5 h-3.5 text-orange-400" />
                    Starbucks Coffee Voucher
                  </h4>
                  <span className="text-[10px] text-white/40">150 Points</span>
                </div>
                <button
                  onClick={() => handleRedeemPerk("Starbucks Coffee Voucher", 150)}
                  className="px-2.5 py-1 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-[10px] font-bold border border-orange-500/20 transition-all cursor-pointer"
                >
                  Redeem
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-indigo-400" />
                    NexusHR Swag Hoodie
                  </h4>
                  <span className="text-[10px] text-white/40">500 Points</span>
                </div>
                <button
                  onClick={() => handleRedeemPerk("NexusHR Swag Hoodie", 500)}
                  className="px-2.5 py-1 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-bold border border-indigo-500/20 transition-all cursor-pointer"
                >
                  Redeem
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Extra 0.5 Day Wellness Off
                  </h4>
                  <span className="text-[10px] text-white/40">800 Points</span>
                </div>
                <button
                  onClick={() => handleRedeemPerk("Extra 0.5 Day Wellness Off", 800)}
                  className="px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 transition-all cursor-pointer"
                >
                  Redeem
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SEND KUDOS MODAL
          ========================================================================= */}
      <AnimatePresence>
        {showSendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card max-w-md w-full p-6 rounded-3xl relative border border-white/15"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-white">Send Kudos Recognition</h3>
                </div>
                <button onClick={() => setShowSendModal(false)} className="p-1 rounded-lg text-white/40 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSendKudos} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-white/60 uppercase mb-1">
                    Select Colleague
                  </label>
                  <select
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#141824] border border-white/10 text-white text-xs outline-none focus:border-orange-500/50"
                  >
                    <option value="Aditi Sharma">Aditi Sharma (Senior Developer)</option>
                    <option value="Vikram Patel">Vikram Patel (Engineering Manager)</option>
                    <option value="Priya Nair">Priya Nair (HR Lead)</option>
                    <option value="Rahul Verma">Rahul Verma (Systems Architect)</option>
                    <option value="Ananya Sen">Ananya Sen (CHRO)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-white/60 uppercase mb-1">
                      Core Value Badge
                    </label>
                    <select
                      value={selectedBadge}
                      onChange={(e) => setSelectedBadge(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#141824] border border-white/10 text-white text-xs outline-none focus:border-orange-500/50"
                    >
                      <option value="Innovation">💡 Innovation</option>
                      <option value="Collaboration">🤝 Collaboration</option>
                      <option value="Execution">🎯 Execution</option>
                      <option value="Customer Delight">🚀 Customer Delight</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-white/60 uppercase mb-1">
                      Points to Award
                    </label>
                    <select
                      value={pointsToSend}
                      onChange={(e) => setPointsToSend(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#141824] border border-white/10 text-white text-xs outline-none focus:border-orange-500/50"
                    >
                      <option value={25}>25 Points</option>
                      <option value={50}>50 Points</option>
                      <option value={75}>75 Points</option>
                      <option value={100}>100 Points</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-white/60 uppercase mb-1">
                    Appreciation Message
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={kudosNote}
                    onChange={(e) => setKudosNote(e.target.value)}
                    placeholder="Tell your team why this person is awesome..."
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-orange-500/50 resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSendModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-lg shadow-orange-500/20"
                  >
                    Send Kudos & Points
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
