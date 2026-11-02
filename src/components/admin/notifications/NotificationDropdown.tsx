/**
 * Enterprise Admin Notification Dropdown List.
 * Displays notifications, relative time, status pills, and actions.
 */

import React from "react";
import { Link } from "@tanstack/react-router";
import {
  CheckCheck,
  Check,
  PlaneTakeoff,
  Clock,
  ExternalLink,
  ShieldAlert,
  Loader2,
  BellOff,
  Radio,
} from "lucide-react";
import type { AdminNotificationItem } from "@/lib/api/adminNotificationApi";
import type { ConnectionStatus } from "@/hooks/useAdminNotifications";
import { pageMono } from "@/components/site/PageShell";

interface NotificationDropdownProps {
  notifications: AdminNotificationItem[];
  unreadCount: number;
  connectionStatus: ConnectionStatus;
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
}

function formatRelativeTime(dateStr: string): string {
  try {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 30) return "Just now";
    if (diff < 60) return `${diff}s ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return "";
  }
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  unreadCount,
  connectionStatus,
  isLoading,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
}) => {
  return (
    <div
      role="dialog"
      aria-label="Admin Notifications"
      className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#090d16] border border-white/10 shadow-2xl backdrop-blur-xl z-50 overflow-hidden flex flex-col max-h-[80vh]"
    >
      {/* Dropdown Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 bg-[#0c121e]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs uppercase tracking-wider text-white" style={pageMono}>
            Notifications
          </span>
          {unreadCount > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#5ed3ff]/15 text-[#5ed3ff] border border-[#5ed3ff]/30"
              style={pageMono}
            >
              {unreadCount > 99 ? "99+" : unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-white/50 hover:text-[#5ed3ff] transition-colors cursor-pointer"
            style={pageMono}
          >
            <CheckCheck size={13} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Connection Status Banner (if reconnecting or error) */}
      {connectionStatus === "reconnecting" && (
        <div className="px-3.5 py-1.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-400 text-[10px] font-mono flex items-center gap-2">
          <Radio size={12} className="animate-pulse" />
          <span>Reconnecting to real-time notification stream...</span>
        </div>
      )}

      {/* Notification List Container */}
      <div className="overflow-y-auto divide-y divide-white/5 flex-1 max-h-[380px]">
        {isLoading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-white/40 gap-2">
            <Loader2 size={20} className="animate-spin text-[#5ed3ff]" />
            <span className="text-xs font-mono">Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/40 gap-2 px-6 text-center">
            <BellOff size={28} className="text-white/20 mb-1" />
            <span className="text-xs font-semibold text-white/70">No notifications yet</span>
            <span className="text-[11px] text-white/40">
              New bookings and quote enquiries will appear here in real time.
            </span>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`group relative p-3.5 transition-colors flex items-start gap-3 hover:bg-white/[0.03] ${
                !item.is_read ? "bg-white/[0.02]" : "opacity-75"
              }`}
            >
              {/* Unread indicator / Icon */}
              <div className="mt-0.5 shrink-0">
                {!item.is_read ? (
                  <span className="w-2 h-2 rounded-full bg-[#5ed3ff] block animate-pulse mt-1" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-white/20 block mt-1" />
                )}
              </div>

              {/* Notification Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5ed3ff] truncate"
                    style={pageMono}
                  >
                    {item.service_category}
                  </span>
                  <span className="text-[9px] font-mono text-white/40 shrink-0">
                    {formatRelativeTime(item.created_at)}
                  </span>
                </div>

                <div className="text-xs font-semibold text-white/95 leading-snug line-clamp-2">
                  {item.title}
                </div>

                <div className="text-[11px] text-white/60 mt-0.5 line-clamp-2 leading-relaxed">
                  {item.message}
                </div>

                {/* Footer details & Navigation link */}
                <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-white/5">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-white/40">
                    <span className="text-white/70 font-semibold">{item.booking_ref}</span>
                    {item.status && (
                      <span className="px-1.5 py-0.2 rounded bg-white/5 text-[9px] text-white/60">
                        {item.status}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!item.is_read && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(item.id);
                        }}
                        className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                        title="Mark as read"
                      >
                        <Check size={12} />
                      </button>
                    )}

                    <a
                      href={item.link || `/admin/operations?search=${item.booking_ref}`}
                      onClick={() => {
                        if (!item.is_read) {
                          onMarkAsRead(item.id);
                        }
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-[#5ed3ff] hover:text-[#5ed3ff]/80 transition-colors"
                    >
                      <span>Open</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dropdown Footer */}
      <div className="p-2 border-t border-white/10 bg-[#0c121e] text-center">
        <Link
          to="/admin/operations"
          onClick={onClose}
          className="block py-1.5 text-[10px] font-mono uppercase tracking-widest text-white/50 hover:text-white transition-colors"
          style={pageMono}
        >
          View Operations Console →
        </Link>
      </div>
    </div>
  );
};

