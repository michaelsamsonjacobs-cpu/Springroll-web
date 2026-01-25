import { Command } from '@tauri-apps/plugin-shell';
import { resolveResource } from '@tauri-apps/api/path';
import { GeminiService } from './GeminiService';

export const ContactScraperService = {
    // Search LinkedIn contacts via Local AI Scraper
    async searchContacts(keyword) {
        console.log('Searching LinkedIn contacts for:', keyword);

        try {
            // Check for Gemini API key
            const apiKey = GeminiService.getGeminiKey();
            if (!apiKey) {
                throw new Error('Gemini API Key required for AI scraping.');
            }

            // Ensure we are in Tauri environment
            if (typeof window !== 'undefined' && !window.__TAURI__) {
                console.warn('Scraper Skipped: Not in Tauri environment.');
                return [];
            }

            console.log('🚀 Spawning Local AI Scraper (LinkedIn)...');

            // Resolve script path
            const scriptPath = await resolveResource('scripts/scraper-service.js');

            // Spawn Node.js sidecar
            const command = Command.create('node', [
                scriptPath,
                `--source=linkedin`,
                `--keyword=${keyword}`,
                `--apiKey=${apiKey}`
            ]);

            const output = await command.execute();

            if (output.code !== 0) {
                console.error('Scraper Error Output:', output.stderr);
                throw new Error(`Scraper process exited with code ${output.code}`);
            }

            const result = JSON.parse(output.stdout);

            if (!result.success) {
                throw new Error(result.error || 'Unknown scraper error');
            }

            console.log('✅ Scraper Success:', result.data.length, 'contacts found.');

            // Map results format
            return result.data.map((c, i) => ({
                id: `LINKEDIN-${Date.now()}-${i}`,
                name: c.name || 'Unknown Contact',
                role: c.title || 'Unknown Role',
                company: c.company || 'Unknown Company',
                email: 'Enrichment Pending', // Scraper won't get email easily
                phone: 'N/A',
                status: 'New',
                source: 'LinkedIn (AI Scraped)',
                lastContact: 'Never',
                notes: c.location || ''
            }));

        } catch (error) {
            console.error('❌ Local Scraper Failed:', error);
            throw error;
        }
    }
};
