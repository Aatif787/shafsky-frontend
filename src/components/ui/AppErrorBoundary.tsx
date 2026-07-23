import React, { Component, type ReactNode } from "react";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error(`[AppErrorBoundary${this.props.name ? `:${this.props.name}` : ""}] Caught exception:`, error, errorInfo);
    try {
      reportLovableError(error, {
        boundary: this.props.name || "AppErrorBoundary",
        componentStack: errorInfo.componentStack,
      });
    } catch {
      // Ignore fallback logger failure
    }
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] w-full items-center justify-center p-6 bg-[#06090f] text-white">
          <div className="max-w-md w-full rounded-2xl border border-red-500/20 bg-[#0d1424] p-8 text-center shadow-2xl space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-500/30">
              <AlertTriangle className="h-7 w-7 text-red-400 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold uppercase tracking-wider text-red-400 font-mono">
                Component Recovery Required
              </h2>
              <p className="text-xs text-white/60 leading-relaxed">
                An unforeseen system exception occurred while rendering this section. Our automated recovery handlers have logged the incident.
              </p>
              {this.state.error && (
                <div className="mt-3 overflow-hidden rounded-lg bg-black/40 p-3 text-left border border-white/5">
                  <p className="text-[11px] font-mono text-red-300/90 truncate">
                    {this.state.error.name}: {this.state.error.message}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-white/20 transition-all font-mono"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Try Again</span>
              </button>
              <a
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-transparent px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white/80 hover:bg-white/5 transition-all font-mono"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Return Home</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
