
const { chromium } = require('playwright');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const args = process.argv.slice(2).reduce((acc, arg) => {
    const [key, value] = arg.split('=');
    if (key && value) acc[key.replace(/^--/, '')] = value;
    return acc;
}, {});

const { source, keyword, apiKey } = args;

if (!apiKey) {
    console.error(JSON.stringify({ error: 'Missing API Key' }));
    process.exit(1);
}

if (!keyword) {
    console.error(JSON.stringify({ error: 'Missing keyword' }));
    process.exit(1);
}

async function scrapeSAM(keyword, page) {
    const searchUrl = `https://sam.gov/search/?page=1&pageSize=25&sort=-modifiedDate&sfm%5BsimpleSearch%5D%5BkeywordRadio%5D=ALL&sfm%5BsimpleSearch%5D%5BkeywordTags%5D=${encodeURIComponent(keyword)}&sfm%5Bstatus%5D%5Bis_active%5D=true`;

    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    try {
        await page.waitForSelector('.sds-search-result-list', { timeout: 10000 });
    } catch (e) { /* ignore */ }

    const bodyText = await page.evaluate(() => document.body.innerText);
    return bodyText.slice(0, 30000);
}

async function scrapeLinkedIn(keyword, page) {
    // Google Search Pivot (Safer)
    const searchUrl = `https://www.google.com/search?q=site:linkedin.com/in/ "${keyword}"`;

    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    try {
        await page.waitForSelector('#search', { timeout: 10000 });
    } catch (e) { /* ignore */ }

    const bodyText = await page.evaluate(() => document.body.innerText);
    return bodyText.slice(0, 30000);
}

async function extractWithGemini(text, keyword, source) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = "";

    if (source === 'sam.gov') {
        prompt = `
        You are a government contract analyst. 
        Analyze the following text scraped from SAM.gov search results for "${keyword}".
        
        Extract a list of distinct contract opportunities.
        Return a strictly valid JSON array of objects (no markdown).
        
        Fields: title, agency, noticeId, deadline, description, naics.
        If none found, return [].
        
        TEXT:
        ${text}
        `;
    } else if (source === 'linkedin') {
        prompt = `
        You are a lead generation specialist.
        Analyze the following text scraped from Google Search results for LinkedIn profiles matching "${keyword}".
        
        Extract a list of distinct professionals.
        Return a strictly valid JSON array of objects (no markdown).
        
        Fields: name, title, company, location, link (if available).
        If none found, return [].
        
        TEXT:
        ${text}
        `;
    } else {
        throw new Error("Unknown source for extraction prompt");
    }

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();
        const jsonStr = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        throw new Error(`AI Extraction failed: ${error.message}`);
    }
}

(async () => {
    let browser = null;
    try {
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        const page = await context.newPage();

        let rawText = "";

        if (source === 'sam.gov') {
            rawText = await scrapeSAM(keyword, page);
        } else if (source === 'linkedin') {
            rawText = await scrapeLinkedIn(keyword, page);
        } else {
            throw new Error(`Unknown source: ${source}`);
        }

        const data = await extractWithGemini(rawText, keyword, source);
        console.log(JSON.stringify({ success: true, data: data }));

    } catch (error) {
        console.log(JSON.stringify({ success: false, error: error.message }));
    } finally {
        if (browser) await browser.close();
    }
})();
