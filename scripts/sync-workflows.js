import fs from 'fs';
import path from 'path';

const WORKFLOWS_DIR = path.resolve('.agent/workflows');
const OUTPUT_FILE = path.resolve('src/generated/workflow-manifest.json');

function sync() {
    console.log('🔄 Syncing workflows from .agent/workflows...');

    if (!fs.existsSync(WORKFLOWS_DIR)) {
        console.error('❌ Workflows directory not found.');
        return;
    }

    if (!fs.existsSync(path.dirname(OUTPUT_FILE))) {
        fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    }

    const files = fs.readdirSync(WORKFLOWS_DIR);
    const manifest = files
        .filter(file => file.endsWith('.md'))
        .map(file => {
            const content = fs.readFileSync(path.join(WORKFLOWS_DIR, file), 'utf8');
            const descriptionMatch = content.match(/description:\s*(.*)/);
            const titleMatch = content.match(/#\s*(.*)/);

            return {
                id: file.replace('.md', ''),
                filename: file,
                label: titleMatch ? titleMatch[1].trim() : file.replace('.md', ''),
                description: descriptionMatch ? descriptionMatch[1].trim() : 'Agentic workflow discovered in local files.',
                path: `.agent/workflows/${file}`
            };
        });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
    console.log(`✅ Synced ${manifest.length} workflows to ${OUTPUT_FILE}`);
}

sync();
