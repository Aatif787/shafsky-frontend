/**
 * Enterprise Admin Real-Time Notifications Hook.
 * Manages Server-Sent Events (SSE) stream, React Query caching, unread badge, and action handlers.
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  type AdminNotificationItem,
  type AdminNotificationsResult,
} from "@/lib/api/adminNotificationApi";
import { getAccessToken } from "@/auth/tokenStore";
import { resolveApiUrl } from "@/lib/api/config";

export type ConnectionStatus = "connecting" | "connected" | "reconnecting" | "error" | "disconnected";

export function useAdminNotifications() {
  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const eventSourceRef = useRef<EventSource | null>(null);

  // 1. Initial and refresh data fetch via React Query
  const { data, isLoading, refetch } = useQuery<AdminNotificationsResult>({
    queryKey: ["admin-notifications"],
    queryFn: () => getAdminNotifications(50, false),
    refetchInterval: connectionStatus === "connected" ? 60000 : 15000, // Background fallback poll
    staleTime: 10000,
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unread_count || 0;

  // 2. Play subtle notification chime via Web Audio API (zero external assets needed)
  const playNotificationSound = useCallback(() => {
    try {
      if (typeof window === "undefined") return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio autoplay policies safely ignored
    }
  }, []);

  // 3. Establish SSE Connection for Real-Time Updates
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = getAccessToken();
    if (!token) {
      setConnectionStatus("disconnected");
      return;
    }

    setConnectionStatus("connecting");
    const streamUrl = resolveApiUrl(`/api/admin/notifications/stream?token=${encodeURIComponent(token)}`);
    const es = new EventSource(streamUrl);
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnectionStatus("connected");
    };

    es.addEventListener("connected", () => {
      setConnectionStatus("connected");
    });

    es.addEventListener("notification", (event: MessageEvent) => {
      try {
        const item: AdminNotificationItem = JSON.parse(event.data);
        if (!item || !item.booking_ref) return;

        // Play gentle chime
        playNotificationSound();

        // Show non-blocking toast
        toast.info(item.title, {
          description: item.message,
          duration: 9000,
          action: {
            label: "View",
            onClick: () => {
              if (item.link) {
                window.location.href = item.link;
              }
            },
          },
        });

        // Update React Query Cache immediately
        queryClient.setQueryData<AdminNotificationsResult>(["admin-notifications"], (old) => {
          if (!old) {
            return {
              success: true,
              notifications: [item],
              unread_count: 1,
            };
          }

          // Deduplicate by ID and booking_ref
          const alreadyExists = old.notifications.some(
            (n) => n.id === item.id || (n.booking_ref === item.booking_ref && n.event_type === item.event_type)
          );
          if (alreadyExists) return old;

          return {
            ...old,
            notifications: [item, ...old.notifications].slice(0, 100),
            unread_count: old.unread_count + 1,
          };
        });
      } catch (err) {
        console.error("Failed to parse admin notification SSE payload:", err);
      }
    });

    es.onerror = () => {
      // Browser EventSource automatically reconnects
      setConnectionStatus("reconnecting");
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [queryClient, playNotificationSound]);

  // 4. Mark single notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      // Optimistic update
      queryClient.setQueryData<AdminNotificationsResult>(["admin-notifications"], (old) => {
        if (!old) return old;
        const target = old.notifications.find((n) => n.id === notificationId);
        const wasUnread = target && !target.is_read;
        return {
          ...old,
          notifications: old.notifications.map((n) =>
            n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
          ),
          unread_count: wasUnread ? Math.max(0, old.unread_count - 1) : old.unread_count,
        };
      });

      try {
        await markAdminNotificationRead(notificationId);
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
        refetch();
      }
    },
    [queryClient, refetch]
  );

  // 5. Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    queryClient.setQueryData<AdminNotificationsResult>(["admin-notifications"], (old) => {
      if (!old) return old;
      return {
        ...old,
        notifications: old.notifications.map((n) => ({
          ...n,
          is_read: true,
          read_at: new Date().toISOString(),
        })),
        unread_count: 0,
      };
    });

    try {
      await markAllAdminNotificationsRead();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      refetch();
    }
  }, [queryClient, refetch]);

  return {
    notifications,
    unreadCount,
    connectionStatus,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch,
  };
}

