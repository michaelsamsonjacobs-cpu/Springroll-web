import React, { useState, useEffect } from 'react';
import { Play, Plus, Trash2, Save, MousePointer, Type, Globe, Clock, Camera, AlertCircle, FileJson, Folder, AppWindow, Brain, Sparkles } from 'lucide-react';
import { WorkflowTrainer } from '../services/WorkflowTrainer';

const invoke = window.__TAURI__ ? window.__TAURI__.core.invoke : async () => { console.warn("Tauri not found"); return "{}"; };

export const ActionRecorder = () => {
    // Workflow State
    const [workflows, setWorkflows] = useState(() => {
        const saved = localStorage.getItem('springroll_workflows');
        return saved ? JSON.parse(saved) : [{
            id: 'demo', name: 'Demo Search',
            steps: [
                { id: '1', type: 'navigate', url: 'https://www.google.com' },
                { id: '2', type: 'type', selector: 'textarea[name="q"]', value: 'Springroll AI' },
                { id: '3', type: 'wait', duration: 1000 },
                { id: '4', type: 'screenshot', path: 'springroll_search.png' }
            ]
        }];
    });
    const [activeWorkflowId, setActiveWorkflowId] = useState(workflows[0]?.id || null);

    const activeWorkflow = workflows.find(w => w.id === activeWorkflowId) || { steps: [] };
    const steps = activeWorkflow.steps;

    // Execution State
    const [status, setStatus] = useState('idle');
    const [logs, setLogs] = useState([]);

    // Persistence
    useEffect(() => {
        localStorage.setItem('springroll_workflows', JSON.stringify(workflows));
    }, [workflows]);

    const createWorkflow = () => {
        const name = prompt("Workflow Name:");
        if (!name) return;
        const newWf = { id: crypto.randomUUID(), name, steps: [] };
        setWorkflows([...workflows, newWf]);
        setActiveWorkflowId(newWf.id);
    };

    const deleteWorkflow = (id) => {
        const newWfs = workflows.filter(w => w.id !== id);
        setWorkflows(newWfs);
        if (activeWorkflowId === id) setActiveWorkflowId(newWfs[0]?.id || null);
    };

    const updateSteps = (newSteps) => {
        setWorkflows(workflows.map(w => w.id === activeWorkflowId ? { ...w, steps: newSteps } : w));
    };

    const addStep = (type) => {
        const newStep = { id: crypto.randomUUID(), type };
        if (type === 'launch') newStep.appName = 'calculator';
        if (type === 'navigate') newStep.url = 'https://';
        if (type === 'click') newStep.selector = '';
        if (type === 'type') { newStep.selector = ''; newStep.value = ''; }
        if (type === 'wait') newStep.duration = 1000;
        if (type === 'screenshot') newStep.path = 'screenshot.png';
        updateSteps([...steps, newStep]);
    };

    const updateStep = (id, field, value) => {
        updateSteps(steps.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const removeStep = (id) => {
        updateSteps(steps.filter(s => s.id !== id));
    };

    const runWorkflow = async () => {
        setStatus('running');
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Starting Workflow: ${activeWorkflow.name}...`]);

        try {
            await invoke('run_automation_sidecar', {
                payload: JSON.stringify({ id: 'init', action: 'start_browser' })
            });

            const res = await invoke('run_automation_sidecar', {
                payload: JSON.stringify({
                    id: 'exec',
                    action: 'execute_workflow',
                    payload: { steps }
                })
            });

            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Result: ${res}`]);
            setStatus('success');
        } catch (err) {
            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error: ${err}`]);
            setStatus('error');
        }
    };

    const handleTrainAI = () => {
        if (!activeWorkflow || steps.length < 2) {
            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Need at least 2 steps to train`]);
            return;
        }
        const result = WorkflowTrainer.trainFromWorkflow(activeWorkflow);
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Trained AI on workflow "${activeWorkflow.name}" (${result.sequences.length} patterns learned)`]);
    };

    const handleSuggestStep = async () => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🔍 Analyzing workflow...`]);
        try {
            const suggestion = await WorkflowTrainer.suggestNextStep(steps);
            addStep(suggestion.type);
            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 💡 Suggested: ${suggestion.type} - ${suggestion.suggestion}`]);
        } catch (e) {
            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error getting suggestion`]);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'launch': return <AppWindow size={16} color="#22c55e" />;
            case 'navigate': return <Globe size={16} color="#3b82f6" />;
            case 'click': return <MousePointer size={16} color="#a855f7" />;
            case 'type': return <Type size={16} color="#ec4899" />;
            case 'wait': return <Clock size={16} color="#f59e0b" />;
            case 'screenshot': return <Camera size={16} color="#10b981" />;
            default: return <AlertCircle size={16} />;
        }
    };

    return (
        <div style={{ display: 'flex', height: '100%', color: 'white' }}>
            {/* Sidebar - Workflows */}
            <div style={{ width: '200px', background: '#0a0f1a', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#94a3b8' }}>WORKFLOWS</h3>
                    <button onClick={createWorkflow} style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer' }}><Plus size={16} /></button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {workflows.map(wf => (
                        <div
                            key={wf.id}
                            onClick={() => setActiveWorkflowId(wf.id)}
                            style={{
                                padding: '10px 16px', cursor: 'pointer',
                                background: activeWorkflowId === wf.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                fontSize: '13px', color: activeWorkflowId === wf.id ? 'white' : '#94a3b8'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Folder size={14} /> {wf.name}
                            </div>
                            {workflows.length > 1 && (
                                <Trash2 size={12} color="#ef4444" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); deleteWorkflow(wf.id); }} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Builder Column */}
            <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0 }}>{activeWorkflow.name || 'Select Workflow'}</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {activeWorkflowId && (
                            <>
                                <button style={{ ...btnStyle, background: 'rgba(168,85,247,0.1)', color: '#a855f7' }} onClick={handleTrainAI} title="Train AI on this workflow">
                                    <Brain size={14} /> Train AI
                                </button>
                                <button style={{ ...btnStyle, background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }} onClick={handleSuggestStep} title="AI suggests next step">
                                    <Sparkles size={14} /> Suggest
                                </button>
                                <button style={{ ...btnStyle, background: '#10b981', color: 'white' }} onClick={runWorkflow}>
                                    {status === 'running' ? 'Running...' : 'Run'} <Play size={14} fill="white" />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {activeWorkflowId ? (
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {steps.length === 0 && <div style={{ textAlign: 'center', color: '#64748b', padding: '32px' }}>No steps yet. Add one below.</div>}

                        {steps.map((step, index) => (
                            <div key={step.id} style={{
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '8px', padding: '12px', display: 'flex', gap: '12px', alignItems: 'center'
                            }}>
                                <div style={{ color: '#64748b', fontSize: '12px', width: '20px' }}>{index + 1}</div>
                                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {getIcon(step.type)}
                                </div>

                                <div style={{ flex: 1, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '13px', minWidth: '70px', textTransform: 'uppercase', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                                        {step.type}
                                    </div>

                                    {step.type === 'navigate' && (
                                        <input
                                            type="text" value={step.url} onChange={e => updateStep(step.id, 'url', e.target.value)}
                                            style={inputStyle} placeholder="https://example.com"
                                        />
                                    )}
                                    {(step.type === 'click' || step.type === 'type') && (
                                        <input
                                            type="text" value={step.selector} onChange={e => updateStep(step.id, 'selector', e.target.value)}
                                            style={{ ...inputStyle, flex: 1 }} placeholder="CSS Selector (e.g. #submit-btn)"
                                        />
                                    )}
                                    {step.type === 'type' && (
                                        <input
                                            type="text" value={step.value} onChange={e => updateStep(step.id, 'value', e.target.value)}
                                            style={{ ...inputStyle, flex: 2 }} placeholder="Text to type"
                                        />
                                    )}
                                    {step.type === 'wait' && (
                                        <input
                                            type="number" value={step.duration} onChange={e => updateStep(step.id, 'duration', parseInt(e.target.value))}
                                            style={inputStyle} placeholder="Milliseconds"
                                        />
                                    )}
                                    {step.type === 'screenshot' && (
                                        <input
                                            type="text" value={step.path} onChange={e => updateStep(step.id, 'path', e.target.value)}
                                            style={inputStyle} placeholder="filename.png"
                                        />
                                    )}
                                    {step.type === 'launch' && (
                                        <input
                                            type="text" value={step.appName} onChange={e => updateStep(step.id, 'appName', e.target.value)}
                                            style={inputStyle} placeholder="App Name (calculator, notepad)"
                                        />
                                    )}
                                </div>

                                <button onClick={() => removeStep(step.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.5 }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}

                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
                            {['launch', 'navigate', 'click', 'type', 'wait', 'screenshot'].map(type => (
                                <button key={type} onClick={() => addStep(type)} style={addBtnStyle}>
                                    <Plus size={14} /> {type}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        Create or select a workflow to start building.
                    </div>
                )}
            </div>

            {/* Logs Column */}
            <div style={{ width: '280px', background: '#0a0f1a', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', fontSize: '13px', color: '#94a3b8' }}>
                    EXECUTION LOGS
                </div>
                <div style={{ flex: 1, padding: '16px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '12px', color: '#cbd5e1' }}>
                    {logs.map((log, i) => (
                        <div key={i} style={{ marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '4px' }}>
                            {log}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const inputStyle = {
    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '4px', padding: '6px 10px', color: 'white', fontSize: '13px',
    outline: 'none', flex: 2
};

const btnStyle = {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 12px', borderRadius: '6px', border: 'none',
    background: 'rgba(255,255,255,0.05)', color: '#cbd5e1',
    cursor: 'pointer', fontSize: '13px', fontWeight: 600
};

const addBtnStyle = {
    ...btnStyle, padding: '6px 10px', fontSize: '12px',
    background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)'
};
