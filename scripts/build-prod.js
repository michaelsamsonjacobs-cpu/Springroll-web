
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const distDir = path.join(rootDir, 'dist');
const websiteDir = path.join(rootDir, 'website');
const appDestDir = path.join(distDir, 'app');

console.log('🚀 Starting Production Build...');

// 1. Clean dist
if (fs.existsSync(distDir)) {
    console.log('🧹 Cleaning dist directory...');
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir);

// 2. Build React App (Vite)
// Ensure vite config is set to base: '/app/' or passed via CLI
console.log('📦 Building React App...');
try {
    // We pass base explicitly to ensure it overrides whatever is in config if needed
    execSync('npx vite build --base=/app/', { stdio: 'inherit', cwd: rootDir });
} catch (e) {
    console.error('❌ Build failed', e);
    process.exit(1);
}

// 3. Move App to /app subdirectory
console.log('📂 Moving App to /app subdirectory...');
// The build output is currently in dist/ (mixed with assets)
// We need to move everything from dist/ to dist/app/
// BUT wait, Vite clears dist by default.
// Let's create a temp dir for the expected move?
// Actually easy way: rename dist to dist/app.
// Use renameSync.

const tempDist = path.join(rootDir, 'dist_temp');
if (fs.existsSync(tempDist)) fs.rmSync(tempDist, { recursive: true, force: true });

// Move current dist to temp
fs.renameSync(distDir, tempDist);

// Recreate dist
fs.mkdirSync(distDir);
fs.mkdirSync(appDestDir);

// Move temp contents to dist/app
fs.cpSync(tempDist, appDestDir, { recursive: true });
fs.rmSync(tempDist, { recursive: true, force: true });


// 4. Copy Marketing Site to root
console.log('website contents...');
if (fs.existsSync(websiteDir)) {
    fs.cpSync(websiteDir, distDir, { recursive: true });
    console.log('✅ Marketing site copied to root');
} else {
    console.warn('⚠️ No website directory found! Root will be empty.');
}

console.log('🎉 Build Complete!');
console.log('  - Marketing Site: /');
console.log('  - App: /app/');
