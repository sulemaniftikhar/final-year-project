import React from "react"

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {/* Error Icon */}
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-red-100 rounded-full mb-4">
                <svg
                  className="w-16 h-16 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Oops! Something went wrong</h1>
              <p className="text-slate-600">We're sorry for the inconvenience. The application encountered an error.</p>
            </div>

            {/* Error Details (Development Mode) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-sm font-semibold text-red-800 mb-2">Error Details:</h3>
                <p className="text-xs text-red-700 font-mono mb-2">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                      Stack Trace
                    </summary>
                    <pre className="text-xs text-red-700 mt-2 overflow-auto max-h-48 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
              >
                Reload Page
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-all duration-200"
              >
                Go to Home
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-8 pt-6 border-t border-slate-200 text-center">
              <p className="text-sm text-slate-500">
                If this problem persists, please contact support or try again later.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
