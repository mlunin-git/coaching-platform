"use client";

import React, { ReactNode } from "react";

interface SectionErrorBoundaryProps {
  children: ReactNode;
  section?: string;
}

interface SectionErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class SectionErrorBoundary extends React.Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const section = this.props.section || "Section";
    console.error(`Error in ${section}:`, error);
    console.error("Component stack:", errorInfo.componentStack);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-900 mb-2">
            Failed to load {this.props.section || "this section"}
          </h3>
          <p className="text-sm text-red-700 mb-3">{this.state.error.message}</p>
          <button
            onClick={this.resetError}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 font-medium"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
