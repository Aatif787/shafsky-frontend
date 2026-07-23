import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { pageMono } from "@/components/site/PageShell";

interface ConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback to change open state */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Dialog description */
  description: string;
  /** Text for the confirm button */
  confirmLabel?: string;
  /** Text for the cancel button */
  cancelLabel?: string;
  /** Visual variant — danger uses red styling */
  variant?: "danger" | "warning";
  /** Callback when user confirms */
  onConfirm: () => void;
  /** Whether the confirm action is loading */
  loading?: boolean;
}

/**
 * Confirmation dialog for destructive actions.
 * Built on top of Radix AlertDialog for accessibility.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  loading,
}: ConfirmDialogProps) {
  const accentColor = variant === "danger" ? "#ef4444" : "#f59e0b";
  const accentBg = variant === "danger" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)";
  const accentBorder = variant === "danger" ? "rgba(239,68,68,0.25)" : "rgba(245,158,11,0.25)";

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 border border-white/10 bg-[#0c121b] p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <AlertDialog.Title
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ ...pageMono, color: accentColor }}
          >
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-3 text-xs text-white/60 leading-relaxed">
            {description}
          </AlertDialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <button
                className="px-4 py-2 text-[10px] uppercase tracking-wider font-mono text-white/60 border border-white/10 hover:bg-white/5 transition-colors"
                style={pageMono}
              >
                {cancelLabel}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="px-4 py-2 text-[10px] uppercase tracking-wider font-mono transition-colors disabled:opacity-50"
                style={{
                  ...pageMono,
                  color: accentColor,
                  background: accentBg,
                  border: `1px solid ${accentBorder}`,
                }}
              >
                {loading ? "Processing…" : confirmLabel}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
