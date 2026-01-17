import React from 'react';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { AIService } from '../services/GeminiService';

export const PrivacyBadge = () => {
    // In a real app, this would use a hook to subscribe to AIService updates
    const provider = AIService.getProvider();
    const isLocal = provider === 'ollama' || provider === 'lmstudio';
    const isCloud = provider === 'gemini';

    // Status Logic
    let status = 'sovereign'; // sovereign, hybrid, cloud
    let color = '#10b981'; // Green
    let label = 'Sovereign';
    let icon = ShieldCheck;

    if (isCloud) {
        status = 'cloud';
        color = '#f59e0b'; // Orange
        label = 'Cloud AI';
        icon = ShieldAlert; // Warning shield
    }

    return (
        <div
            className="privacy-badge-container"
            style={{ position: 'relative', display: 'inline-block', marginLeft: '12px' }}
        >
            <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 10px', borderRadius: '8px',
                background: `rgba(${status === 'sovereign' ? '16, 185, 129' : '245, 158, 11'}, 0.1)`,
                border: `1px solid rgba(${status === 'sovereign' ? '16, 185, 129' : '245, 158, 11'}, 0.2)`,
                cursor: 'help'
            }}>
                <Shield size={14} color={color} fill={status === 'sovereign' ? color : 'none'} />
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {label}
                </span>
            </div>

            {/* Hover Tooltip (Basic CSS would handle visibility on hover, simulated functionality here) */}
        </div>
    );
};
