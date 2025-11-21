/**
 * Error Boundary - Catches wallet/contract errors
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Error Boundary caught an error:', error);
    console.error('Error Info:', errorInfo);
    
    // Log specific wallet/contract errors
    if (error.message.includes('Cannot use \'in\' operator') || 
        error.message.includes('Contract function not found')) {
      console.warn('🔧 Wallet/Contract error detected - running in safe mode');
    }
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />;
      }

      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-gray-900 border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Application Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                The application encountered an error. This might be due to wallet or contract integration issues.
              </p>
              
              {this.state.error?.message.includes('Cannot use \'in\' operator') && (
                <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-lg p-3">
                  <p className="text-yellow-300 text-sm">
                    <strong>Wallet Integration Issue:</strong> The app is trying to access wallet functions that aren't available. Running in safe mode.
                  </p>
                </div>
              )}

              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-400 font-mono">
                  {this.state.error?.message}
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={this.handleRetry}
                  className="flex-1"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Reload Page
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                If this persists, try refreshing the page or check the browser console for more details.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;