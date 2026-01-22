/**
 * GitWorktreeService.js
 * 
 * Manages isolated git worktrees for parallel agent execution.
 * Allows multiple agents to work on the same repo without file locking issues.
 */

// Invoke helper
const invoke = window.__TAURI__ ? window.__TAURI__.core.invoke : async () => { console.warn("Tauri not found"); return "{}"; };

class GitWorktreeServiceClass {
    constructor() {
        this.baseWorktreesDir = '.springroll/worktrees';
    }

    /**
     * Run a git command via Tauri backend
     * @param {Array<string>} args - Git arguments (e.g., ['status'])
     * @param {string} [cwd] - Optional working directory
     */
    async git(args, cwd = null) {
        try {
            return await invoke('run_git_command', { args, cwd });
        } catch (error) {
            console.error('Git execution failed:', error);
            throw new Error(`Git command failed: ${error}`);
        }
    }

    /**
     * Create a new worktree for a specific task
     * @param {string} taskId - Unique task identifier
     * @param {string} baseBranch - Branch to start from (default: main)
     * @returns {string} Absolute path to the new worktree
     */
    async createWorktree(taskId, baseBranch = 'main') {
        const worktreePath = `${this.baseWorktreesDir}/${taskId}`;
        const newBranch = `agent/${taskId}`;

        console.log(`[Worktree] Creating ${worktreePath} on branch ${newBranch}...`);

        // Ensure .springroll/worktrees exists (git worktree add creates the leaf dir, but maybe not parents?)
        // git worktree add checks out a new branch
        // Command: git worktree add -b <new-branch> <path> <start-point>

        try {
            await this.git([
                'worktree',
                'add',
                '-b', newBranch,
                worktreePath,
                baseBranch
            ]);
            return worktreePath;
        } catch (e) {
            // Handle case where branch already exists?
            if (e.message.includes('already exists')) {
                // Try to just add existing branch
                await this.git(['worktree', 'add', worktreePath, newBranch]);
                return worktreePath;
            }
            throw e;
        }
    }

    /**
     * List active worktrees
     * @returns {Promise<Array<{path: string, head: string, branch: string}>>}
     */
    async list() {
        const output = await this.git(['worktree', 'list', '--porcelain']);
        // Parse porcelain output
        // worktree /path/to/repo
        // HEAD abc123...
        // branch refs/heads/main

        const worktrees = [];
        let current = {};

        output.split('\n').forEach(line => {
            if (line.startsWith('worktree ')) {
                if (current.path) worktrees.push(current);
                current = { path: line.substring(9).trim() };
            } else if (line.startsWith('HEAD ')) {
                current.head = line.substring(5).trim();
            } else if (line.startsWith('branch ')) {
                current.branch = line.substring(7).replace('refs/heads/', '').trim();
            }
        });
        if (current.path) worktrees.push(current);

        return worktrees;
    }

    /**
     * Remove a worktree
     * @param {string} taskId 
     */
    async remove(taskId) {
        const worktreePath = `${this.baseWorktreesDir}/${taskId}`;
        console.log(`[Worktree] Removing ${worktreePath}...`);

        // Command: git worktree remove <path>
        // Note: Using --force if needed might be dangerous, but agents might have uncommitted changes.
        // Let's use standard remove first.
        try {
            await this.git(['worktree', 'remove', worktreePath, '--force']);
            // Using force because ephemeral agent workspaces should be disposable? 
            // Ideally we commit before removing.
            // For now, force remove to ensure cleanup.
        } catch (e) {
            console.warn(`Failed to remove worktree: ${e.message}`);
        }
    }

    /**
     * Commit changes in a worktree
     */
    async commit(worktreePath, message) {
        await this.git(['add', '.'], worktreePath);
        await this.git(['commit', '-m', message], worktreePath);
    }
}

export const GitWorktreeService = new GitWorktreeServiceClass();
export default GitWorktreeService;
