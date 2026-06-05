import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem',
          }}>
            ⚠️
          </div>
          <h2 style={{
            fontSize: '1.5rem',
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
          }}>
            Something went wrong
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: '1.5rem',
            maxWidth: '400px',
          }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
