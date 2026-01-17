/**
 * AnnotationService - Admin File Annotations
 * Allows admin users to leave comments on files for team members
 */

const STORAGE_KEY = 'springroll_annotations';

export const AnnotationService = {
    /**
     * Get all annotations
     */
    getAll: () => {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    },

    /**
     * Get annotations for a specific file
     */
    getForFile: (filePath) => {
        const all = AnnotationService.getAll();
        return all.filter(a => a.filePath === filePath);
    },

    /**
     * Add new annotation
     */
    add: (filePath, text, userId = 'admin') => {
        const all = AnnotationService.getAll();
        const newAnnotation = {
            id: crypto.randomUUID(),
            filePath,
            text,
            userId,
            createdAt: new Date().toISOString()
        };
        all.push(newAnnotation);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        return newAnnotation;
    },

    /**
     * Update annotation
     */
    update: (id, text) => {
        const all = AnnotationService.getAll();
        const updated = all.map(a => a.id === id ? { ...a, text, updatedAt: new Date().toISOString() } : a);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },

    /**
     * Delete annotation
     */
    delete: (id) => {
        const all = AnnotationService.getAll();
        const filtered = all.filter(a => a.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    },

    /**
     * Get files with annotations (for badges)
     */
    getFilesWithAnnotations: () => {
        const all = AnnotationService.getAll();
        return [...new Set(all.map(a => a.filePath))];
    },

    /**
     * Count annotations per file
     */
    countByFile: () => {
        const all = AnnotationService.getAll();
        const counts = {};
        all.forEach(a => {
            counts[a.filePath] = (counts[a.filePath] || 0) + 1;
        });
        return counts;
    }
};

export default AnnotationService;
