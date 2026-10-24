"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import { useAuthStore } from "@/lib/store/auth.store";
import toast from "react-hot-toast";

export interface StompNotification {
  id: string;
  recipientEmail: string;
  subject: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export function useWebSocket() {
  const { user, isAuthenticated, token } = useAuthStore();
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState<StompNotification | null>(null);
  const clientRef = useRef<Client | null>(null);

  const onNotificationReceived = useCallback((payload: StompNotification) => {
    setLatestNotification(payload);
    setUnreadCount((prev) => prev + 1);

    // Toast alert in real time across browser sessions
    toast(
      (t) => (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
            🔔
          </div>
          <div>
            <div className="font-semibold text-sm text-slate-100">{payload.subject}</div>
            <div className="text-xs text-slate-300 mt-0.5 line-clamp-2">{payload.message}</div>
          </div>
        </div>
      ),
      {
        duration: 5000,
        position: "top-right",
        style: {
          background: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          color: "#fff",
          borderRadius: "12px",
          padding: "12px 16px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
        },
      }
    );
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user?.email) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
        setConnected(false);
      }
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";

    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setConnected(true);

        // 1. Subscribe to personal queue
        client.subscribe("/user/queue/notifications", (message: IMessage) => {
          try {
            const data: StompNotification = JSON.parse(message.body);
            onNotificationReceived(data);
          } catch (e) {
            console.error("Failed to parse WebSocket message", e);
          }
        });

        // 2. Direct user channel fallback
        const userTopic = `/topic/notifications-${user.email}`;
        client.subscribe(userTopic, (message: IMessage) => {
          try {
            const data: StompNotification = JSON.parse(message.body);
            onNotificationReceived(data);
          } catch (e) {
            console.error("Failed to parse topic notification", e);
          }
        });

        // 3. Subscribe to company announcements
        client.subscribe("/topic/announcements", (message: IMessage) => {
          try {
            const announcement = JSON.parse(message.body);
            toast(
              `📢 Announcement: ${announcement.title}`,
              {
                duration: 6000,
                position: "top-right",
                style: {
                  background: "rgba(15, 23, 42, 0.95)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  color: "#fff",
                  borderRadius: "12px",
                },
              }
            );
          } catch (e) {}
        });
      },
      onDisconnect: () => {
        setConnected(false);
      },
      onStompError: (frame) => {
        console.warn("STOMP protocol error", frame.headers["message"]);
      },
      onWebSocketError: () => {
        setConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [isAuthenticated, user?.email, token, onNotificationReceived]);

  return {
    connected,
    unreadCount,
    setUnreadCount,
    latestNotification,
  };
}
