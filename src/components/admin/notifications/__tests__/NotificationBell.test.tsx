import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { NotificationDropdown } from "../NotificationDropdown";
import { NotificationBell } from "../NotificationBell";
import type { AdminNotificationItem } from "@/lib/api/adminNotificationApi";

// Mock TanStack Router Link
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, ...props }: any) => (
    <a href={typeof to === "string" ? to : "/"} {...props}>
      {children}
    </a>
  ),
}));

// Mock the hook
vi.mock("@/hooks/useAdminNotifications", () => ({
  useAdminNotifications: () => ({
    notifications: [],
    unreadCount: 5,
    connectionStatus: "connected",
    isLoading: false,
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    refetch: vi.fn(),
  }),
}));

const mockNotification: AdminNotificationItem = {
  id: "notif-123",
  booking_id: "book-123",
  booking_ref: "BK-DEL-101",
  service_category: "Airport Meet & Greet",
  service_type: "Elite VIP Arrival",
  customer_name: "Aarif Khan",
  customer_phone: "+919876543210",
  status: "CONFIRMED",
  event_type: "BOOKING_CREATED",
  title: "New Airport Meet & Greet (BK-DEL-101)",
  message: "Aarif Khan booked Elite VIP Arrival at DEL",
  link: "/admin/operations?search=BK-DEL-101",
  metadata_json: {},
  is_read: false,
  read_at: null,
  read_by_user_id: null,
  created_at: new Date().toISOString(),
};

describe("NotificationDropdown Component", () => {
  it("renders empty state when there are no notifications", () => {
    const html = renderToString(
      <NotificationDropdown
        notifications={[]}
        unreadCount={0}
        connectionStatus="connected"
        isLoading={false}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(html).toContain("No notifications yet");
    expect(html).toContain("New bookings and quote enquiries will appear here in real time.");
  });

  it("renders notification items, category, and booking ref", () => {
    const html = renderToString(
      <NotificationDropdown
        notifications={[mockNotification]}
        unreadCount={1}
        connectionStatus="connected"
        isLoading={false}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(html).toContain("Airport Meet &amp; Greet");
    expect(html).toContain("BK-DEL-101");
    expect(html).toContain("Aarif Khan booked Elite VIP Arrival at DEL");
    expect(html).toContain("Mark all read");
  });

  it("caps unread badge at 99+ when count exceeds 99", () => {
    const html = renderToString(
      <NotificationDropdown
        notifications={[mockNotification]}
        unreadCount={145}
        connectionStatus="connected"
        isLoading={false}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(html).toContain("99+");
    expect(html).toContain("new");
  });

  it("shows reconnecting banner when connection status is reconnecting", () => {
    const html = renderToString(
      <NotificationDropdown
        notifications={[]}
        unreadCount={0}
        connectionStatus="reconnecting"
        isLoading={false}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(html).toContain("Reconnecting to real-time notification stream...");
  });
});

describe("NotificationBell Component", () => {
  it("renders notification bell with unread badge", () => {
    const html = renderToString(<NotificationBell />);
    expect(html).toContain("Notifications (5 unread)");
    expect(html).toContain("5");
  });
});
