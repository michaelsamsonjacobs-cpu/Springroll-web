import React, { useState, useEffect } from 'react';
import { X, Users, Copy, Check, Plus, Trash2, FolderOpen, Link, Crown, Edit3 } from 'lucide-react';

export const ShareWorkspaceModal = ({ isOpen, onClose, workspacePath }) => {
    const [collaborators, setCollaborators] = useState([]);
    const [newEmail, setNewEmail] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadCollaborators();
        }
    }, [isOpen]);

    const loadCollaborators = () => {
        // Load from localStorage (in production would read .springroll/collaborators.json)
        const saved = localStorage.getItem('springroll_collaborators');
        if (saved) {
            setCollaborators(JSON.parse(saved));
        } else {
            // Default with current user as owner
            const user = JSON.parse(localStorage.getItem('springroll_user') || '{"name": "You"}');
            setCollaborators([
                { id: 'owner', name: user.name, email: user.email || 'owner@local', role: 'owner' }
            ]);
        }
    };

    const saveCollaborators = (collab) => {
        localStorage.setItem('springroll_collaborators', JSON.stringify(collab));
        setCollaborators(collab);
    };

    const handleAddCollaborator = () => {
        if (!newEmail.trim()) return;
        const newCollab = {
            id: Date.now().toString(),
            name: newEmail.split('@')[0],
            email: newEmail,
            role: 'editor',
            addedAt: new Date().toISOString()
        };
        saveCollaborators([...collaborators, newCollab]);
        setNewEmail('');
    };

    const handleRemoveCollaborator = (id) => {
        saveCollaborators(collaborators.filter(c => c.id !== id));
    };

    const handleCopyPath = () => {
        const path = workspacePath || localStorage.getItem('springroll_workspace_path') || 'C:\\Users\\Shared\\Workspace';
        navigator.clipboard.writeText(path);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    const styles = {
        overlay: {
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        },
        modal: {
            width: '480px', background: 'linear-gradient(135deg, #0f172a, #1e293b)',
            borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
        },
        header: {
            padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        },
        content: { padding: '24px' },
        input: {
            flex: 1, padding: '12px 16px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'white', fontSize: '14px', outline: 'none'
        },
        btn: {
            padding: '12px 16px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: 'white',
            fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
        },
        collaboratorRow: {
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
            borderRadius: '10px', background: 'rgba(255,255,255,0.03)', marginBottom: '8px'
        },
        avatar: (color) => ({
            width: '36px', height: '36px', borderRadius: '10px',
            background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 'bold', color: 'white'
        }),
        badge: (bg, color) => ({
            padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600,
            background: bg, color: color, textTransform: 'uppercase'
        })
    };

    const roleColors = {
        owner: { bg: 'rgba(234,179,8,0.2)', color: '#eab308' },
        editor: { bg: 'rgba(59,130,246,0.2)', color: '#3b82f6' },
        viewer: { bg: 'rgba(148,163,184,0.2)', color: '#94a3b8' }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '12px',
                            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Users size={20} color="white" />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'white' }}>Share Workspace</h2>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Invite others to collaborate</span>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={styles.content}>
                    {/* Collaborators List */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                            Collaborators ({collaborators.length})
                        </label>
                        {collaborators.map(collab => (
                            <div key={collab.id} style={styles.collaboratorRow}>
                                <div style={styles.avatar(collab.role === 'owner' ? 'linear-gradient(135deg, #eab308, #f59e0b)' : 'linear-gradient(135deg, #3b82f6, #6366f1)')}>
                                    {collab.name.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>
                                        {collab.name} {collab.role === 'owner' && '(You)'}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{collab.email}</div>
                                </div>
                                <span style={styles.badge(roleColors[collab.role].bg, roleColors[collab.role].color)}>
                                    {collab.role === 'owner' && <Crown size={10} style={{ marginRight: '4px' }} />}
                                    {collab.role}
                                </span>
                                {collab.role !== 'owner' && (
                                    <button
                                        onClick={() => handleRemoveCollaborator(collab.id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Add Collaborator */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                        <input
                            type="email"
                            placeholder="Enter email to invite..."
                            value={newEmail}
                            onChange={e => setNewEmail(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddCollaborator()}
                            style={styles.input}
                        />
                        <button onClick={handleAddCollaborator} style={styles.btn}>
                            <Plus size={16} /> Add
                        </button>
                    </div>

                    {/* Share Link */}
                    <div style={{
                        padding: '16px', borderRadius: '12px',
                        background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)'
                    }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold', color: '#a855f7', textTransform: 'uppercase', marginBottom: '10px' }}>
                            <Link size={12} /> Share Folder Path
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <div style={{
                                flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)',
                                fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis'
                            }}>
                                {workspacePath || localStorage.getItem('springroll_workspace_path') || 'C:\\Users\\Shared\\Workspace'}
                            </div>
                            <button
                                onClick={handleCopyPath}
                                style={{
                                    padding: '12px 16px', borderRadius: '8px', border: 'none',
                                    background: copied ? '#10b981' : 'rgba(255,255,255,0.1)',
                                    color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                                }}
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <p style={{ margin: '12px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                            Share this folder via Dropbox, OneDrive, or network share. Collaborators open Springroll and point to this folder.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareWorkspaceModal;
