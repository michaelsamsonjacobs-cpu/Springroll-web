/**
 * Repo Service
 * Facilitates downloading public Git repos and external documentation
 * to the local Springroll environment.
 */

import { invoke } from '@tauri-apps/api/core';

export const RepoService = {
    /**
     * Downloads a repository or file from a URL
     */
    download: async (url, targetDir = 'downloads') => {
        try {
            console.log(`[RepoService] Starting native download: ${url}`);

            // Link to Rust backend command
            const result = await invoke('download_repo', { url });

            const repoInfo = {
                status: 'success',
                name: url.split('/').pop().replace('.git', ''),
                path: `${targetDir}/${url.split('/').pop()}`,
                message: result,
                indexedAt: new Date().toISOString()
            };

            RepoService.saveToCatalog(repoInfo);
            return repoInfo;
        } catch (error) {
            console.error('[RepoService] Native download failed:', error);
            throw error;
        }
    },

    /**
     * Lists available repos indexed by Springroll
     */
    listLocalRepos: () => {
        return JSON.parse(localStorage.getItem('springroll_repos') || '[]');
    },

    saveToCatalog: (repo) => {
        const repos = RepoService.listLocalRepos();
        repos.push(repo);
        localStorage.setItem('springroll_repos', JSON.stringify(repos));
    }
};
