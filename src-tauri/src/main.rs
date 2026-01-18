#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[tauri::command]
fn read_file_content(path: &str) -> Result<String, String> {
    std::fs::read_to_string(path)
        .map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
fn get_system_info() -> String {
    // Get GPU info via nvidia-smi
    let gpu_info = match std::process::Command::new("nvidia-smi")
        .args(["--query-gpu=name,memory.total", "--format=csv,noheader"])
        .output()
    {
        Ok(output) if output.status.success() => {
            String::from_utf8_lossy(&output.stdout).trim().to_string()
        }
        _ => "No NVIDIA GPU detected".to_string(),
    };
    
    format!(r#"{{"os": "windows", "gpu": "{}"}}"#, gpu_info)
}

#[tauri::command]
fn run_automation_sidecar(payload: String) -> String {
    // Resolve path to sidecar (dev mode assumption)
    let sidecar_path = "src-tauri/automation-sidecar/index.js";
    
    // Spawn Node process
    let mut child = std::process::Command::new("node")
        .arg(sidecar_path)
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .spawn()
        .expect("Failed to start automation sidecar");

    // Write payload to stdin
    {
        use std::io::Write;
        let stdin = child.stdin.as_mut().expect("Failed to open stdin");
        stdin.write_all(payload.as_bytes()).expect("Failed to write to stdin");
        stdin.write_all(b"\n").expect("Failed to write newline");
    }

    // Wait for output
    let output = child.wait_with_output().expect("Failed to read stdout");
    
    String::from_utf8_lossy(&output.stdout).to_string()
}

#[tauri::command]
fn launch_app(app_name: &str) -> String {
    let cmd = match app_name {
        "calculator" => "calc.exe",
        "notepad" => "notepad.exe",
        _ => return "Unknown app".to_string(),
    };
    
    std::process::Command::new(cmd)
        .spawn()
        .map(|_| "Launched successfully".to_string())
        .unwrap_or_else(|e| format!("Failed to launch: {}", e))
}

#[tauri::command]
fn start_ollama(handle: tauri::AppHandle) -> String {
    use tauri_plugin_shell::ShellExt;
    
    // Check if running first
    let output = std::process::Command::new("curl")
        .args(["http://localhost:11434/api/tags"])
        .output();
        
    if let Ok(o) = output {
        if o.status.success() {
            return "Ollama already running".to_string();
        }
    }

    // Spawn sidecar
    let sidecar_command = handle.shell().sidecar("ollama").unwrap();
    let (mut rx, mut _child) = sidecar_command
        .args(["serve"])
        .spawn()
        .expect("Failed to spawn ollama");

    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            if let tauri_plugin_shell::process::CommandEvent::Stdout(line) = event {
                 println!("Ollama: {:?}", String::from_utf8(line));
            }
        }
    });

    "Ollama started".to_string()
}

#[tauri::command]
fn watch_directory(handle: tauri::AppHandle, path: String) -> String {
    use notify::{Watcher, RecursiveMode, Result, Event};
    use std::sync::mpsc;
    use std::time::Duration;
    use tauri::Emitter; // Tauri 2 emitter trait

    let (tx, rx) = mpsc::channel::<Result<Event>>();
    
    let handle_clone = handle.clone();
    let path_clone = path.clone(); // Clone before moving into thread
    std::thread::spawn(move || {
        let mut watcher = notify::recommended_watcher(move |res: Result<Event>| {
            if let Ok(event) = res {
                let _ = tx.send(Ok(event));
            }
        }).expect("Failed to create watcher");

        watcher.watch(std::path::Path::new(&path_clone), RecursiveMode::Recursive)
            .expect("Failed to watch path");

        // Keep thread alive and emit events
        loop {
            match rx.recv_timeout(Duration::from_secs(1)) {
                Ok(Ok(event)) => {
                    let _ = handle_clone.emit("file-change", serde_json::json!({
                        "kind": format!("{:?}", event.kind),
                        "paths": event.paths.iter().map(|p| p.to_string_lossy().to_string()).collect::<Vec<_>>()
                    }));
                }
                _ => {}
            }
        }
    });

    format!("Watching: {}", path)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![greet, read_file_content, get_system_info, run_automation_sidecar, launch_app, start_ollama, watch_directory])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
