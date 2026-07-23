import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { pageMono } from "@/components/site/PageShell";

interface EmptyStateProps {
  /** Icon component to display */
  icon?: LucideIcon;
  /** Title text */
  title: string;
  /** Optional description */
  description?: string;
}

/**
 * Reusable empty state for admin list pages when no data matches filters.
 */
export function EmptyState({ icon: Icon = Inbox, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.02]">
        <Icon className="h-6 w-6 text-white/25" />
      </div>
      <div className="text-sm font-semibold text-white/50">{title}</div>
      {description && (
        <p className="mt-1.5 max-w-xs text-xs text-white/30" style={pageMono}>
          {description}
        </p>
      )}
    </div>
  );
}
