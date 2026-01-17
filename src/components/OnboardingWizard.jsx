import React, { useState } from 'react';
import { Sparkles, Cpu, Folder, ArrowRight, Check } from 'lucide-react';
import { AIService } from '../services/GeminiService';

export const OnboardingWizard = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [aiMode, setAiMode] = useState('sovereign'); // sovereign | cloud
    const [workspaceName, setWorkspaceName] = useState('My Project');

    const handleFinish = () => {
        // Save settings based on choices
        if (aiMode === 'sovereign') {
            AIService.setProvider('ollama');
        } else {
            AIService.setProvider('gemini');
        }

        // Save workspace (mock logic)
        const workspaces = [{ id: 'default', name: workspaceName, path: '', createdAt: new Date().toISOString() }];
        localStorage.setItem('springroll_workspaces', JSON.stringify(workspaces));

        onComplete();
    };

    const containerStyle = {
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(5, 8, 22, 0.95)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px'
    };

    const cardStyle = {
        width: '100%', maxWidth: '500px',
        background: '#0a0f1a', borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '40px', textAlign: 'center',
        boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)'
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                {/* Step indicator */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: i === step ? '#a855f7' : '#1e293b',
                            transition: 'all 0.3s'
                        }} />
                    ))}
                </div>

                {/* Step 1: Welcome */}
                {step === 1 && (
                    <>
                        <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #3b82f6, #a855f7)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <Sparkles color="white" size={32} />
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>Welcome to Springroll</h2>
                        <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: 1.6, marginBottom: '32px' }}>
                            Your sovereign agentic workstation is ready. Let's get you set up in less than 30 seconds.
                        </p>
                        <button onClick={() => setStep(2)} style={primaryBtn}>
                            Get Started <ArrowRight size={16} />
                        </button>
                    </>
                )}

                {/* Step 2: AI Setup */}
                {step === 2 && (
                    <>
                        <div style={{ width: '64px', height: '64px', background: 'rgba(16,185,129,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(16,185,129,0.2)' }}>
                            <Cpu color="#10b981" size={32} />
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>Select Intelligence</h2>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                            <div
                                onClick={() => setAiMode('sovereign')}
                                style={{ ...optionCard(aiMode === 'sovereign'), flex: 1 }}
                            >
                                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔒</div>
                                <div style={{ fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>Sovereign</div>
                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Local Only (Ollama)</div>
                            </div>
                            <div
                                onClick={() => setAiMode('cloud')}
                                style={{ ...optionCard(aiMode === 'cloud'), flex: 1 }}
                            >
                                <div style={{ fontSize: '24px', marginBottom: '8px' }}>☁️</div>
                                <div style={{ fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>Cloud</div>
                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Google Gemini</div>
                            </div>
                        </div>
                        <button onClick={() => setStep(3)} style={primaryBtn}>
                            Continue <ArrowRight size={16} />
                        </button>
                    </>
                )}

                {/* Step 3: Workspace */}
                {step === 3 && (
                    <>
                        <div style={{ width: '64px', height: '64px', background: 'rgba(59,130,246,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(59,130,246,0.2)' }}>
                            <Folder color="#3b82f6" size={32} />
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>Name Your Workspace</h2>
                        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
                            We'll create a dedicated environment for your first project.
                        </p>
                        <input
                            type="text"
                            value={workspaceName}
                            onChange={(e) => setWorkspaceName(e.target.value)}
                            style={{
                                width: '100%', padding: '16px', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white', fontSize: '16px', textAlign: 'center', marginBottom: '32px',
                                outline: 'none'
                            }}
                        />
                        <button onClick={handleFinish} style={primaryBtn}>
                            Finish Setup <Check size={16} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

// Styles
const primaryBtn = {
    background: 'linear-gradient(135deg, #3b82f6, #a855f7)',
    border: 'none', padding: '12px 32px', borderRadius: '12px',
    color: 'white', fontSize: '16px', fontWeight: 'bold',
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
    justifyContent: 'center', width: '100%', transition: 'transform 0.1s'
};

const optionCard = (active) => ({
    padding: '24px', borderRadius: '16px', cursor: 'pointer',
    background: active ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.03)',
    border: active ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
    transition: 'all 0.2s'
});
