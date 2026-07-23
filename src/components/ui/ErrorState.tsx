import { AlertTriangle, RefreshCw } from "lucide-react";
import { Panel, pageMono } from "@/components/site/PageShell";

interface ErrorStateProps {
  /** Contextual message describing what failed */
  message: string;
  /** Optional help text with suggested next steps */
  helpText?: string;
  /** Retry callback — if provided, renders a retry button */
  onRetry?: () => void;
  /** Whether the retry is currently in progress */
  retrying?: boolean;
}

/**
 * Reusable error state for admin pages.
 * Displays a contextual error message with optional retry button.
 */
export function ErrorState({ message, helpText, onRetry, retrying }: ErrorStateProps) {
  return (
    <Panel tone="dark" className="p-6 border border-red-500/20 bg-red-500/5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
        <div className="space-y-2 min-w-0">
          <span className="text-sm font-semibold block">{message}</span>
          {helpText && <p className="text-xs text-white/50">{helpText}</p>}
          {onRetry && (
            <button
              onClick={onRetry}
              disabled={retrying}
              className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-wider font-mono border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              style={pageMono}
            >
              <RefreshCw className={`h-3 w-3 ${retrying ? "animate-spin" : ""}`} />
              {retrying ? "Retrying…" : "Retry"}
            </button>
          )}
        </div>
      </div>
    </Panel>
  );
}
