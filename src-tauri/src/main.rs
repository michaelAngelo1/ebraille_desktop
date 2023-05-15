#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// use serde::{Deserialize, Serialize};
use serde_json::{Number, Value};
extern crate serde;
static INPUT_PATH: &str = "../../API/UI_Content.json";
// static INPUT_PATH: &str = "/home/pi/Desktop/tauri/API/UI_Content.json";

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            data_from_ui_login,
            data_from_ui_search,
            reset_error_state_from_ui_search,
            update_ui
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[tauri::command]
fn update_ui() -> String {
    let json_in_string = std::fs::read_to_string(&INPUT_PATH).unwrap();
    format!("{}", json_in_string)
}

#[tauri::command]
fn data_from_ui_login(data: &str, status: bool) {
    let json_in_string = std::fs::read_to_string(INPUT_PATH).unwrap();
    let mut json = serde_json::from_str::<Value>(&json_in_string).unwrap();
    json["content_0"]["nik"] = data.into();
    json["content_0"]["status"] = status.into();
    std::fs::write(INPUT_PATH, serde_json::to_string_pretty(&json).unwrap()).unwrap();
    println!("NIK: {}", data);
}

#[tauri::command]
fn data_from_ui_search(data: &str, status: bool) {
    let json_in_string = std::fs::read_to_string(INPUT_PATH).unwrap();
    let mut json = serde_json::from_str::<Value>(&json_in_string).unwrap();
    json["content_3"]["title"] = data.into();
    json["content_3"]["status"] = status.into();
    std::fs::write(INPUT_PATH, serde_json::to_string_pretty(&json).unwrap()).unwrap();
    println!("title: {}", data);
}

#[tauri::command]
fn reset_error_state_from_ui_search() {
    let json_in_string = std::fs::read_to_string(INPUT_PATH).unwrap();
    let mut json = serde_json::from_str::<Value>(&json_in_string).unwrap();
    json["content_3"]["errorState"] = false.into();
    std::fs::write(INPUT_PATH, serde_json::to_string_pretty(&json).unwrap()).unwrap();
}
