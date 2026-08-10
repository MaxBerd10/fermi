import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-transparent">
        <div className="page-card text-center max-w-sm p-8">
          <div className="w-16 h-16 rounded-full bg-[#0a1158]/10 text-[#0a1158] flex items-center justify-center mx-auto mb-6">
            <i className="ri-error-warning-line text-2xl" />
          </div>
          <h1 className="font-heading text-xl font-semibold text-[#0a0a0a] mb-2">Xatolik yuz berdi</h1>
          <p className="text-sm text-[#555555] mb-6 leading-relaxed">
            Sahifani ko&apos;rsatishda kutilmagan xatolik yuz berdi. Iltimos, sahifani qayta yuklab ko&apos;ring.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0a1158] hover:bg-[#060a3d] text-white text-sm font-semibold cursor-pointer transition-colors"
          >
            <i className="ri-refresh-line" />
            Sahifani yangilash
          </button>
        </div>
      </div>
    );
  }
}
