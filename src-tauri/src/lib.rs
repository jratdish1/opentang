// OpenTang — Tauri backend
// M5: Full Stack — SSL, Tier 2 services, health checks, install path picker.

mod commands;
use commands::system::system_check;
use commands::install::{generate_compose, start_install, get_service_status};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            system_check,
            generate_compose,
            start_install,
            get_service_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running OpenTang")
}
