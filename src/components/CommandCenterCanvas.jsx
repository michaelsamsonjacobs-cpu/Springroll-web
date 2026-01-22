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
import { GitWorktreeService } from '../services/GitWorktreeService';
import { DevAgentService } from '../services/DevAgentService';
import { GTMAgentService } from '../services/GTMAgentService';
import { LegalAgentService } from '../services/LegalAgentService';
import { FinanceAgentService } from '../services/FinanceAgentService';
import { HealthAgentService } from '../services/HealthAgentService';
import { TraderAgentService } from '../services/TraderAgentService';
import { AccountAgentService } from '../services/AccountAgentService';
import { RecruitingAgentService } from '../services/RecruitingAgentService';
import { ProductAgentService } from '../services/ProductAgentService';
import { QAAgentService } from '../services/QAAgentService';

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
    {
        id: 'health',
        type: 'agentNode',
        position: { x: 1000, y: 550 },
        data: { label: 'HealthAgent', role: 'Clinical Admin', type: 'health', status: 'idle' }
    },
    {
        id: 'trader',
        type: 'agentNode',
        position: { x: 700, y: 800 }, // Below Finance
        data: { label: 'TraderAgent', role: 'Quant Trader', type: 'finance', status: 'idle' }
    },
    {
        id: 'account',
        type: 'agentNode',
        position: { x: 100, y: 800 }, // Below GTM
        data: { label: 'AccountAgent', role: 'Customer Success', type: 'gtm', status: 'idle' }
    },
    {
        id: 'recruiting',
        type: 'agentNode',
        position: { x: 1000, y: 300 }, // Right of QA
        data: { label: 'Recruiting', role: 'Talent & HR', type: 'finance', status: 'idle' }
    },
];

const initialEdges = [
    { id: 'e1-2', source: 'ralph', target: 'product', animated: true, style: { stroke: '#475569' } },
    { id: 'e1-3', source: 'ralph', target: 'dev', animated: true, style: { stroke: '#3b82f6' } },
    { id: 'e1-4', source: 'ralph', target: 'qa', animated: true, style: { stroke: '#475569' } },
    { id: 'e1-5', source: 'ralph', target: 'gtm', animated: true, style: { stroke: '#475569' } },
    { id: 'e1-6', source: 'ralph', target: 'legal', animated: true, style: { stroke: '#475569' } },
    { id: 'e1-7', source: 'ralph', target: 'finance', animated: true, style: { stroke: '#475569' } },
    { id: 'e1-8', source: 'ralph', target: 'health', animated: true, style: { stroke: '#475569' } },
    { id: 'e1-9', source: 'ralph', target: 'trader', animated: true, style: { stroke: '#475569' } },
    { id: 'e1-10', source: 'ralph', target: 'account', animated: true, style: { stroke: '#475569' } },
    { id: 'e1-11', source: 'ralph', target: 'recruiting', animated: true, style: { stroke: '#475569' } },
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
        const unsubscribeRalph = RalphAgentService.subscribe((event, data) => {
            setNodes((nds) => nds.map((node) => {
                if (node.id === 'ralph') {
                    if (event === 'log') return { ...node, data: { ...node.data, lastLog: data.message } };
                    if (event === 'start') return { ...node, data: { ...node.data, status: 'active', lastLog: 'Mission started...' } };
                    if (event === 'complete') return { ...node, data: { ...node.data, status: 'idle', lastLog: 'Mission complete.' } };
                }
                return node;
            }));
        });

        // 2. Subscribe to Real DevAgent State
        const unsubscribeDev = DevAgentService.subscribe((event, data) => {
            setNodes((nds) => nds.map((node) => {
                if (node.id === 'dev') {
                    if (event === 'log') return { ...node, data: { ...node.data, lastLog: data.message } };
                    if (event === 'start') return { ...node, data: { ...node.data, status: 'active', lastLog: 'Analyzing repository...' } };
                    if (event === 'complete') return { ...node, data: { ...node.data, status: 'idle', lastLog: 'Task complete.' } };
                }
                return node;
            }));
        });

        // 3. Subscribe to Real GTMAgent State
        const unsubscribeGTM = GTMAgentService.subscribe((event, data) => {
            setNodes((nds) => nds.map((node) => {
                if (node.id === 'gtm') {
                    if (event === 'log') return { ...node, data: { ...node.data, lastLog: data.message } };
                    if (event === 'start') return { ...node, data: { ...node.data, status: 'active', lastLog: 'Researching leads...' } };
                    if (event === 'complete') return { ...node, data: { ...node.data, status: 'idle', lastLog: 'Outreach complete.' } };
                }
                return node;
            }));
        });

        // 4. Subscribe to Real LegalAgent State
        const unsubscribeLegal = LegalAgentService.subscribe((event, data) => {
            setNodes((nds) => nds.map((node) => {
                if (node.id === 'legal') {
                    if (event === 'log') return { ...node, data: { ...node.data, lastLog: data.message } };
                    if (event === 'start') return { ...node, data: { ...node.data, status: 'active', lastLog: 'Reviewing contract...' } };
                    if (event === 'complete') return { ...node, data: { ...node.data, status: 'idle', lastLog: 'Redline complete.' } };
                }
                return node;
            }));
        });

        // 5. Subscribe to Real FinanceAgent State
        const unsubscribeFinance = FinanceAgentService.subscribe((event, data) => {
            setNodes((nds) => nds.map((node) => {
                if (node.id === 'finance') {
                    if (event === 'log') return { ...node, data: { ...node.data, lastLog: data.message } };
                    if (event === 'start') return { ...node, data: { ...node.data, status: 'active', lastLog: 'Drafting proposal...' } };
                    if (event === 'complete') return { ...node, data: { ...node.data, status: 'idle', lastLog: 'Grant submitted.' } };
                }
                return node;
            }));
        });

        // 6. Subscribe to Real HealthAgent State
        const unsubscribeHealth = HealthAgentService.subscribe((event, data) => {
            setNodes((nds) => nds.map((node) => {
                if (node.id === 'health') {
                    if (event === 'log') return { ...node, data: { ...node.data, lastLog: data.message } };
                    if (event === 'start') return { ...node, data: { ...node.data, status: 'active', lastLog: 'Processing clinical data...' } };
                    if (event === 'complete') return { ...node, data: { ...node.data, status: 'idle', lastLog: 'Task complete.' } };
                }
                return node;
            }));
        });

        // 7. Subscribe to Real TraderAgent State
        const unsubscribeTrader = TraderAgentService.subscribe((event, data) => {
            setNodes((nds) => nds.map((node) => {
                if (node.id === 'trader') {
                    if (event === 'log') return { ...node, data: { ...node.data, lastLog: data.message } };
                    if (event === 'start') return { ...node, data: { ...node.data, status: 'active', lastLog: 'Backtesting strategy...' } };
                    if (event === 'complete') return { ...node, data: { ...node.data, status: 'idle', lastLog: 'Alpha found.' } };
                }
                return node;
            }));
        });

        // 8. Subscribe to Account Agent
        const unsubscribeAccount = AccountAgentService.subscribe((event, data) => {
            setNodes((nds) => nds.map((node) => {
                if (node.id === 'account') {
                    if (event === 'log') return { ...node, data: { ...node.data, lastLog: data.message } };
                    if (event === 'start') return { ...node, data: { ...node.data, status: 'active', lastLog: 'Preparing QBR...' } };
                    if (event === 'complete') return { ...node, data: { ...node.data, status: 'idle', lastLog: 'Renewal sent.' } };
                }
                return node;
            }));
        });

        // 9. Subscribe to Recruiting Agent
        const unsubscribeRecruiting = RecruitingAgentService.subscribe((event, data) => {
            setNodes((nds) => nds.map((node) => {
                if (node.id === 'recruiting') {
                    if (event === 'log') return { ...node, data: { ...node.data, lastLog: data.message } };
                    if (event === 'start') return { ...node, data: { ...node.data, status: 'active', lastLog: 'Screening resume...' } };
                    if (event === 'complete') return { ...node, data: { ...node.data, status: 'idle', lastLog: 'Candidate shortlisted.' } };
                }
                return node;
            }));
        });

        // 10. Subscribe to Product Agent
        const unsubscribeProduct = ProductAgentService.subscribe((event, data) => {
            setNodes((nds) => nds.map((node) => {
                if (node.id === 'product') {
                    if (event === 'log') return { ...node, data: { ...node.data, lastLog: data.message } };
                    if (event === 'start') return { ...node, data: { ...node.data, status: 'active', lastLog: 'Drafting PRD...' } };
                    if (event === 'complete') return { ...node, data: { ...node.data, status: 'idle', lastLog: 'Spec ready.' } };
                }
                return node;
            }));
        });

        // 11. Subscribe to QA Agent
        const unsubscribeQA = QAAgentService.subscribe((event, data) => {
            setNodes((nds) => nds.map((node) => {
                if (node.id === 'qa') {
                    if (event === 'log') return { ...node, data: { ...node.data, lastLog: data.message } };
                    if (event === 'start') return { ...node, data: { ...node.data, status: 'active', lastLog: 'Running tests...' } };
                    if (event === 'complete') return { ...node, data: { ...node.data, status: 'idle', lastLog: 'Tests passed.' } };
                }
                return node;
            }));
        });

        // 3. Simulate "Team" Activity (The "Series A" feel)
        const teamInterval = setInterval(() => {
            setNodes((nds) => nds.map((node) => {
                // Only simulate non-Ralph/Dev nodes (assuming they are real now)
                if (node.id === 'ralph' || node.id === 'dev') return node;

                // Randomly toggle status to make them feel "alive"
                if (Math.random() > 0.95) {
                    const isNowActive = node.data.status !== 'active';
                    const newLog = isNowActive
                        ? ['Analyzing...', 'Reviewing diffs...', 'Checking compliance...', 'Optimizing assets...'][Math.floor(Math.random() * 4)]
                        : 'Standing by.';

                    return { ...node, data: { ...node.data, status: isNowActive ? 'active' : 'idle', lastLog: newLog } };
                }
                return node;
            }));
        }, 3000);

        return () => {
            unsubscribeRalph();
            unsubscribeDev();
            unsubscribeGTM();
            unsubscribeLegal();
            unsubscribeFinance();
            unsubscribeHealth();
            unsubscribeTrader();
            unsubscribeAccount();
            unsubscribeRecruiting();
            unsubscribeProduct();
            unsubscribeQA();
            clearInterval(teamInterval);
        };
    }, [setNodes]);

    // Interaction: Double Click to Spawn Worktree OR Assign Task
    const onNodeDoubleClick = useCallback(async (event, node) => {
        // CASE 1: Already Active? Assign Task.
        if (node.data.worktree) {
            if (node.id === 'dev') {
                // Simple prompt for now - Phase 20 could benefit from a nice Modal
                // Using window.prompt requires the user to be in the window
                // Since this is a Tauri app, window.prompt might be blocked or ugly, but let's try.
                // Alternatively, we could open the Side Panel. 
                // For this MVP, let's try prompt, or just a hardcoded connection test first.

                if (task) {
                    DevAgentService.runTask(task, 'code');
                }
            } else if (node.id === 'gtm') {
                const task = window.prompt("Assign Task to GTMAgent:", "Analyze leads.csv and draft outreach");
                if (task) {
                    GTMAgentService.runTask(task, 'gtm');
                }
            } else if (node.id === 'legal') {
                const task = window.prompt("Assign Task to LegalAgent:", "Review the NDA in the folder");
                if (task) {
                    LegalAgentService.runTask(task, 'document');
                }
            } else if (node.id === 'finance') {
                const task = window.prompt("Assign Task to FinanceAgent:", "Draft SBIR Proposal for Defense");
                if (task) {
                    FinanceAgentService.runTask(task, 'document');
                }
            } else if (node.id === 'health') {
                const task = window.prompt("Assign Task to HealthAgent:", "Draft Prior Auth for Patient X");
                if (task) {
                    HealthAgentService.runTask(task, 'document');
                }
            } else if (node.id === 'trader') {
                const task = window.prompt("Assign Task to TraderAgent:", "Analyze Graph for Entry Point");
                if (task) {
                    TraderAgentService.runTask(task, 'chart');
                }
            } else if (node.id === 'account') {
                const task = window.prompt("Assign Task to AccountManager:", "Draft QBR for Customer Y");
                if (task) {
                    AccountAgentService.runTask(task, 'document');
                }
            } else if (node.id === 'recruiting') {
                const task = window.prompt("Assign Task to RecruitingAgent:", "Screen resumes for React + Node skills");
                if (task) {
                    // Pass the whole prompt as the description, the agent will handle extraction
                    RecruitingAgentService.runTask(task, 'document');
                }
            } else if (node.id === 'product') {
                const task = window.prompt("Assign Task to ProductAgent:", "Draft PRD for Mobile App");
                if (task) {
                    ProductAgentService.runTask(task, 'document');
                }
            } else if (node.id === 'qa') {
                const task = window.prompt("Assign Task to QAAgent:", "Write test plan for Login Flow");
                if (task) {
                    QAAgentService.runTask(task, 'code');
                }
            } else {
                alert("All agents are active.");
            }
            return;
        }

        // CASE 2: Inactive? Spawn Worktree.
        try {
            // Visual feedback immediate
            setNodes(nds => nds.map(n => n.id === node.id ? { ...n, data: { ...n.data, status: 'active', lastLog: 'Spawning isolated worktree...' } } : n));

            // Actual Git Operation
            const worktreePath = await GitWorktreeService.createWorktree(`agent-${node.id}`, 'main');

            // Initialize Agent Service if applicable
            if (node.id === 'dev') {
                DevAgentService.setWorktree(worktreePath);
                console.log(`DevAgent connected to: ${worktreePath}`);
            } else if (node.id === 'gtm') {
                GTMAgentService.setWorktree(worktreePath);
                console.log(`GTMAgent connected to: ${worktreePath}`);
            } else if (node.id === 'legal') {
                LegalAgentService.setWorktree(worktreePath);
                console.log(`LegalAgent connected to: ${worktreePath}`);
            } else if (node.id === 'finance') {
                FinanceAgentService.setWorktree(worktreePath);
                console.log(`FinanceAgent connected to: ${worktreePath}`);
            } else if (node.id === 'health') {
                HealthAgentService.setWorktree(worktreePath);
                console.log(`HealthAgent connected to: ${worktreePath}`);
            } else if (node.id === 'trader') {
                TraderAgentService.setWorktree(worktreePath);
                console.log(`TraderAgent connected to: ${worktreePath}`);
            } else if (node.id === 'account') {
                AccountAgentService.setWorktree(worktreePath);
                console.log(`AccountAgent connected to: ${worktreePath}`);
            } else if (node.id === 'recruiting') {
                RecruitingAgentService.setWorktree(worktreePath);
                console.log(`RecruitingAgent connected to: ${worktreePath}`);
            } else if (node.id === 'product') {
                ProductAgentService.setWorktree(worktreePath);
                console.log(`ProductAgent connected to: ${worktreePath}`);
            } else if (node.id === 'qa') {
                QAAgentService.setWorktree(worktreePath);
                console.log(`QAAgent connected to: ${worktreePath}`);
            }

            // Update Node with Worktree Path
            setNodes(nds => nds.map(n => n.id === node.id ? {
                ...n,
                data: {
                    ...n.data,
                    worktree: worktreePath,
                    lastLog: `Worktree active: ${worktreePath.split('/').pop()}`
                }
            } : n));

            console.log(`Worktree created for ${node.id}:`, worktreePath);
        } catch (error) {
            console.error("Worktree failed:", error);
            setNodes(nds => nds.map(n => n.id === node.id ? { ...n, data: { ...n.data, status: 'idle', lastLog: 'Worktree spawn failed.' } } : n));
        }
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
                onNodeDoubleClick={onNodeDoubleClick}
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
