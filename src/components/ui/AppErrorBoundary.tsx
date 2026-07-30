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
        <div className="flex min-h-[450px] w-full items-center justify-center p-6 bg-[#06090f] text-white">
          <div className="max-w-lg w-full rounded-[32px] border border-[#c5a059]/40 bg-gradient-to-br from-[#0c1422] to-[#060a12] p-8 sm:p-10 text-center shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#c5a059]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#c5a059]/15 border border-[#c5a059]/40 text-[#c5a059]">
              <RefreshCw className="h-6 w-6 animate-spin" style={{ animationDuration: "8s" }} />
            </div>

            <div className="space-y-2 relative z-10">
              <span className="px-3 py-1 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/30 text-[#c5a059] text-[10px] font-mono uppercase tracking-[0.25em]">
                Concierge Auto-Recovery Active
              </span>
              <h2 className="text-2xl font-serif text-white font-light pt-2" style={{ fontFamily: "'Fraunces', serif" }}>
                Session Auto-Recovery
              </h2>
              <p className="text-xs text-white/70 leading-relaxed font-sans">
                Our operational command desk has automatically isolated this view to maintain uninterrupted site navigation. Click below to refresh this component.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#c5a059] to-[#d4c09d] px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#081119] shadow-lg hover:scale-105 transition-all font-mono"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reload Component</span>
              </button>

              <a
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-white/20 transition-all font-mono border border-white/15"
              >
                <Home className="h-4 w-4 text-[#c5a059]" />
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
