import React, { useState } from 'react';
import { Play, Square, Globe, Terminal, AlertCircle, CheckCircle } from 'lucide-react';

// Tauri Invoke
// const { invoke } = window.__TAURI__.core; // Tauri v2 syntax might vary, falling back to standard if needed
// For now assuming standard invoke is available globally or we import it.
// In Tauri v2, it's often: import { invoke } from '@tauri-apps/api/core';

// We'll trust the existing pattern in the codebase. 
// If specific imports are needed we'll add them.
// Let's assume global invoke for a second or try to find where it's defined.
// Actually, I'll use the standard Tauri v2 import in the code below.

const invoke = window.__TAURI__ ? window.__TAURI__.core.invoke : async () => { console.warn("Tauri not found"); return "{}"; };

export const AutomationPanel = () => {
    const [status, setStatus] = useState('idle'); // idle, running, success, error
    const [logs, setLogs] = useState([]);

    const addLog = (msg) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    const runTest = async () => {
        setStatus('running');
        addLog('Starting Automation Sidecar...');

        const payload = JSON.stringify({
            id: crypto.randomUUID(),
            action: 'execute_workflow',
            payload: {
                steps: [
                    { type: 'start_browser' }, // This logic needs to be in the sidecar or handled by executor
                    // Actually sidecar index.js handles 'start_browser' as a separate action.
                    // Let's call start_browser first.
                ]
            }
        });

        // Correction: index.js expects discrete actions.
        // Let's try a sequence.

        try {
            // 1. Start Browser
            addLog('Requesting: Start Browser');
            const res1 = await invoke('run_automation_sidecar', {
                payload: JSON.stringify({ id: '1', action: 'start_browser' })
            });
            addLog(`Sidecar Response: ${res1}`);

            // 2. Navigate to Example
            addLog('Requesting: Navigate to springroll.ai');
            const workflow = {
                steps: [
                    { type: 'navigate', url: 'https://www.google.com' },
                    { type: 'type', selector: 'textarea[name="q"]', value: 'Springroll AI' },
                    { type: 'wait', duration: 2000 },
                    { type: 'screenshot', path: 'test_result.png' }
                ]
            };

            const res2 = await invoke('run_automation_sidecar', {
                payload: JSON.stringify({
                    id: '2',
                    action: 'execute_workflow',
                    payload: workflow
                })
            });
            addLog(`Workflow Result: ${res2}`);
            setStatus('success');

        } catch (err) {
            console.error(err);
            addLog(`ERROR: ${err.message || err}`);
            setStatus('error');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '12px', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                    <Globe size={16} color="#3b82f6" />
                    Browser Automation
                </h3>
                <div style={{
                    padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold',
                    background: status === 'running' ? 'rgba(234,179,8,0.2)' : status === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
                    color: status === 'running' ? '#eab308' : status === 'success' ? '#22c55e' : '#64748b'
                }}>
                    {status.toUpperCase()}
                </div>
            </div>

            <div style={{
                flex: 1, background: '#0a0f1a', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', marginBottom: '8px', minHeight: '80px'
            }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.3)' }}>
                    <Terminal size={14} color="#94a3b8" />
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Execution Log</span>
                </div>
                <div style={{ flex: 1, padding: '12px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '12px', color: '#cbd5e1' }}>
                    {logs.length === 0 ? <span style={{ color: '#64748b' }}>Ready to run...</span> : logs.map((l, i) => (
                        <div key={i} style={{ marginBottom: '4px' }}>{l}</div>
                    ))}
                </div>
            </div>

            <button
                onClick={runTest}
                disabled={status === 'running'}
                style={{
                    width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
                    background: status === 'running' ? '#334155' : 'linear-gradient(135deg, #3b82f6, #a855f7)',
                    color: status === 'running' ? '#94a3b8' : 'white',
                    fontWeight: 'bold', cursor: status === 'running' ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px'
                }}
            >
                {status === 'running' ? <Square size={14} /> : <Play size={14} />}
                {status === 'running' ? 'Running...' : 'Launch Test Workflow'}
            </button>
        </div>
    );
};
