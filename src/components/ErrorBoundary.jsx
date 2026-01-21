
import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '40px',
                    background: '#0f172a',
                    color: 'white',
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'system-ui, sans-serif'
                }}>
                    <h1 style={{ color: '#ef4444', marginBottom: '16px' }}>Application Error</h1>
                    <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Something went wrong while rendering this view.</p>

                    <div style={{
                        background: 'rgba(0,0,0,0.3)',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        maxWidth: '800px',
                        overflow: 'auto',
                        fontFamily: 'monospace',
                        fontSize: '12px'
                    }}>
                        <div style={{ color: '#f87171', fontWeight: 'bold', marginBottom: '8px' }}>
                            {this.state.error && this.state.error.toString()}
                        </div>
                        <div style={{ color: '#64748b', whiteSpace: 'pre-wrap' }}>
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </div>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '24px',
                            padding: '10px 20px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Reload Application
                    </button>

                    <button
                        onClick={() => window.location.href = '/'}
                        style={{
                            marginTop: '12px',
                            padding: '10px 20px',
                            background: 'transparent',
                            color: '#94a3b8',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Return to Dashboard
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
