import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

// Use runtime detection for Tauri to avoid Vite static import analysis
// The @tauri-apps/api/shell module is only available in Tauri context
const getTauriShell = () => {
    // Check if we're in Tauri context
    if (typeof window !== 'undefined' && window.__TAURI__) {
        // Dynamically access the shell APIs if available
        return window.__TAURI__.shell || null;
    }
    return null;
};

const theme = {
    background: '#0f172a', // Slate 900
    foreground: '#f8fafc', // Slate 50
    cursor: '#3b82f6',     // Blue 500
    black: '#000000',
    red: '#ef4444',
    green: '#22c55e',
    yellow: '#eab308',
    blue: '#3b82f6',
    magenta: '#a855f7',
    cyan: '#06b6d4',
    white: '#ffffff',
    brightBlack: '#475569',
    brightRed: '#f87171',
    brightGreen: '#4ade80',
    brightYellow: '#facc15',
    brightBlue: '#60a5fa',
    brightMagenta: '#c084fc',
    brightCyan: '#22d3ee',
    brightWhite: '#ffffff',
};

const Terminal = ({ isVisible }) => {
    const terminalRef = useRef(null);
    const xtermRef = useRef(null);
    const fitAddonRef = useRef(null);
    const [cwd, setCwd] = useState('~');

    // Buffer for current command
    const commandRef = useRef('');

    useEffect(() => {
        if (!terminalRef.current) return;

        // Initialize xterm
        const term = new XTerm({
            cursorBlink: true,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 14,
            theme: theme,
            convertEol: true, // Handle \n as \r\n
            rows: 12,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        term.open(terminalRef.current);
        fitAddon.fit();

        xtermRef.current = term;
        fitAddonRef.current = fitAddon;

        // Welcome message via write
        term.writeln('\x1b[1;34mWelcome to Springroll Team Terminal\x1b[0m');
        term.writeln('Type commands below (e.g. \x1b[32mdir\x1b[0m, \x1b[32mnpm test\x1b[0m)');
        prompt(term);

        // KEY HANDLING
        term.onData(async (data) => {
            const code = data.charCodeAt(0);

            // Enter key (13)
            if (code === 13) {
                term.write('\r\n');
                await executeCommand(commandRef.current.trim(), term);
                commandRef.current = '';
                return;
            }

            // Backspace (127)
            if (code === 127) {
                if (commandRef.current.length > 0) {
                    commandRef.current = commandRef.current.slice(0, -1);
                    term.write('\b \b');
                }
                return;
            }

            // Printable characters
            if (code >= 32 && code <= 126) {
                commandRef.current += data;
                term.write(data);
            }
        });

        // Resize observer
        const resizeObserver = new ResizeObserver(() => {
            try { fitAddon.fit(); } catch (e) { }
        });
        resizeObserver.observe(terminalRef.current);

        return () => {
            term.dispose();
            resizeObserver.disconnect();
        };
    }, []);

    // Re-fit when visibility changes
    useEffect(() => {
        if (isVisible && fitAddonRef.current) {
            setTimeout(() => fitAddonRef.current.fit(), 100);
        }
    }, [isVisible]);

    const prompt = (term) => {
        term.write(`\r\n\x1b[1;34m${cwd} $ \x1b[0m`);
    };

    const executeCommand = async (cmdString, term) => {
        if (!cmdString) {
            prompt(term);
            return;
        }

        if (cmdString === 'clear' || cmdString === 'cls') {
            term.clear();
            prompt(term);
            return;
        }

        // Basic CD tracking implementation (naive)
        // Real tracking requires stateful shell, but this is a command runner.
        // We cannot easily 'cd' because each command spawns a NEW shell instance.
        // For now, we always run from root or allow user to chain commands.

        try {
            const shell = getTauriShell();
            if (!shell) {
                term.writeln('\x1b[31mTauri Shell not available. Are you in a browser?\x1b[0m');
                prompt(term);
                return;
            }

            // Determine OS shell
            const isWin = navigator.platform.toLowerCase().includes('win');
            const shellCmd = isWin ? 'powershell' : 'sh';
            const shellArgs = isWin ? ['-Command', cmdString] : ['-c', cmdString];

            term.writeln(`\x1b[90mRunning: ${shellCmd} ${shellArgs.join(' ')}\x1b[0m`);

            const command = new shell.Command(shellCmd, shellArgs);

            command.stdout.on('data', line => term.writeln(line));
            command.stderr.on('data', line => term.writeln(`\x1b[31m${line}\x1b[0m`));

            const result = await command.execute();

            if (result.code !== 0) {
                term.writeln(`Exited with code ${result.code}`);
            }

        } catch (e) {
            term.writeln(`\r\n\x1b[31mError: ${e.message}\x1b[0m`);
        }

        prompt(term);
    };

    return (
        <div
            ref={terminalRef}
            style={{
                width: '100%',
                height: '100%',
                padding: '8px',
                background: '#0f172a',
                overflow: 'hidden'
            }}
        />
    );
};

export default Terminal;
