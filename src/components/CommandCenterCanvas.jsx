import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';

import AgentNode from './CommandCenter/AgentNode';
import { RalphAgentService } from '../services/RalphAgentService';

// Define custom node types
const nodeTypes = {
    agentNode: AgentNode,
};

// Initial "Series A" Layout
const initialNodes = [
    // Executive Layer
    {
        id: 'ralph',
        type: 'agentNode',
        position: { x: 400, y: 50 },
        data: { label: 'Ralph Agent', role: 'Chief of Staff', type: 'ralph', status: 'active', lastLog: 'Orchestrating daily standup...' }
    },
    // Product & Eng Layer
    {
        id: 'product',
        type: 'agentNode',
        position: { x: 100, y: 300 },
        data: { label: 'ProductAgent', role: 'Product Manager', type: 'product', status: 'idle' }
    },
    {
        id: 'dev',
        type: 'agentNode',
        position: { x: 400, y: 300 },
        data: { label: 'DevAgent', role: 'Lead Engineer', type: 'dev', status: 'idle' }
    },
    {
        id: 'qa',
        type: 'agentNode',
        position: { x: 700, y: 300 },
        data: { label: 'QAAgent', role: 'Quality Assurance', type: 'dev', status: 'idle' }
    },
    // GTM & Ops Layer
    {
        id: 'gtm',
        type: 'agentNode',
        position: { x: 100, y: 550 },
        data: { label: 'GTMAgent', role: 'Sales & Marketing', type: 'gtm', status: 'idle' }
    },
    {
        id: 'legal',
        type: 'agentNode',
        position: { x: 400, y: 550 },
        data: { label: 'LegalAgent', role: 'General Counsel', type: 'legal', status: 'idle' }
    },
    {
        id: 'finance',
        type: 'agentNode',
        position: { x: 700, y: 550 },
        data: { label: 'GrantAgent', role: 'Finance & Grants', type: 'finance', status: 'idle' }
    },
];

const initialEdges = [
    { id: 'e1-2', source: 'ralph', target: 'product', animated: true, style: { stroke: '#475569' } },
    { id: 'e1-3', source: 'ralph', target: 'dev', animated: true, style: { stroke: '#3b82f6' } },
    { id: 'e1-4', source: 'ralph', target: 'qa', animated: true, style: { stroke: '#475569' } },
    { id: 'e1-5', source: 'ralph', target: 'gtm', animated: true, style: { stroke: '#475569' } },
    { id: 'e1-6', source: 'ralph', target: 'legal', animated: true, style: { stroke: '#475569' } },
    { id: 'e1-7', source: 'ralph', target: 'finance', animated: true, style: { stroke: '#475569' } },
    // Horizontal Collab
    { id: 'e2-3', source: 'product', target: 'dev', animated: false, style: { stroke: '#475569', strokeDasharray: '5,5' } },
    { id: 'e3-4', source: 'dev', target: 'qa', animated: false, style: { stroke: '#475569', strokeDasharray: '5,5' } },
];

export default function CommandCenterCanvas() {
    // Load initialization from LocalStorage if acceptable, else Series A default
    const getSavedNodes = () => {
        try {
            const saved = localStorage.getItem('springroll_command_layout');
            return saved ? JSON.parse(saved) : initialNodes;
        } catch (e) {
            return initialNodes;
        }
    };

    const [nodes, setNodes, onNodesChange] = useNodesState(getSavedNodes());
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Persistence: Save on every change
    useEffect(() => {
        localStorage.setItem('springroll_command_layout', JSON.stringify(nodes));
    }, [nodes]);

    const resetLayout = () => {
        setNodes(initialNodes);
        setEdges(initialEdges);
        localStorage.removeItem('springroll_command_layout');
    };

    // --- Dynamic Team State ---
    useEffect(() => {
        // 1. Subscribe to Real Ralph State
        const unsubscribe = RalphAgentService.subscribe((event, data) => {
            setNodes((nds) => nds.map((node) => {
                if (node.id === 'ralph') {
                    if (event === 'log') {
                        return { ...node, data: { ...node.data, lastLog: data.message } };
                    }
                    if (event === 'start') {
                        return { ...node, data: { ...node.data, status: 'active', lastLog: 'Mission started...' } };
                    }
                    if (event === 'complete') {
                        return { ...node, data: { ...node.data, status: 'idle', lastLog: 'Mission complete.' } };
                    }
                }
                return node;
            }));
        });

        // 2. Simulate "Team" Activity (The "Series A" feel)
        const teamInterval = setInterval(() => {
            setNodes((nds) => nds.map((node) => {
                // Only simulate non-Ralph nodes
                if (node.id === 'ralph') return node;

                // Randomly toggle status to make them feel "alive"
                if (Math.random() > 0.95) {
                    const isNowActive = node.data.status !== 'active';
                    const newLog = isNowActive
                        ? ['Analyzing...', 'Reviewing diffs...', 'Checking compliance...', 'Optimizing assets...'][Math.floor(Math.random() * 4)]
                        : 'Standing by.';

                    return {
                        ...node,
                        data: {
                            ...node.data,
                            status: isNowActive ? 'active' : 'idle',
                            lastLog: newLog
                        }
                    };
                }
                return node;
            }));
        }, 3000);

        return () => {
            unsubscribe();
            clearInterval(teamInterval);
        };
    }, [setNodes]);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    return (
        <div className="w-full h-full bg-[#020617] relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="bg-slate-950"
            >
                <Background color="#1e293b" gap={20} size={1} />
                <Controls className="bg-slate-800 border-slate-700 fill-slate-300" />
            </ReactFlow>

            {/* Overlay Title */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <h2 className="text-white/80 font-sora font-semibold text-lg flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Command Center
                </h2>
                <p className="text-slate-500 text-xs mt-1">Sovereign Team Orchestration</p>
                <button
                    onClick={resetLayout}
                    className="mt-2 pointer-events-auto text-[10px] text-slate-500 hover:text-white underline decoration-dashed cursor-pointer"
                >
                    Reset to Series A Default
                </button>
            </div>
        </div>
    );
}
