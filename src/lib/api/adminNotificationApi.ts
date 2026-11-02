/**
 * Admin Notifications API Client
 * Enterprise in-app notification services for authorized administrators.
 */

import { apiFetch } from "./client";
import { getAccessToken } from "@/auth/tokenStore";

export interface AdminNotificationItem {
  id: string;
  booking_id: string | null;
  booking_ref: string;
  service_category: string;
  service_type: string;
  customer_name: string;
  customer_phone: string | null;
  status: string;
  event_type: string;
  title: string;
  message: string;
  link: string;
  metadata_json: Record<string, any>;
  is_read: boolean;
  read_at: string | null;
  read_by_user_id: string | null;
  created_at: string;
}

export interface AdminNotificationsResult {
  success: boolean;
  notifications: AdminNotificationItem[];
  unread_count: number;
}

export async function getAdminNotifications(
  limit: number = 50,
  unreadOnly: boolean = false
): Promise<AdminNotificationsResult> {
  const token = getAccessToken() || "";
  const params = new URLSearchParams();
  if (limit) params.set("limit", String(limit));
  if (unreadOnly) params.set("unread_only", "true");

  const queryStr = params.toString() ? `?${params.toString()}` : "";
  const res = await apiFetch<AdminNotificationsResult>(
    `/api/admin/notifications${queryStr}`,
    {
      method: "GET",
      token,
      timeoutMs: 10000,
    }
  );

  if (!res.success) {
    throw new Error((res as any).error || "Failed to fetch admin notifications");
  }

  // Handle both { success: true, data: { notifications, unread_count } }
  // and { success: true, notifications, unread_count }
  const data = (res as any).data || res;
  return {
    success: true,
    notifications: Array.isArray(data.notifications) ? data.notifications : [],
    unread_count: typeof data.unread_count === "number" ? data.unread_count : 0,
  };
}

export async function markAdminNotificationRead(
  notificationId: string
): Promise<{ success: boolean; notification: AdminNotificationItem }> {
  const token = getAccessToken() || "";
  const res = await apiFetch<{ success: boolean; notification: AdminNotificationItem }>(
    `/api/admin/notifications/${notificationId}/read`,
    {
      method: "POST",
      token,
    }
  );

  if (!res.success) {
    throw new Error((res as any).error || "Failed to mark notification as read");
  }

  const data = (res as any).data || res;
  return data;
}

export async function markAllAdminNotificationsRead(): Promise<{
  success: boolean;
  marked_count: number;
}> {
  const token = getAccessToken() || "";
  const res = await apiFetch<{ success: boolean; marked_count: number }>(
    `/api/admin/notifications/read-all`,
    {
      method: "POST",
      token,
    }
  );

  if (!res.success) {
    throw new Error((res as any).error || "Failed to mark all notifications as read");
  }

  const data = (res as any).data || res;
  return data;
}

