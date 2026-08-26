import React from 'react';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Global Error Boundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    sessionStorage.clear();
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-white p-6">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Something went wrong</h2>
            <p className="text-slate-400 text-sm mb-6">
              An unexpected error occurred while rendering the application. We recommend refreshing or restarting your session.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-600/20"
              >
                Reload App
              </button>
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-xl transition-all"
              >
                Reset Session
              </button>
            </div>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <pre className="mt-6 p-4 bg-slate-950 text-red-400 text-xs text-left rounded-lg overflow-auto max-h-40 border border-slate-800">
                {this.state.error.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default GlobalErrorBoundary;
