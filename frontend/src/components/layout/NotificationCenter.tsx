"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, CheckCheck, Clock, Calendar, Briefcase, Megaphone, Shield, X, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import { useWebSocket, StompNotification } from "@/lib/hooks/useWebSocket";
import { useAuthStore } from "@/lib/store/auth.store";

export function NotificationCenter() {
  const { isAuthenticated, user } = useAuthStore();
  const { connected, unreadCount, setUnreadCount, latestNotification } = useWebSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<StompNotification[]>([]);
  const [filterUnread, setFilterUnread] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const [listRes, countRes] = await Promise.allSettled([
        api.get("/notifications?size=25"),
        api.get("/notifications/unread-count"),
      ]);

      if (listRes.status === "fulfilled") {
        setNotifications(listRes.value.data.content || []);
      }
      if (countRes.status === "fulfilled") {
        setUnreadCount(countRes.value.data.unreadCount || 0);
      }
    } catch (e) {
      console.warn("Could not fetch notifications", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (latestNotification) {
      setNotifications((prev) => [latestNotification, ...prev]);
    }
  }, [latestNotification]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case "LEAVE":
        return <Calendar className="w-4 h-4 text-emerald-400" />;
      case "ATTENDANCE":
        return <Clock className="w-4 h-4 text-blue-400" />;
      case "PAYROLL":
        return <Briefcase className="w-4 h-4 text-amber-400" />;
      case "ANNOUNCEMENT":
        return <Megaphone className="w-4 h-4 text-violet-400" />;
      default:
        return <Shield className="w-4 h-4 text-indigo-400" />;
    }
  };

  const filtered = filterUnread ? notifications.filter((n) => !n.isRead) : notifications;

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
        aria-label="Open notifications"
        title={connected ? "Real-time sync active" : "Reconnecting STOMP..."}
      >
        <Bell className="w-5 h-5" />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-900 animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        {/* Real-time Connection Indicator Dot */}
        <span
          className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${
            connected ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-amber-400/70"
          }`}
          title={connected ? "WebSocket Connected" : "WebSocket Disconnected"}
        />
      </button>

      {/* Glassmorphic Dropdown Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 mt-3 w-84 sm:w-96 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700/60 shadow-2xl z-50 overflow-hidden text-slate-200"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-800/40">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight text-white">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Read all</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="px-4 py-2 border-b border-slate-800/50 flex gap-2 text-xs bg-slate-950/30">
              <button
                onClick={() => setFilterUnread(false)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  !filterUnread ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterUnread(true)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filterUnread ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Unread only
              </button>
            </div>

            {/* Notification List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/40">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading alerts...</div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-slate-800/60 flex items-center justify-center text-slate-500">
                    <Bell className="w-5 h-5 opacity-40" />
                  </div>
                  No {filterUnread ? "unread " : ""}notifications right now
                </div>
              ) : (
                filtered.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!item.isRead) handleMarkAsRead(item.id);
                      if (item.link) window.location.href = item.link;
                    }}
                    className={`p-3.5 hover:bg-white/[0.04] transition-all cursor-pointer flex items-start gap-3 relative ${
                      !item.isRead ? "bg-indigo-950/20" : ""
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      {getTypeIcon(item.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-semibold truncate ${!item.isRead ? "text-indigo-200" : "text-slate-300"}`}>
                          {item.subject}
                        </span>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/30 text-[10px] text-slate-500">
                        <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {!item.isRead && (
                          <button
                            onClick={(e) => handleMarkAsRead(item.id, e)}
                            className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer with connection status */}
            <div className="p-3 bg-slate-950/50 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-400" : "bg-amber-400"}`} />
                {connected ? "Real-time STOMP active" : "Connecting..."}
              </span>
              <span className="text-[10px] text-slate-500">Port 8080 · WebSocket</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
