export const MemoryStore = {
    save: (key, value) => {
        const memory = JSON.parse(localStorage.getItem('springroll_memory') || '{}');
        memory[key] = {
            value,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('springroll_memory', JSON.stringify(memory));
    },

    get: (key) => {
        const memory = JSON.parse(localStorage.getItem('springroll_memory') || '{}');
        return memory[key]?.value;
    },

    getAll: () => {
        return JSON.parse(localStorage.getItem('springroll_memory') || '{}');
    },

    clear: () => {
        localStorage.removeItem('springroll_memory');
    }
};

export const useMemory = () => {
    return {
        memory: MemoryStore.getAll(),
        save: MemoryStore.save,
        clear: MemoryStore.clear
    };
};
