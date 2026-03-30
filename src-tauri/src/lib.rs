// OpenTang — Tauri backend
// M5: Full Stack — SSL, Tier 2 services, health checks, install path picker.
// M6: Package Registry — App Store, Dashboard, install state persistence.

mod commands;
use commands::system::system_check;
use commands::install::{generate_compose, start_install, get_service_status};
use commands::registry::{
    get_registry, install_package, remove_package, update_package,
    load_install_state, save_install_state,
};
use commands::updater::check_for_update;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            system_check,
            generate_compose,
            start_install,
            get_service_status,
            get_registry,
            install_package,
            remove_package,
            update_package,
            load_install_state,
            save_install_state,
            check_for_update,
        ])
        .run(tauri::generate_context!())
        .expect("error while running OpenTang")
}
