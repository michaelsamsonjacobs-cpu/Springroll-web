/**
 * ClassroomService - Manages Sovereign Classroom folder operations
 */

const CLASSROOM_CONFIG_FILE = '.springroll/config.json';

export const ClassroomService = {
    // Get stored classroom path
    getClassroomPath() {
        return localStorage.getItem('springroll_classroom_path') || null;
    },

    setClassroomPath(path) {
        localStorage.setItem('springroll_classroom_path', path);
    },

    // Get current user role
    getRole() {
        return localStorage.getItem('springroll_role') || 'user';
    },

    setRole(role) {
        localStorage.setItem('springroll_role', role);
    },

    // Get student name (for student view)
    getStudentName() {
        return localStorage.getItem('springroll_student_name') || 'Student';
    },

    setStudentName(name) {
        localStorage.setItem('springroll_student_name', name);
    },

    // Check if in team mode
    isTeamMode() {
        return !!this.getClassroomPath();
    },

    // Mock: Get students list (in real app, would scan /Students folder)
    async getStudents() {
        // Simulated data - in production would use Tauri to scan filesystem
        return [
            { id: 'alice', name: 'Alice Smith', folder: 'Alice_Smith', files: 3, progress: 80, lastActivity: '2 min ago' },
            { id: 'bob', name: 'Bob Jones', folder: 'Bob_Jones', files: 1, progress: 40, lastActivity: '1 hr ago' },
            { id: 'charlie', name: 'Charlie Lee', folder: 'Charlie_Lee', files: 2, progress: 30, lastActivity: '3 hrs ago' },
            { id: 'diana', name: 'Diana Chen', folder: 'Diana_Chen', files: 4, progress: 95, lastActivity: '5 min ago' },
            { id: 'evan', name: 'Evan Park', folder: 'Evan_Park', files: 2, progress: 60, lastActivity: '30 min ago' },
        ];
    },

    // Mock: Get recent activity
    async getRecentActivity() {
        return [
            { type: 'upload', student: 'Alice Smith', file: 'FinalDraft.docx', time: '2 min ago' },
            { type: 'feedback', student: 'Bob Jones', file: 'Draft1.docx', time: '1 hr ago' },
            { type: 'upload', student: 'Diana Chen', file: 'Research.pdf', time: '5 min ago' },
        ];
    },

    // Save feedback for a student
    async saveFeedback(studentFolder, content) {
        // In production: Write to _feedback.md using Tauri fs API
        console.log(`Saving feedback to ${studentFolder}/_feedback.md:`, content);
        const feedbacks = JSON.parse(localStorage.getItem('springroll_feedbacks') || '{}');
        feedbacks[studentFolder] = feedbacks[studentFolder] || [];
        feedbacks[studentFolder].push({
            content,
            date: new Date().toISOString(),
            author: 'Admin'
        });
        localStorage.setItem('springroll_feedbacks', JSON.stringify(feedbacks));
        return true;
    },

    // Get feedback for a student
    getFeedback(studentFolder) {
        const feedbacks = JSON.parse(localStorage.getItem('springroll_feedbacks') || '{}');
        return feedbacks[studentFolder] || [];
    },

    // Clear team mode
    exitTeamMode() {
        localStorage.removeItem('springroll_classroom_path');
        localStorage.removeItem('springroll_role');
        localStorage.removeItem('springroll_student_name');
    }
};

export default ClassroomService;
