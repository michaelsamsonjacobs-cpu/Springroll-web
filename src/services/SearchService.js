import { invoke } from '@tauri-apps/api/core';

/**
 * Search Service
 * Handles local file indexing and RAG queries for multiple workspaces
 */
export const SearchService = {
    /**
     * Helper: Get all workspaces
     */
    getWorkspaces: () => {
        return JSON.parse(localStorage.getItem('springroll_workspaces') || '[]');
    },

    /**
     * Helper: Save workspaces
     */
    saveWorkspaces: (workspaces) => {
        localStorage.setItem('springroll_workspaces', JSON.stringify(workspaces));
    },

    /**
     * Remove a workspace by root path
     */
    removeWorkspace: (path) => {
        const workspaces = SearchService.getWorkspaces();
        const filtered = workspaces.filter(w => w.root !== path);
        SearchService.saveWorkspaces(filtered);
        return filtered;
    },

    /**
     * Indexes a directory recursively and adds/updates it in the workspace list
     */
    indexDirectory: async (path) => {
        try {
            console.log(`[SearchService] Indexing directory: ${path}`);
            const files = await invoke('list_files_recursive', { path });

            // Create new index object
            const newIndex = {
                root: path,
                name: path.split(/[/\\]/).pop(), // folder name
                files: files,
                indexedAt: new Date().toISOString()
            };

            // Get existing workspaces
            const workspaces = SearchService.getWorkspaces();

            // Remove existing entry for this path if it exists (update)
            const filtered = workspaces.filter(w => w.root !== path);

            // Add new index
            const updatedWorkspaces = [...filtered, newIndex];
            SearchService.saveWorkspaces(updatedWorkspaces);

            // Also update legacy key for backward compatibility or single-workspace components for now
            localStorage.setItem('springroll_last_index', JSON.stringify(newIndex));

            return updatedWorkspaces;
        } catch (error) {
            console.error('[SearchService] Indexing failed:', error);
            throw error;
        }
    },

    /**
     * Searches for local context based on a query across ALL workspaces
     */
    getLocalContext: async (query) => {
        const workspaces = SearchService.getWorkspaces();
        if (workspaces.length === 0) return "";

        const keywords = query.toLowerCase().split(' ');
        let allMatchedFiles = [];

        // Aggregate matches from all workspaces
        workspaces.forEach(ws => {
            const matches = ws.files.filter(file => {
                const fileName = file.toLowerCase();
                return keywords.some(k => fileName.includes(k));
            }).slice(0, 3); // Top 3 per workspace
            allMatchedFiles = [...allMatchedFiles, ...matches];
        });

        // Limit total files to avoid context window explosion
        const topFiles = allMatchedFiles.slice(0, 6);

        let context = "Relevant local files found:\n";
        for (const file of topFiles) {
            try {
                const content = await invoke('read_file_content', { path: file });
                context += `\n--- FILE: ${file} ---\n${content.slice(0, 1500)}\n`;
            } catch (e) {
                console.warn(`[SearchService] Could not read file ${file}:`, e);
            }
        }

        return context;
    },

    /**
     * Scans folders for contact/lead data files (CSV, JSON, TXT)
     * Extracts emails, names, companies from the content
     */
    scanFolderForContacts: async () => {
        try {
            const workspaces = SearchService.getWorkspaces();
            if (workspaces.length === 0) {
                throw new Error('No workspace indexed. Please index a folder first.');
            }

            // Aggregate data files from all workspaces
            let allDataFiles = [];
            workspaces.forEach(ws => {
                const dataFiles = ws.files.filter(file => {
                    const ext = file.toLowerCase().split('.').pop();
                    return ['csv', 'json', 'txt', 'xlsx', 'md'].includes(ext);
                });
                allDataFiles = [...allDataFiles, ...dataFiles];
            });

            const contacts = [];
            const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

            for (const file of allDataFiles.slice(0, 20)) {
                try {
                    const content = await invoke('read_file_content', { path: file });
                    const ext = file.toLowerCase().split('.').pop();

                    if (ext === 'csv') {
                        // Parse CSV
                        const lines = content.split('\n');
                        const headers = lines[0]?.split(',').map(h => h.trim().toLowerCase());

                        for (let i = 1; i < lines.length; i++) {
                            const values = lines[i].split(',');
                            if (values.length >= 2) {
                                const contact = { source: file };
                                headers.forEach((h, idx) => {
                                    if (h.includes('email')) contact.email = values[idx]?.trim();
                                    if (h.includes('name') && !h.includes('company')) contact.name = values[idx]?.trim();
                                    if (h.includes('company') || h.includes('org')) contact.company = values[idx]?.trim();
                                    if (h.includes('title') || h.includes('role')) contact.title = values[idx]?.trim();
                                    if (h.includes('phone')) contact.phone = values[idx]?.trim();
                                    if (h.includes('linkedin')) contact.linkedin = values[idx]?.trim();
                                });
                                if (contact.email || contact.name) contacts.push(contact);
                            }
                        }
                    } else if (ext === 'json') {
                        // Parse JSON
                        try {
                            const data = JSON.parse(content);
                            const items = Array.isArray(data) ? data : [data];
                            for (const item of items) {
                                if (item.email || item.name) {
                                    contacts.push({
                                        email: item.email,
                                        name: item.name || (item.firstName + ' ' + item.lastName),
                                        company: item.company || item.organization,
                                        title: item.title || item.role,
                                        phone: item.phone,
                                        linkedin: item.linkedin,
                                        source: file
                                    });
                                }
                            }
                        } catch (e) { /* not valid JSON */ }
                    } else {
                        // Extract emails from any text file
                        const emails = content.match(emailRegex) || [];
                        for (const email of [...new Set(emails)].slice(0, 10)) {
                            contacts.push({ email, source: file });
                        }
                    }
                } catch (e) {
                    console.warn(`[SearchService] Could not read ${file}:`, e);
                }
            }

            return {
                contacts,
                filesScanned: allDataFiles.length,
                totalFound: contacts.length
            };
        } catch (error) {
            console.error('[SearchService] Folder scan failed:', error);
            throw error;
        }
    },

    /**
     * Enriches a contact by searching local files for additional info
     */
    enrichContact: async (contact) => {
        const workspaces = SearchService.getWorkspaces();
        if (workspaces.length === 0) return contact;

        const searchTerms = [
            contact.email?.split('@')[0],
            contact.name,
            contact.company
        ].filter(Boolean);

        const enriched = { ...contact };

        // Aggregate matched files from all workspaces
        let allMatchedFiles = [];
        workspaces.forEach(ws => {
            searchTerms.forEach(term => {
                const matches = ws.files.filter(file =>
                    file.toLowerCase().includes(term.toLowerCase())
                ).slice(0, 2);
                allMatchedFiles = [...allMatchedFiles, ...matches];
            });
        });

        // Unique files
        allMatchedFiles = [...new Set(allMatchedFiles)].slice(0, 5);

        for (const file of allMatchedFiles) {
            try {
                const content = await invoke('read_file_content', { path: file });

                // Extract any emails if missing
                if (!enriched.email) {
                    const emailMatch = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
                    if (emailMatch) enriched.email = emailMatch[0];
                }

                // Extract phone if missing
                if (!enriched.phone) {
                    const phoneMatch = content.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
                    if (phoneMatch) enriched.phone = phoneMatch[0];
                }

                // Add context from file
                if (!enriched.notes) enriched.notes = '';
                enriched.notes += `\n[From ${file.split(/[\\/]/).pop()}]: ${content.slice(0, 200)}`;

            } catch (e) { /* ignore */ }
        }

        enriched.enrichedAt = new Date().toISOString();
        return enriched;
    }
};
