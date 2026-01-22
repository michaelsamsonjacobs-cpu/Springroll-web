import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Terminal, Activity, Shield, Code, Briefcase, Mail, DollarSign } from 'lucide-react';

const iconMap = {
    'ralph': <Activity size={18} className="text-amber-400" />,
    'dev': <Code size={18} className="text-blue-400" />,
    'legal': <Shield size={18} className="text-purple-400" />,
    'gtm': <Mail size={18} className="text-emerald-400" />,
    'finance': <DollarSign size={18} className="text-green-400" />,
    'product': <Briefcase size={18} className="text-pink-400" />
};

const diffStyle = {
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '16px',
    minWidth: '280px',
    color: '#fff',
    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
};

const AgentNode = ({ data, isConnectable }) => {
    return (
        <div style={diffStyle} className="group transition-all hover:border-white/20 hover:scale-[1.02]">
            {/* Input Handle (Top) */}
            <Handle type="target" position={Position.Top} isConnectable={isConnectable}
                className="!bg-white/20 !w-3 !h-3" />

            {/* Header */}
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                        {iconMap[data.type] || <Activity size={18} />}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold font-sora">{data.label}</h3>
                        <p className="text-[10px] text-slate-400">{data.role}</p>
                    </div>
                </div>
                {/* Status Dot */}
                <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-full border border-white/5">
                    <span className={`w-1.5 h-1.5 rounded-full ${data.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></span>
                    <span className="text-[9px] uppercase tracking-wider font-mono text-slate-300">
                        {data.status || 'Idle'}
                    </span>
                </div>
            </div>

            {/* Content Body (Terminal Placeholder) */}
            <div className="bg-black/40 rounded-lg p-3 font-mono text-[10px] text-slate-400 mb-2 min-h-[60px] max-h-[120px] overflow-hidden relative">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Terminal size={12} className="text-slate-500" />
                </div>
                {data.lastLog ? (
                    <span className="text-green-400/80">root@springroll:~$ {data.lastLog}</span>
                ) : (
                    <span className="text-slate-600 italic">// Waiting for instructions...</span>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                    <Shield size={10} className="text-blue-500" />
                    {data.worktree ? (
                        <span title={data.worktree} className="truncate max-w-[150px]">{data.worktree.split('/').pop()}</span>
                    ) : (
                        <span>Main Branch</span>
                    )}
                </span>
                <span className="font-mono opacity-50">ID: {data.id}</span>
            </div>

            {/* Output Handle (Bottom) */}
            <Handle type="source" position={Position.Bottom} isConnectable={isConnectable}
                className="!bg-white/20 !w-3 !h-3" />
        </div>
    );
};

export default memo(AgentNode);
