/**
 * CodeEditor Component - Monaco Editor Integration
 * Provides VS Code-like editing experience within Springroll
 */
import React, { useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, Copy, Check, Download, Settings, FileCode, Terminal } from 'lucide-react';

// Springroll dark theme configuration
const SPRINGROLL_THEME = {
    base: 'vs-dark',
    inherit: true,
    rules: [
        { token: 'comment', foreground: '6A737D' },
        { token: 'keyword', foreground: 'A855F7' },
        { token: 'string', foreground: '10B981' },
        { token: 'number', foreground: 'F59E0B' },
        { token: 'function', foreground: '3B82F6' },
    ],
    colors: {
        'editor.background': '#0A0F1A',
        'editor.foreground': '#E2E8F0',
        'editor.lineHighlightBackground': '#1E293B',
        'editor.selectionBackground': '#3B82F640',
        'editorCursor.foreground': '#A855F7',
        'editorLineNumber.foreground': '#4B5563',
        'editorLineNumber.activeForeground': '#94A3B8',
    }
};

export const CodeEditor = ({
    value = '',
    onChange,
    language = 'javascript',
    readOnly = false,
    onSave,
    filename = 'untitled.js'
}) => {
    const editorRef = useRef(null);
    const [copied, setCopied] = useState(false);

    const handleEditorMount = (editor, monaco) => {
        editorRef.current = editor;

        // Define custom theme
        monaco.editor.defineTheme('springroll', SPRINGROLL_THEME);
        monaco.editor.setTheme('springroll');

        // Add save shortcut
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            if (onSave) onSave(editor.getValue());
        });
    };

    const handleCopy = () => {
        if (editorRef.current) {
            navigator.clipboard.writeText(editorRef.current.getValue());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        if (editorRef.current) {
            const blob = new Blob([editorRef.current.getValue()], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: '#0A0F1A',
            borderRadius: '12px',
            overflow: 'hidden',
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'rgba(30,41,59,0.5)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
        },
        filename: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#94a3b8',
        },
        actions: {
            display: 'flex',
            gap: '4px',
        },
        btn: {
            padding: '6px 8px',
            borderRadius: '6px',
            border: 'none',
            background: 'rgba(255,255,255,0.05)',
            cursor: 'pointer',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
        },
        editorWrapper: {
            flex: 1,
            overflow: 'hidden',
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.filename}>
                    <FileCode size={14} style={{ color: '#a855f7' }} />
                    <span>{filename}</span>
                    <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'rgba(168,85,247,0.2)',
                        color: '#a855f7',
                        fontSize: '10px',
                        textTransform: 'uppercase'
                    }}>
                        {language}
                    </span>
                </div>
                <div style={styles.actions}>
                    <button style={styles.btn} onClick={handleCopy} title="Copy to clipboard">
                        {copied ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                    </button>
                    <button style={styles.btn} onClick={handleDownload} title="Download file">
                        <Download size={12} />
                    </button>
                    {onSave && (
                        <button
                            style={{ ...styles.btn, background: 'rgba(16,185,129,0.2)', color: '#10b981' }}
                            onClick={() => onSave(editorRef.current?.getValue())}
                            title="Save (Ctrl+S)"
                        >
                            <Save size={12} /> Save
                        </button>
                    )}
                </div>
            </div>
            <div style={styles.editorWrapper}>
                <Editor
                    height="100%"
                    language={language}
                    value={value}
                    onChange={onChange}
                    onMount={handleEditorMount}
                    options={{
                        fontSize: 13,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        minimap: { enabled: true, scale: 1 },
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        lineNumbers: 'on',
                        renderLineHighlight: 'all',
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        smoothScrolling: true,
                        padding: { top: 12 },
                        readOnly: readOnly,
                        automaticLayout: true,
                    }}
                    theme="vs-dark"
                />
            </div>
        </div>
    );
};

export default CodeEditor;
