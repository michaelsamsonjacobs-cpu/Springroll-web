const { chromium } = require('playwright');

let browser = null;
let context = null;
let page = null;

// Helper to send logs
const log = (msg) => {
    console.log(JSON.stringify({ type: 'log', message: msg }));
};

async function startBrowser() {
    if (browser) return;

    log('Launching Chromium...');
    browser = await chromium.launch({
        headless: false, // User wants to SEE the automation
        args: ['--start-maximized']
    });

    context = await browser.newContext({ viewport: null });
    page = await context.newPage();
    log('Browser launched successfully.');
}

async function closeBrowser() {
    if (browser) {
        await browser.close();
        browser = null;
        context = null;
        page = null;
        log('Browser closed.');
    }
}

async function executeWorkflow(steps) {
    if (!page) {
        throw new Error("Browser not running. Call start_browser first.");
    }

    log(`Executing workflow with ${steps.length} steps...`);
    const results = [];

    for (const [index, step] of steps.entries()) {
        try {
            log(`Step ${index + 1}: ${step.type} - ${step.description || ''}`);

            switch (step.type) {
                case 'navigate':
                    await page.goto(step.url);
                    break;

                case 'click':
                    await page.click(step.selector);
                    break;

                case 'type':
                    await page.fill(step.selector, step.value);
                    break;

                case 'wait':
                    await page.waitForTimeout(step.duration || 1000);
                    break;

                case 'screenshot':
                    const path = step.path || `screenshot_${Date.now()}.png`;
                    await page.screenshot({ path });
                    results.push({ step: index, output: path });
                    break;

                default:
                    log(`Warning: Unknown step type ${step.type}`);
            }
            results.push({ step: index, status: 'success' });

        } catch (err) {
            log(`Error at step ${index + 1}: ${err.message}`);
            return { success: false, error: err.message, stepIndex: index };
        }
    }

    return { success: true, results };
}

module.exports = { startBrowser, closeBrowser, executeWorkflow };
