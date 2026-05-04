import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error("[slithera] uncaught error:", error, info.componentStack);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  reload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <div className="wg-error-boundary" role="alert">
        <div className="wg-error-card">
          <div className="wg-error-eyebrow">· · · CRITICAL · · ·</div>
          <h1 className="wg-error-title">Something <span className="accent">slithered</span> wrong</h1>
          <pre className="wg-error-detail">{this.state.error.message}</pre>
          <div className="wg-error-actions">
            <button type="button" className="wg-cancel-btn" onClick={this.reset}>Try again</button>
            <button type="button" className="wg-equip-btn" onClick={this.reload}>Reload</button>
          </div>
        </div>
      </div>
    );
  }
}
