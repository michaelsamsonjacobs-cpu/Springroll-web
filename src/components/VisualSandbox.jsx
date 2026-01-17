import React, { useState, lazy, Suspense, useEffect } from 'react';
import { Eye, Code, Edit3, Layers, Copy, Download, Check, FileCode, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { invoke } from '@tauri-apps/api/core';

// Lazy load Monaco Editor for better initial load performance
const CodeEditor = lazy(() => import('./CodeEditor').then(m => ({ default: m.CodeEditor })));

export const VisualSandbox = ({ content, type = 'svg', onCodeChange, activeFile }) => {
    const [view, setView] = useState('preview');
    const [copied, setCopied] = useState(false);
    const [editableCode, setEditableCode] = useState('');

    useEffect(() => {
        if (activeFile) {
            setView('edit');
            setEditableCode(content); // Reset local edit state when file changes
        }
    }, [activeFile, content]);

    const handleCopy = () => {
        if (content) {
            navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        if (content) {
            const blob = new Blob([content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'springroll-output.html';
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const styles = {
        container: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' },
        header: {
            height: '48px', flexShrink: 0,
            background: 'rgba(30,41,59,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
        },
        title: { display: 'flex', alignItems: 'center', gap: '8px' },
        tabs: {
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '4px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)',
        },
        tab: (active) => ({
            padding: '6px 12px', borderRadius: '8px', border: 'none',
            background: active ? 'rgba(168,85,247,0.2)' : 'transparent',
            color: active ? '#a855f7' : '#64748b',
            fontSize: '11px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
        }),
        content: { flex: 1, position: 'relative', overflow: 'hidden' },
        actions: { display: 'flex', gap: '4px' },
        btn: {
            padding: '6px 8px', borderRadius: '6px', border: 'none',
            background: 'rgba(255,255,255,0.05)', cursor: 'pointer', color: '#94a3b8',
        },
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.title}>
                    <Layers size={16} style={{ color: '#a855f7' }} />
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Canvas</span>
                </div>

                <div style={styles.tabs}>
                    <button onClick={() => setView('preview')} style={styles.tab(view === 'preview')}>
                        <Eye size={12} /> Preview
                    </button>
                    <button onClick={() => setView('code')} style={styles.tab(view === 'code')}>
                        <Code size={12} /> Code
                    </button>
                    <button onClick={() => setView('edit')} style={styles.tab(view === 'edit')}>
                        <Edit3 size={12} /> Edit
                    </button>
                </div>

                {content && (
                    <div style={styles.actions}>
                        <button style={styles.btn} onClick={handleCopy} title="Copy">
                            {copied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                        </button>
                        <button style={styles.btn} onClick={handleDownload} title="Download">
                            <Download size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div style={styles.content}>
                {view === 'preview' && (
                    <div style={{
                        height: '100%', width: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '24px',
                        background: 'radial-gradient(circle at center, rgba(168,85,247,0.03) 0%, transparent 70%)',
                    }}>
                        {content ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{
                                    maxWidth: '100%', maxHeight: '100%',
                                    background: 'white', borderRadius: '12px',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 60px rgba(168,85,247,0.1)',
                                    padding: '24px', overflow: 'auto',
                                }}
                                dangerouslySetInnerHTML={{ __html: content }}
                            />
                        ) : (
                            <EmptyState />
                        )}
                    </div>
                )}

                {view === 'code' && (
                    <div style={{ height: '100%', overflow: 'auto', background: '#0a0f1a' }}>
                        <pre style={{
                            padding: '20px', margin: 0,
                            fontSize: '12px', fontFamily: "'JetBrains Mono', monospace",
                            color: '#94a3b8', whiteSpace: 'pre-wrap', lineHeight: 1.6,
                        }}>
                            {content || '// No content generated yet\n// Ask Springroll to create visuals or code'}
                        </pre>
                    </div>
                )}

                {view === 'edit' && (
                    <Suspense fallback={
                        <div style={{
                            height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: '#0a0f1a', color: '#64748b', flexDirection: 'column', gap: '12px',
                        }}>
                            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                            <span style={{ fontSize: '12px' }}>Loading Monaco Editor...</span>
                        </div>
                    }>
                        <CodeEditor
                            value={editableCode || content || '// Start coding here...\n\nfunction hello() {\n    console.log("Hello from Springroll!");\n}\n'}
                            onChange={(value) => {
                                setEditableCode(value);
                                if (onCodeChange) onCodeChange(value);
                            }}
                            language={activeFile ? activeFile.split('.').pop() === 'js' ? 'javascript' : activeFile.split('.').pop() : 'javascript'}
                            filename={activeFile ? activeFile.split(/[\\/]/).pop() : "workspace.js"}
                            onSave={async (code) => {
                                console.log('Saved:', code);
                                if (activeFile) {
                                    try {
                                        await invoke('write_file', { path: activeFile, contents: code });
                                        // Simple visual feedback could be improved later (toast)
                                        const btn = document.activeElement;
                                        if (btn) {
                                            const originalText = btn.innerHTML;
                                            btn.innerHTML = 'Saved!';
                                            setTimeout(() => btn.innerHTML = originalText, 1000);
                                        }
                                    } catch (e) {
                                        console.error('Failed to save:', e);
                                        alert('Failed to save file: ' + e);
                                    }
                                }
                            }}
                        />
                    </Suspense>
                )}
            </div>
        </div>
    );
};

// Empty State Component
const EmptyState = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center', padding: '24px', maxWidth: '280px' }}>
        <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <Layers size={28} style={{ color: '#a855f7' }} />
        </div>
        <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>Canvas Empty</p>
            <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                Generate visuals, diagrams, or preview documents here
            </p>
        </div>

        {/* How to use */}
        <div style={{
            width: '100%', padding: '16px', borderRadius: '12px',
            background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)',
            textAlign: 'left',
        }}>
            <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>How to use:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#a855f7', background: 'rgba(168,85,247,0.1)', padding: '2px 6px', borderRadius: '4px' }}>1</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>In <strong style={{ color: '#3b82f6' }}>AI Agent</strong>, ask for a diagram, chart, or SVG</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#a855f7', background: 'rgba(168,85,247,0.1)', padding: '2px 6px', borderRadius: '4px' }}>2</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>In <strong style={{ color: '#ec4899' }}>Doc Builder</strong>, click "Preview" after generating</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#a855f7', background: 'rgba(168,85,247,0.1)', padding: '2px 6px', borderRadius: '4px' }}>3</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Use the <strong style={{ color: '#10b981' }}>Edit</strong> tab to write code with Monaco</span>
                </div>
            </div>
        </div>
    </div>
);

export default VisualSandbox;
