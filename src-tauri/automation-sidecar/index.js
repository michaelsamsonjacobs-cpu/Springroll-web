const readline = require('readline');
const { executeWorkflow, startBrowser, closeBrowser } = require('./executor');

// Create interface to read from stdin (communication from Rust)
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

// Helper to send log messages back to Rust
const log = (msg) => {
    console.log(JSON.stringify({ type: 'log', message: msg }));
};

const sendResult = (id, result) => {
    console.log(JSON.stringify({ type: 'result', id, result }));
};

const sendError = (id, error) => {
    console.log(JSON.stringify({ type: 'error', id, error: error.message || String(error) }));
};

log('Automation Sidecar Started');

rl.on('line', async (line) => {
    if (!line.trim()) return;

    try {
        const cmd = JSON.parse(line);
        // Command format: { id: "123", action: "start_browser" | "execute_workflow", payload: {} }

        log(`Received command: ${cmd.action}`);

        if (cmd.action === 'start_browser') {
            await startBrowser();
            sendResult(cmd.id, { success: true });
        }
        else if (cmd.action === 'close_browser') {
            await closeBrowser();
            sendResult(cmd.id, { success: true });
        }
        else if (cmd.action === 'execute_workflow') {
            const result = await executeWorkflow(cmd.payload.steps);
            sendResult(cmd.id, result);
        }
        else {
            sendError(cmd.id, { message: 'Unknown Action' });
        }

    } catch (err) {
        log(`Error parsing command: ${err.message}`);
    }
});

// Handle exit
process.on('SIGTERM', async () => {
    await closeBrowser();
    process.exit(0);
});
