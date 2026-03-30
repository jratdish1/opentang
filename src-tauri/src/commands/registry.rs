// OpenTang M6 — Package Registry commands

use tauri::Emitter;
use std::io::{BufRead, BufReader};
use std::path::PathBuf;
use std::process::Stdio;

use serde::{Deserialize, Serialize};

// Embed the bundled registry at compile time as a fallback
const BUNDLED_REGISTRY: &str = include_str!("../../../registry/index.json");

// ── Structs ───────────────────────────────────────────────────────────────────

#[derive(Serialize, Deserialize, Clone)]
pub struct Package {
    pub id: String,
    pub name: String,
    pub version: String,
    pub description: String,
    pub category: String,
    pub tags: Vec<String>,
    pub icon: String,
    pub min_ram_mb: u64,
    pub min_disk_gb: serde_json::Value,
    pub port: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url_path: Option<String>,
    pub koba42_featured: bool,
    pub official: bool,
    pub compose_service: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Registry {
    pub version: String,
    pub updated: String,
    pub packages: Vec<Package>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct InstallState {
    pub version: String,
    #[serde(rename = "installedAt")]
    pub installed_at: String,
    pub edition: String,
    #[serde(rename = "installPath")]
    pub install_path: String,
    #[serde(rename = "networkMode")]
    pub network_mode: String,
    pub domain: Option<String>,
    #[serde(rename = "installedPackages")]
    pub installed_packages: Vec<String>,
}

#[derive(Serialize, Clone)]
struct ProgressEvent {
    step_id: String,
    status: String,
    message: String,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

fn resolve_path(raw: &str) -> Result<PathBuf, String> {
    if raw.starts_with('~') {
        let home = dirs::home_dir().ok_or("Could not determine home directory")?;
        Ok(home.join(&raw[2..]))
    } else {
        Ok(PathBuf::from(raw))
    }
}

fn parse_bundled() -> Result<Registry, String> {
    serde_json::from_str(BUNDLED_REGISTRY).map_err(|e| format!("Failed to parse bundled registry: {e}"))
}

/// Return the docker-compose YAML snippet for a known package id.
fn service_yaml(id: &str) -> Option<String> {
    let yaml = match id {
        "n8n" => r#"  n8n:
    image: n8nio/n8n:latest
    restart: unless-stopped
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - opentang
"#.to_string(),
        "uptime-kuma" => r#"  uptime-kuma:
    image: louislam/uptime-kuma:latest
    restart: unless-stopped
    ports:
      - "3003:3001"
    volumes:
      - uptime_kuma_data:/app/data
    networks:
      - opentang
"#.to_string(),
        "vaultwarden" => r#"  vaultwarden:
    image: vaultwarden/server:latest
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      - vaultwarden_data:/data
    networks:
      - opentang
"#.to_string(),
        "nextcloud" => r#"  nextcloud:
    image: nextcloud:latest
    restart: unless-stopped
    ports:
      - "8081:80"
    volumes:
      - nextcloud_data:/var/www/html
    networks:
      - opentang
"#.to_string(),
        "searxng" => r#"  searxng:
    image: searxng/searxng:latest
    restart: unless-stopped
    ports:
      - "8082:8080"
    volumes:
      - searxng_data:/etc/searxng
    networks:
      - opentang
"#.to_string(),
        _ => return None,
    };
    Some(yaml)
}

fn volume_for_service(id: &str) -> Option<&'static str> {
    match id {
        "n8n" => Some("  n8n_data:\n"),
        "uptime-kuma" => Some("  uptime_kuma_data:\n"),
        "vaultwarden" => Some("  vaultwarden_data:\n"),
        "nextcloud" => Some("  nextcloud_data:\n"),
        "searxng" => Some("  searxng_data:\n"),
        _ => None,
    }
}

/// Append a new service to docker-compose.yml.
fn append_service_to_compose(compose_path: &PathBuf, package_id: &str) -> Result<(), String> {
    let svc_yaml = service_yaml(package_id)
        .ok_or_else(|| format!("No compose template for package '{package_id}'"))?;

    let existing = std::fs::read_to_string(compose_path)
        .map_err(|e| format!("Failed to read docker-compose.yml: {e}"))?;

    // Avoid duplicates
    if existing.contains(&format!("  {package_id}:")) || existing.contains(&format!("  {}:", package_id.replace('-', "_"))) {
        return Ok(()); // already present
    }

    // Add volume declaration if needed
    let mut updated = existing.clone();
    if let Some(vol) = volume_for_service(package_id) {
        if let Some(pos) = updated.find("\nservices:") {
            // insert volume line before "services:" block
            updated.insert_str(pos, &format!("\n{vol}"));
        }
    }

    // Append service at end of file
    updated.push('\n');
    updated.push_str(&svc_yaml);

    std::fs::write(compose_path, updated)
        .map_err(|e| format!("Failed to write docker-compose.yml: {e}"))?;

    Ok(())
}

/// Remove a service block from docker-compose.yml (best-effort line-based removal).
fn remove_service_from_compose(compose_path: &PathBuf, package_id: &str) -> Result<(), String> {
    let content = std::fs::read_to_string(compose_path)
        .map_err(|e| format!("Failed to read docker-compose.yml: {e}"))?;

    let service_header = format!("  {}:", package_id);
    let mut lines: Vec<&str> = content.lines().collect();
    let mut start_idx = None;

    for (i, line) in lines.iter().enumerate() {
        if line.trim_end() == service_header.trim_end() {
            start_idx = Some(i);
            break;
        }
    }

    if let Some(start) = start_idx {
        // Find end: next top-level service entry or end of services block
        let mut end = start + 1;
        while end < lines.len() {
            let l = lines[end];
            // Another service at the same indent level, or a top-level key
            if (l.starts_with("  ") && !l.starts_with("   ") && l.ends_with(':') && end != start) {
                break;
            }
            if !l.starts_with(' ') && !l.is_empty() {
                break;
            }
            end += 1;
        }
        lines.drain(start..end);
        std::fs::write(compose_path, lines.join("\n") + "\n")
            .map_err(|e| format!("Failed to write docker-compose.yml: {e}"))?;
    }

    Ok(())
}

fn emit_progress(app: &tauri::AppHandle, step_id: &str, status: &str, message: &str) {
    let _ = app.emit(
        "install-progress",
        ProgressEvent {
            step_id: step_id.to_string(),
            status: status.to_string(),
            message: message.to_string(),
        },
    );
}

fn run_compose_command_streaming(
    path: PathBuf,
    args: Vec<String>,
    step_id: String,
    app: tauri::AppHandle,
) {
    emit_progress(&app, &step_id, "active", &format!("Running: docker compose {}", args.join(" ")));

    let mut child = match std::process::Command::new("docker")
        .arg("compose")
        .args(&args)
        .current_dir(&path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
    {
        Ok(c) => c,
        Err(e) => {
            emit_progress(&app, &step_id, "error", &format!("Failed to spawn docker: {e}"));
            return;
        }
    };

    let stdout = child.stdout.take().unwrap();
    let stderr = child.stderr.take().unwrap();
    let app_out = app.clone();
    let app_err = app.clone();
    let id_out = step_id.clone();
    let id_err = step_id.clone();

    let out_handle = std::thread::spawn(move || {
        for line in BufReader::new(stdout).lines().flatten() {
            emit_progress(&app_out, &id_out, "log", &line);
        }
    });
    let err_handle = std::thread::spawn(move || {
        for line in BufReader::new(stderr).lines().flatten() {
            emit_progress(&app_err, &id_err, "log", &line);
        }
    });

    out_handle.join().ok();
    err_handle.join().ok();

    let exit_ok = child.wait().map(|s| s.success()).unwrap_or(false);

    if exit_ok {
        emit_progress(&app, &step_id, "done", "Done.");
        let _ = app.emit("install-complete", ());
    } else {
        emit_progress(&app, &step_id, "error", "Command exited with an error — check logs.");
    }
}

// ── Commands ──────────────────────────────────────────────────────────────────

/// Fetch the registry. Tries the remote URL first; falls back to the bundled copy.
#[tauri::command]
pub async fn get_registry() -> Result<Registry, String> {
    const REMOTE_URL: &str = "https://registry.opentang.koba42.com/index.json";

    #[cfg(feature = "registry-fetch")]
    {
        match reqwest::get(REMOTE_URL).await {
            Ok(resp) if resp.status().is_success() => {
                if let Ok(reg) = resp.json::<Registry>().await {
                    return Ok(reg);
                }
            }
            _ => {}
        }
    }

    // Offline fallback — always works
    let _ = REMOTE_URL; // suppress unused warning in non-fetch builds
    parse_bundled()
}

/// Install a package: append its service to docker-compose.yml, then start it.
#[tauri::command]
pub async fn install_package(
    package_id: String,
    install_path: String,
    app: tauri::AppHandle,
) -> Result<(), String> {
    let path = resolve_path(&install_path)?;
    let compose_path = path.join("docker-compose.yml");

    if !compose_path.exists() {
        return Err("docker-compose.yml not found — run the installer first".to_string());
    }

    append_service_to_compose(&compose_path, &package_id)?;

    let pid = package_id.clone();
    std::thread::spawn(move || {
        run_compose_command_streaming(path, vec!["up".into(), "-d".into(), pid.clone()], pid, app);
    });

    Ok(())
}

/// Remove a package: stop and delete the container, remove from compose.
#[tauri::command]
pub async fn remove_package(package_id: String, install_path: String) -> Result<(), String> {
    let path = resolve_path(&install_path)?;

    // Stop and remove container
    std::process::Command::new("docker")
        .args(["compose", "stop", &package_id])
        .current_dir(&path)
        .output()
        .map_err(|e| format!("Failed to stop service: {e}"))?;

    std::process::Command::new("docker")
        .args(["compose", "rm", "-f", &package_id])
        .current_dir(&path)
        .output()
        .map_err(|e| format!("Failed to remove service: {e}"))?;

    let compose_path = path.join("docker-compose.yml");
    if compose_path.exists() {
        remove_service_from_compose(&compose_path, &package_id)?;
    }

    Ok(())
}

/// Update a package: pull the latest image and restart.
#[tauri::command]
pub async fn update_package(
    package_id: String,
    install_path: String,
    app: tauri::AppHandle,
) -> Result<(), String> {
    let path = resolve_path(&install_path)?;
    let pid = package_id.clone();

    std::thread::spawn(move || {
        // Pull latest image
        run_compose_command_streaming(
            path.clone(),
            vec!["pull".into(), pid.clone()],
            format!("{pid}-pull"),
            app.clone(),
        );
        // Restart with new image
        run_compose_command_streaming(
            path,
            vec!["up".into(), "-d".into(), pid.clone()],
            format!("{pid}-up"),
            app,
        );
    });

    Ok(())
}

/// Read ~/.opentang/opentang-state.json. Returns None if it doesn't exist.
#[tauri::command]
pub async fn load_install_state(install_path: String) -> Result<Option<InstallState>, String> {
    let path = resolve_path(&install_path)?;
    let state_path = path.join("opentang-state.json");

    if !state_path.exists() {
        return Ok(None);
    }

    let raw = std::fs::read_to_string(&state_path)
        .map_err(|e| format!("Failed to read state file: {e}"))?;

    let state: InstallState = serde_json::from_str(&raw)
        .map_err(|e| format!("Failed to parse state file: {e}"))?;

    Ok(Some(state))
}

/// Write ~/.opentang/opentang-state.json.
#[tauri::command]
pub async fn save_install_state(state: InstallState, install_path: String) -> Result<(), String> {
    let path = resolve_path(&install_path)?;
    std::fs::create_dir_all(&path)
        .map_err(|e| format!("Failed to create install directory: {e}"))?;

    let state_path = path.join("opentang-state.json");
    let json = serde_json::to_string_pretty(&state)
        .map_err(|e| format!("Failed to serialize state: {e}"))?;

    std::fs::write(&state_path, json)
        .map_err(|e| format!("Failed to write state file: {e}"))?;

    Ok(())
}
