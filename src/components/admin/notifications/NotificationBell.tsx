/**
 * Enterprise Admin Notification Bell Component.
 * Integrates into the admin header/navbar with badge count and dropdown panel.
 */

import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { NotificationDropdown } from "./NotificationDropdown";

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    connectionStatus,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useAdminNotifications();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const badgeDisplay = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#5ed3ff]/40"
      >
        <Bell size={18} className={unreadCount > 0 ? "text-[#5ed3ff]" : "text-white/70"} />

        {/* Real-time Connection Status Dot */}
        <span
          className={`absolute bottom-1 right-1 w-2 h-2 rounded-full border border-[#090d16] ${
            connectionStatus === "connected"
              ? "bg-emerald-400"
              : connectionStatus === "reconnecting"
                ? "bg-amber-400 animate-pulse"
                : "bg-white/20"
          }`}
          title={`Status: ${connectionStatus}`}
        />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-lg border border-[#090d16] leading-none animate-in fade-in zoom-in duration-200">
            {badgeDisplay}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          connectionStatus={connectionStatus}
          isLoading={isLoading}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

