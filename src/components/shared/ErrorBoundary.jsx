import React from "react";
import PropTypes from "prop-types";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { ErrorDisplay } from "./ErrorDisplay";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error: error?.toString() || "An unknown error occurred",
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="max-w-xl w-full mx-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription className="mt-2">
                {this.state.error?.message || "An unexpected error occurred"}
              </AlertDescription>
            </Alert>
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
              <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                Something went wrong
              </h1>
              <div className="mb-4">
                {this.state.error && <ErrorDisplay error={this.state.error} />}
                {/* <p className="text-gray-700 dark:text-gray-300">
                  {this.state.error && (
                    <ErrorDisplay error={this.state.error} />
                  )}
                </p> */}
              </div>
              {this.state.errorInfo && (
                <div className="mt-4">
                  <details className="cursor-pointer">
                    <summary className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                      Stack trace
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                </div>
              )}
              <Button
                onClick={this.handleReset}
                className="w-full"
                variant="outline"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Reload Application
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
