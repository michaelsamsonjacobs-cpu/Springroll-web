/**
 * Team Schedule - Cron-like Scheduling for AI Teammates
 * 
 * Defines when each agent runs and what tasks to execute.
 * Ralph reads this schedule and dispatches tasks accordingly.
 */

import { getWeeklyTasks } from './teamKPIs';

// Days of the week
export const DAYS = {
    MONDAY: 'monday',
    TUESDAY: 'tuesday',
    WEDNESDAY: 'wednesday',
    THURSDAY: 'thursday',
    FRIDAY: 'friday',
    SATURDAY: 'saturday',
    SUNDAY: 'sunday'
};

// Schedule types
export const SCHEDULE_TYPES = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly'
};

/**
 * Master Schedule Configuration
 * Defines when scheduled tasks run
 */
export const TEAM_SCHEDULE = {
    // Time of day to run scheduled tasks (24hr format)
    defaultExecutionTime: '09:00',

    // Timezone for scheduling
    timezone: 'America/Los_Angeles',

    // Weekly schedule overview
    weeklySchedule: {
        monday: {
            focus: 'Planning & Research',
            agents: ['finance', 'legal', 'gtm', 'product', 'dev', 'qa', 'account', 'recruiting', 'trader', 'health'],
            description: 'Start of week: scan for opportunities, review pipelines, plan work'
        },
        tuesday: {
            focus: 'Execution',
            agents: [],
            description: 'Focus on execution - no scheduled agent tasks'
        },
        wednesday: {
            focus: 'Deep Work',
            agents: ['finance', 'legal', 'gtm', 'dev', 'qa', 'recruiting'],
            description: 'Mid-week: drafting, analysis, and deep work'
        },
        thursday: {
            focus: 'Collaboration',
            agents: ['product', 'account', 'health'],
            description: 'Collaboration and research tasks'
        },
        friday: {
            focus: 'Review & Report',
            agents: ['finance', 'legal', 'gtm', 'dev', 'qa', 'trader'],
            description: 'End of week: reviews, compliance checks, reports'
        },
        saturday: {
            focus: 'Off',
            agents: [],
            description: 'Weekend - no scheduled tasks'
        },
        sunday: {
            focus: 'Off',
            agents: [],
            description: 'Weekend - no scheduled tasks'
        }
    },

    // Monthly milestone dates
    monthlyMilestones: {
        1: 'Monthly planning & OKR check-in',
        15: 'Mid-month review',
        28: 'Month-end reports'
    },

    // Quarterly review dates
    quarterlyReviews: {
        Q1: { start: '01-01', end: '03-31', review: '04-05' },
        Q2: { start: '04-01', end: '06-30', review: '07-05' },
        Q3: { start: '07-01', end: '09-30', review: '10-05' },
        Q4: { start: '10-01', end: '12-31', review: '01-05' }
    }
};

/**
 * Get today's scheduled tasks based on day of week
 */
export const getTodaysTasks = () => {
    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[today.getDay()];

    return {
        dayOfWeek,
        schedule: TEAM_SCHEDULE.weeklySchedule[dayOfWeek],
        tasks: getWeeklyTasks(dayOfWeek)
    };
};

/**
 * Check if today is a monthly milestone
 */
export const checkMonthlyMilestone = () => {
    const today = new Date();
    const dayOfMonth = today.getDate();
    return TEAM_SCHEDULE.monthlyMilestones[dayOfMonth] || null;
};

/**
 * Get current quarter info
 */
export const getCurrentQuarter = () => {
    const today = new Date();
    const month = today.getMonth() + 1;

    if (month <= 3) return { quarter: 'Q1', ...TEAM_SCHEDULE.quarterlyReviews.Q1 };
    if (month <= 6) return { quarter: 'Q2', ...TEAM_SCHEDULE.quarterlyReviews.Q2 };
    if (month <= 9) return { quarter: 'Q3', ...TEAM_SCHEDULE.quarterlyReviews.Q3 };
    return { quarter: 'Q4', ...TEAM_SCHEDULE.quarterlyReviews.Q4 };
};

/**
 * Format schedule for display
 */
export const formatScheduleForDisplay = () => {
    const schedule = [];

    Object.entries(TEAM_SCHEDULE.weeklySchedule).forEach(([day, config]) => {
        schedule.push({
            day: day.charAt(0).toUpperCase() + day.slice(1),
            focus: config.focus,
            agents: config.agents.length > 0 ? config.agents.join(', ') : 'None',
            description: config.description
        });
    });

    return schedule;
};

export default TEAM_SCHEDULE;
