import React, { useState, useEffect } from 'react';
import { SearchService } from '../services/SearchService';
import { AnnotationService } from '../services/AnnotationService';
import { Folder, File, Search, RefreshCcw, Database, ChevronRight, ChevronDown, FolderOpen, Plus, Trash2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { open } from '@tauri-apps/plugin-dialog';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';

export const FileExplorer = ({ onFileSelect }) => {
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [expanded, setExpanded] = useState({}); // { workspaceRoot: boolean }
    const [annotationCounts, setAnnotationCounts] = useState({});
    const [contextMenu, setContextMenu] = useState(null); // { x, y, filePath }
    const [recentChanges, setRecentChanges] = useState([]); // Track recent file changes

    useEffect(() => {
        loadWorkspaces();
        setAnnotationCounts(AnnotationService.countByFile());

        // Subscribe to file-change events from Tauri
        let unlisten;
        (async () => {
            unlisten = await listen('file-change', (event) => {
                console.log('[FileExplorer] File change detected:', event.payload);
                // Add to recent changes list (max 5)
                setRecentChanges(prev => [
                    { ...event.payload, timestamp: Date.now() },
                    ...prev.slice(0, 4)
                ]);
                loadWorkspaces(); // Auto-refresh
            });

            // Start watching all existing workspaces
            const existingWorkspaces = SearchService.getWorkspaces();
            for (const ws of existingWorkspaces) {
                try {
                    await invoke('watch_directory', { path: ws.root });
                    console.log('[FileExplorer] Watching:', ws.root);
                } catch (e) {
                    console.warn('[FileExplorer] Could not watch (Tauri not available?):', e);
                }
            }
        })();

        return () => {
            if (unlisten) unlisten();
        };
    }, []);

    const loadWorkspaces = () => {
        const data = SearchService.getWorkspaces();
        setWorkspaces(data);
        // Default expand all if few, or just the first
        if (data.length > 0 && Object.keys(expanded).length === 0) {
            setExpanded({ [data[0].root]: true });
        }
    };

    const handleIndex = async () => {
        // Native folder picker via Tauri
        let path;
        try {
            path = await open({
                directory: true,
                multiple: false,
                title: 'Select Workspace Folder'
            });
        } catch (e) {
            // Fallback to prompt if dialog fails (browser mode)
            path = window.prompt("Index a local workspace (absolute path):", "C:/Users/Mike/Desktop/Springroll");
        }
        if (!path) return;

        setLoading(true);
        try {
            await SearchService.indexDirectory(path);
            loadWorkspaces();
            setExpanded(prev => ({ ...prev, [path]: true })); // Auto-expand new

            // Start watching the new folder for real-time updates
            try {
                await invoke('watch_directory', { path });
                console.log('[FileExplorer] Now watching:', path);
            } catch (watchErr) {
                console.warn('[FileExplorer] Could not start watching:', watchErr);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to index directory: " + e);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = (path, e) => {
        e.stopPropagation();
        if (window.confirm('Remove this folder from workspace?')) {
            SearchService.removeWorkspace(path);
            loadWorkspaces();
        }
    };

    const toggleExpand = (root) => {
        setExpanded(prev => ({ ...prev, [root]: !prev[root] }));
    };

    const getFileIcon = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        const colors = {
            js: 'text-yellow-400',
            jsx: 'text-blue-400',
            ts: 'text-blue-500',
            tsx: 'text-blue-400',
            css: 'text-pink-400',
            json: 'text-yellow-500',
            md: 'text-slate-400',
            html: 'text-orange-400',
        };
        return colors[ext] || 'text-slate-500';
    };

    const handleContextMenu = (e, filePath) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, filePath });
    };

    const handleAddAnnotation = () => {
        const text = window.prompt('Add annotation for this file:');
        if (text && contextMenu?.filePath) {
            AnnotationService.add(contextMenu.filePath, text);
            setAnnotationCounts(AnnotationService.countByFile());
        }
        setContextMenu(null);
    };

    const handleViewAnnotations = () => {
        const annotations = AnnotationService.getForFile(contextMenu?.filePath);
        if (annotations.length > 0) {
            alert(annotations.map(a => `[${a.createdAt.split('T')[0]}] ${a.text}`).join('\n\n'));
        } else {
            alert('No annotations for this file.');
        }
        setContextMenu(null);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-4 h-12 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/30 shrink-0">
                <div className="flex items-center gap-2">
                    <Database size={14} className="text-[var(--accent-blue)]" />
                    <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Workspaces</span>
                </div>
                <button
                    onClick={handleIndex}
                    disabled={loading}
                    className="p-1.5 rounded-lg hover:bg-[var(--bg-surface)] text-[var(--text-tertiary)] hover:text-[var(--accent-blue)] transition-all flex items-center gap-1"
                    title="Add Folder"
                >
                    <Plus size={14} />
                </button>
            </div>

            {/* Search */}
            <div className="p-3 shrink-0">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                    <input
                        className="input-field pl-9 py-2 text-xs"
                        placeholder="Search all files..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto px-2 pb-4">
                <AnimatePresence>
                    {workspaces.length > 0 ? (
                        workspaces.map((ws, wsIdx) => {
                            const isExpanded = expanded[ws.root];
                            const filteredFiles = ws.files.filter(f =>
                                f.toLowerCase().includes(searchTerm.toLowerCase())
                            );

                            // Skip strictly if searching and no matches? 
                            // user might want to see context even if empty matches, but cleaner to hide if searching.
                            if (searchTerm && filteredFiles.length === 0) return null;

                            return (
                                <div key={ws.root} className="mb-2">
                                    {/* Workspace Root */}
                                    <div
                                        onClick={() => toggleExpand(ws.root)}
                                        className="flex items-center gap-2 px-2 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]/50 rounded-lg cursor-pointer group select-none"
                                    >
                                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        <FolderOpen size={14} className="text-[var(--accent-blue)]" />
                                        <span className="font-medium truncate flex-1">{ws.name}</span>
                                        <span className="text-[var(--text-tertiary)] text-[10px]">{filteredFiles.length}</span>

                                        <button
                                            onClick={(e) => handleRemove(ws.root, e)}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                                            title="Remove"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>

                                    {/* Files */}
                                    {isExpanded && (
                                        <div className="ml-2 pl-2 border-l border-[var(--border-subtle)]">
                                            {filteredFiles.slice(0, 100).map((f, i) => (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -5 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.005 }}
                                                    key={f}
                                                    onClick={() => onFileSelect && onFileSelect(f)}
                                                    onContextMenu={(e) => handleContextMenu(e, f)}
                                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[var(--bg-surface)] group cursor-pointer transition-all"
                                                >
                                                    <File size={14} className={getFileIcon(f)} />
                                                    <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] truncate font-mono flex-1" title={f}>
                                                        {f.split(/[\\/]/).pop()}
                                                    </span>
                                                    {annotationCounts[f] && (
                                                        <span className="flex items-center gap-1 text-[10px] text-yellow-400" title={`${annotationCounts[f]} annotation(s)`}>
                                                            <MessageSquare size={10} /> {annotationCounts[f]}
                                                        </span>
                                                    )}
                                                </motion.div>
                                            ))}
                                            {filteredFiles.length > 100 && (
                                                <div className="px-3 py-2 text-[10px] text-[var(--text-tertiary)]">
                                                    + {filteredFiles.length - 100} more
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12">
                            <div className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center mb-6">
                                <Folder size={28} className="text-[var(--text-tertiary)]" />
                            </div>
                            <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">No Workspaces</p>
                            <p className="text-xs text-[var(--text-tertiary)] mb-6 leading-relaxed">
                                Connect folders to enable<br />local AI context
                            </p>
                            <button
                                onClick={handleIndex}
                                className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2"
                            >
                                <Plus size={14} />
                                Connect Folder
                            </button>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Stats */}
            <div className="px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/30 shrink-0">
                <div className="flex items-center justify-between text-[10px] text-[var(--text-tertiary)]">
                    <span className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-[var(--accent-green)]'}`}></div>
                        {loading ? 'Indexing...' : 'Ready'}
                    </span>
                    <span className="font-mono">
                        {workspaces.reduce((acc, ws) => acc + ws.files.length, 0)} files total
                    </span>
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    style={{
                        position: 'fixed',
                        left: contextMenu.x,
                        top: contextMenu.y,
                        background: 'var(--bg-panel)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '4px',
                        zIndex: 1000,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                    onClick={() => setContextMenu(null)}
                >
                    <button
                        onClick={handleAddAnnotation}
                        className="w-full px-3 py-2 text-left text-xs hover:bg-[var(--bg-surface)] rounded flex items-center gap-2 text-[var(--text-secondary)]"
                    >
                        <Plus size={12} /> Add Annotation
                    </button>
                    <button
                        onClick={handleViewAnnotations}
                        className="w-full px-3 py-2 text-left text-xs hover:bg-[var(--bg-surface)] rounded flex items-center gap-2 text-[var(--text-secondary)]"
                    >
                        <MessageSquare size={12} /> View Annotations
                    </button>
                </div>
            )}
            {contextMenu && <div className="fixed inset-0 z-50" onClick={() => setContextMenu(null)} />}
        </div>
    );
};
