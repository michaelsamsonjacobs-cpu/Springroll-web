
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

console.log('🚀 Starting Tauri Production Build...');

// 1. Clean dist
if (fs.existsSync(distDir)) {
    console.log('🧹 Cleaning dist directory...');
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir);

// 2. Build React App (Vite) with base '/'
// We override the /app/ base config specifically for the native app
console.log('📦 Building React App for Native Desktop...');
try {
    execSync('npx vite build --base=/', { stdio: 'inherit', cwd: rootDir });
} catch (e) {
    console.error('❌ Build failed', e);
    process.exit(1);
}

console.log('🎉 Tauri Build Complete!');

// 3. Copy WASM files for Transformers.js
// Crucial for allowing local AI to run without fetching from CDN
console.log('🤖 Copying WASM files for Local AI...');
const wasmSourceDir = path.join(rootDir, 'node_modules', 'onnxruntime-web', 'dist');
const wasmFiles = ['ort-wasm.wasm', 'ort-wasm-simd.wasm', 'ort-wasm-threaded.wasm', 'ort-wasm-simd-threaded.wasm'];

// Ensure dist exists (it should, after build)
if (fs.existsSync(distDir)) {
    wasmFiles.forEach(file => {
        const src = path.join(wasmSourceDir, file);
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, path.join(distDir, file));
            console.log(`   - Copied ${file}`);
        } else {
            console.warn(`   ⚠️ Warning: Could not find ${file}`);
        }
    });
}
