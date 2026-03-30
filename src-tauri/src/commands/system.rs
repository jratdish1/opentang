use sysinfo::{Disks, System};
use tauri::Emitter;
use tauri_plugin_opener::OpenerExt;

#[derive(serde::Serialize, serde::Deserialize, Clone)]
pub struct SystemCheckResult {
    pub os: String,
    pub os_version: String,
    pub arch: String,
    pub ram_gb: f64,
    pub ram_available_gb: f64,
    pub disk_gb: f64,
    pub disk_available_gb: f64,
    pub docker_installed: bool,
    pub docker_version: Option<String>,
    pub docker_running: bool,
    pub wsl2_available: bool,
    pub checks: Vec<CheckItem>,
}

#[derive(serde::Serialize, serde::Deserialize, Clone)]
pub struct CheckItem {
    pub id: String,
    pub label: String,
    pub status: CheckStatus,
    pub message: String,
}

#[derive(serde::Serialize, serde::Deserialize, Clone)]
pub enum CheckStatus {
    Pass,
    Warn,
    Fail,
}

fn find_docker_binary() -> Option<std::path::PathBuf> {
    // Common paths where Docker can be installed
    let common_paths = vec![
        "/usr/local/bin/docker",
        "/opt/homebrew/bin/docker",        // Apple Silicon Homebrew
        "/usr/bin/docker",
        "/usr/local/lib/docker/cli-plugins/docker",
        "/Applications/Docker.app/Contents/Resources/bin/docker",
    ];

    // First check if it's in PATH via which
    if let Ok(output) = std::process::Command::new("sh")
        .arg("-c")
        .arg("which docker || command -v docker")
        .env("PATH", "/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin")
        .output()
    {
        if output.status.success() {
            let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !path.is_empty() {
                return Some(std::path::PathBuf::from(path));
            }
        }
    }

    // Fall back to checking common paths
    for path in common_paths {
        let p = std::path::Path::new(path);
        if p.exists() {
            return Some(p.to_path_buf());
        }
    }

    None
}

fn detect_docker() -> (bool, Option<String>, bool) {
    let docker_bin = find_docker_binary().unwrap_or_else(|| std::path::PathBuf::from("docker"));

    // Check if docker is installed by running `docker --version`
    let version_output = std::process::Command::new(&docker_bin)
        .arg("--version")
        .output();

    let (installed, version) = match version_output {
        Ok(out) if out.status.success() => {
            let raw = String::from_utf8_lossy(&out.stdout).to_string();
            // Parse version from "Docker version 24.0.7, build ..."
            let ver = raw
                .split_whitespace()
                .nth(2)
                .map(|s| s.trim_end_matches(',').to_string());
            (true, ver)
        }
        _ => (false, None),
    };

    // Check if docker daemon is running via `docker info`
    let running = if installed {
        std::process::Command::new(&docker_bin)
            .arg("info")
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
    } else {
        false
    };

    (installed, version, running)
}

fn detect_wsl2() -> bool {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("wsl")
            .arg("--status")
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
    }
    #[cfg(not(target_os = "windows"))]
    {
        false
    }
}

fn os_version_string() -> String {
    #[cfg(target_os = "linux")]
    {
        // Try reading /etc/os-release for a friendly name
        if let Ok(content) = std::fs::read_to_string("/etc/os-release") {
            for line in content.lines() {
                if line.starts_with("PRETTY_NAME=") {
                    return line
                        .trim_start_matches("PRETTY_NAME=")
                        .trim_matches('"')
                        .to_string();
                }
            }
        }
        format!("Linux {}", std::env::consts::OS)
    }
    #[cfg(target_os = "macos")]
    {
        let out = std::process::Command::new("sw_vers")
            .arg("-productVersion")
            .output();
        match out {
            Ok(o) if o.status.success() => {
                format!("macOS {}", String::from_utf8_lossy(&o.stdout).trim())
            }
            _ => "macOS".to_string(),
        }
    }
    #[cfg(target_os = "windows")]
    {
        "Windows".to_string()
    }
    #[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
    {
        std::env::consts::OS.to_string()
    }
}

#[tauri::command]
pub async fn install_docker(app: tauri::AppHandle) -> Result<(), String> {
    match std::env::consts::OS {
        "linux" => {
            let _ = app.emit("docker-install-progress", "Downloading Docker install script…");
            let app2 = app.clone();
            tokio::task::spawn_blocking(move || {
                let _ = app2.emit("docker-install-progress", "Running: curl -fsSL https://get.docker.com | sh");
                let output = std::process::Command::new("sh")
                    .arg("-c")
                    .arg("curl -fsSL https://get.docker.com | sh")
                    .output();

                match output {
                    Ok(out) if out.status.success() => {
                        let _ = app2.emit("docker-install-progress", "Docker installed successfully.");
                        let user = std::env::var("USER").unwrap_or_default();
                        if !user.is_empty() {
                            let _ = app2.emit(
                                "docker-install-progress",
                                format!("Adding {} to docker group…", user),
                            );
                            let result = std::process::Command::new("sudo")
                                .args(["usermod", "-aG", "docker", &user])
                                .output();
                            match result {
                                Ok(u) if u.status.success() => {
                                    let _ = app2.emit(
                                        "docker-install-progress",
                                        "Done. Log out and back in for group changes to take effect.",
                                    );
                                }
                                Ok(u) => {
                                    let stderr = String::from_utf8_lossy(&u.stderr).to_string();
                                    let _ = app2.emit(
                                        "docker-install-progress",
                                        format!("Warning: could not add to docker group: {}", stderr),
                                    );
                                }
                                Err(e) => {
                                    let _ = app2.emit(
                                        "docker-install-progress",
                                        format!("Warning: usermod failed: {}", e),
                                    );
                                }
                            }
                        }
                        Ok(())
                    }
                    Ok(out) => {
                        let stderr = String::from_utf8_lossy(&out.stderr).to_string();
                        Err(format!("Install script failed: {}", stderr))
                    }
                    Err(e) => Err(format!("Failed to run install script: {}", e)),
                }
            })
            .await
            .map_err(|e| format!("Task error: {}", e))?
        }
        "macos" => {
            let _ = app.emit(
                "docker-install-progress",
                "Opening orbstack.dev — install OrbStack or Docker Desktop, then click Retry.",
            );
            app.opener()
                .open_url("https://orbstack.dev", None::<String>)
                .map_err(|e| format!("Could not open browser: {}", e))?;
            Ok(())
        }
        "windows" => {
            let _ = app.emit(
                "docker-install-progress",
                "Opening Docker Desktop docs — enable WSL2, install Docker Desktop, then click Retry.",
            );
            app.opener()
                .open_url(
                    "https://docs.docker.com/desktop/install/windows-install/",
                    None::<String>,
                )
                .map_err(|e| format!("Could not open browser: {}", e))?;
            Ok(())
        }
        other => Err(format!("Unsupported OS: {}", other)),
    }
}

#[tauri::command]
pub async fn system_check() -> SystemCheckResult {
    // --- OS & arch ---
    let os = std::env::consts::OS.to_string();
    let arch = std::env::consts::ARCH.to_string();
    let os_version = os_version_string();

    // --- RAM ---
    let mut sys = System::new_all();
    sys.refresh_all();
    let total_bytes = sys.total_memory();
    let available_bytes = sys.available_memory();
    let ram_gb = total_bytes as f64 / 1_073_741_824.0;
    let ram_available_gb = available_bytes as f64 / 1_073_741_824.0;

    // --- Disk ---
    let disks = Disks::new_with_refreshed_list();
    let root_disk = disks.iter().find(|d| {
        let mp = d.mount_point().to_string_lossy();
        if cfg!(target_os = "windows") {
            mp.starts_with("C:")
        } else {
            mp == "/"
        }
    });
    let (disk_gb, disk_available_gb) = match root_disk {
        Some(d) => (
            d.total_space() as f64 / 1_073_741_824.0,
            d.available_space() as f64 / 1_073_741_824.0,
        ),
        None => (0.0, 0.0),
    };

    // --- Docker ---
    let (docker_installed, docker_version, docker_running) = detect_docker();

    // --- WSL2 ---
    let wsl2_available = detect_wsl2();

    // --- Build check items ---
    let mut checks = Vec::new();

    // docker-installed
    checks.push(CheckItem {
        id: "docker-installed".to_string(),
        label: "Docker installed".to_string(),
        status: if docker_installed {
            CheckStatus::Pass
        } else {
            CheckStatus::Fail
        },
        message: match &docker_version {
            Some(v) => format!("Docker {} detected", v),
            None => "Docker not found — please install Docker Desktop or Engine".to_string(),
        },
    });

    // docker-running
    checks.push(CheckItem {
        id: "docker-running".to_string(),
        label: "Docker daemon".to_string(),
        status: if docker_running {
            CheckStatus::Pass
        } else if docker_installed {
            CheckStatus::Warn
        } else {
            CheckStatus::Fail
        },
        message: if docker_running {
            "Docker daemon is running".to_string()
        } else if docker_installed {
            "Docker is installed but the daemon is not running — start Docker and retry".to_string()
        } else {
            "Docker is not installed".to_string()
        },
    });

    // ram — judge on TOTAL, not available (macOS aggressively caches in RAM)
    checks.push(CheckItem {
        id: "ram".to_string(),
        label: "System RAM".to_string(),
        status: if ram_gb >= 8.0 {
            CheckStatus::Pass
        } else if ram_gb >= 4.0 {
            CheckStatus::Warn
        } else {
            CheckStatus::Fail
        },
        message: format!("{:.0} GB total ({:.1} GB available)", ram_gb, ram_available_gb),
    });

    // disk
    checks.push(CheckItem {
        id: "disk".to_string(),
        label: "Free disk space".to_string(),
        status: if disk_available_gb >= 40.0 {
            CheckStatus::Pass
        } else if disk_available_gb >= 20.0 {
            CheckStatus::Warn
        } else {
            CheckStatus::Fail
        },
        message: format!(
            "{:.0} GB free (40 GB recommended)",
            disk_available_gb
        ),
    });

    // wsl2
    let wsl2_status = if cfg!(target_os = "windows") {
        if wsl2_available {
            CheckStatus::Pass
        } else {
            CheckStatus::Fail
        }
    } else {
        CheckStatus::Pass
    };
    let wsl2_message = if cfg!(target_os = "windows") {
        if wsl2_available {
            "WSL2 is available".to_string()
        } else {
            "WSL2 not found — required on Windows".to_string()
        }
    } else {
        "Not required on this OS".to_string()
    };
    checks.push(CheckItem {
        id: "wsl2".to_string(),
        label: "WSL2".to_string(),
        status: wsl2_status,
        message: wsl2_message,
    });

    SystemCheckResult {
        os,
        os_version,
        arch,
        ram_gb,
        ram_available_gb,
        disk_gb,
        disk_available_gb,
        docker_installed,
        docker_version,
        docker_running,
        wsl2_available,
        checks,
    }
}
