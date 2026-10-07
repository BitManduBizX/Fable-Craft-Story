import React, { Component, ErrorInfo, ReactNode } from 'react';
import { BookOpen, RefreshCw, Sparkles } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FableCraft Caught Runtime Exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center p-6 text-[#1D3557]">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border-2 border-[#E63946]/20 text-center">
            <div className="w-16 h-16 bg-[#FFF4E6] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#E63946]">
              <BookOpen className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold font-serif-title text-[#1D3557] mb-2">
              A Page Got Fluttered!
            </h2>
            <p className="text-stone-600 text-sm mb-6 leading-relaxed">
              FableCraft encountered a brief breeze in the storybook. Don't worry, your magical bookmarks and stories are safe.
            </p>
            {this.state.error && (
              <div className="bg-[#FFFDF5] p-3 rounded-xl border border-stone-200 text-xs text-stone-500 font-mono mb-6 text-left overflow-auto max-h-24">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#E63946] hover:bg-[#d02c39] text-white font-medium rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 animate-spin-once" />
              <span>Reopen the Storybook</span>
            </button>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-amber-600">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Timeless Stories, Magical Moments</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
