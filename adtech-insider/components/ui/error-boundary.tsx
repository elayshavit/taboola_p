"use client";

import { Component, type ReactNode } from "react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("[ErrorBoundary]", error, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-6">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground text-center max-w-md text-sm font-mono">
            {this.state.error.message}
          </p>
          <div className="flex gap-3">
            <Link
              href="/"
              className="rounded bg-primary text-primary-foreground px-4 py-2 text-sm"
            >
              Home
            </Link>
            <Link
              href="/company/taboola"
              className="rounded border border-border px-4 py-2 text-sm"
            >
              Try Taboola
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
