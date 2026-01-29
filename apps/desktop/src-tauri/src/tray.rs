use rand::Rng;
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager, Runtime,
};

fn quickpassword() -> String {
    let charset: Vec<u8> = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?".to_vec();
    let mut rng = rand::thread_rng();
    (0..20).map(|_| charset[rng.gen_range(0..charset.len())] as char).collect()
}

fn copytoclipboard(text: &str) {
    #[cfg(target_os = "macos")]
    {
        use std::io::Write;
        use std::process::{Command, Stdio};
        if let Ok(mut child) = Command::new("pbcopy").stdin(Stdio::piped()).spawn() {
            if let Some(stdin) = child.stdin.as_mut() {
                let _ = stdin.write_all(text.as_bytes());
            }
            let _ = child.wait();
        }
    }
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        let _ = Command::new("cmd").args(["/C", &format!("echo {} | clip", text)]).spawn();
    }
    #[cfg(target_os = "linux")]
    {
        use std::io::Write;
        use std::process::{Command, Stdio};
        if let Ok(mut child) = Command::new("xclip").args(["-selection", "clipboard"]).stdin(Stdio::piped()).spawn() {
            if let Some(stdin) = child.stdin.as_mut() {
                let _ = stdin.write_all(text.as_bytes());
            }
            let _ = child.wait();
        }
    }
}

pub fn create<R: Runtime>(app: &AppHandle<R>) -> Result<(), Box<dyn std::error::Error>> {
    let open = MenuItem::with_id(app, "open", "Open", true, None::<&str>)?;
    let lock = MenuItem::with_id(app, "lock", "Lock", true, None::<&str>)?;
    let generate = MenuItem::with_id(app, "generate", "Generate Password", true, None::<&str>)?;
    let separator = PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&open, &lock, &generate, &separator, &quit])?;

    let _tray = TrayIconBuilder::new()
        .icon(tauri::image::Image::from_bytes(include_bytes!("../icons/32x32.png"))?)
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "open" => {
                if let Some(w) = app.get_webview_window("main") {
                    let _ = w.show();
                    let _ = w.set_focus();
                }
            }
            "lock" => {
                if let Some(w) = app.get_webview_window("main") {
                    let _ = w.emit("vault_lock", ());
                }
            }
            "generate" => {
                let password = quickpassword();
                copytoclipboard(&password);
                if let Some(w) = app.get_webview_window("main") {
                    let _ = w.emit("password_copied", password);
                }
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } = event {
                if let Some(w) = tray.app_handle().get_webview_window("main") {
                    if w.is_visible().unwrap_or(false) {
                        let _ = w.hide();
                    } else {
                        let _ = w.show();
                        let _ = w.set_focus();
                    }
                }
            }
        })
        .build(app)?;

    Ok(())
}

#[tauri::command]
pub fn tray_show_notification(title: String, body: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;
        let script = format!(r#"display notification "{}" with title "{}""#, body.replace('"', r#"\""#), title.replace('"', r#"\""#));
        Command::new("osascript").args(["-e", &script]).spawn().map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "windows")]
    log::info!("notification: {} - {}", title, body);
    #[cfg(target_os = "linux")]
    {
        use std::process::Command;
        Command::new("notify-send").args([&title, &body]).spawn().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn tray_set_autostart(enabled: bool) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        let home = std::env::var("HOME").map_err(|e| e.to_string())?;
        let path = format!("{}/Library/LaunchAgents/sh.noro.app.plist", home);
        if enabled {
            let plist = r#"<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>sh.noro.app</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Applications/noro.app/Contents/MacOS/noro</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>"#;
            std::fs::write(&path, plist).map_err(|e| e.to_string())?;
        } else {
            let _ = std::fs::remove_file(&path);
        }
    }
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        let exe = std::env::current_exe().map_err(|e| e.to_string())?;
        let key = r#"HKCU\Software\Microsoft\Windows\CurrentVersion\Run"#;
        if enabled {
            Command::new("reg").args(["add", key, "/v", "noro", "/t", "REG_SZ", "/d", exe.to_str().unwrap_or(""), "/f"]).spawn().map_err(|e| e.to_string())?;
        } else {
            Command::new("reg").args(["delete", key, "/v", "noro", "/f"]).spawn().map_err(|e| e.to_string())?;
        }
    }
    #[cfg(target_os = "linux")]
    {
        use directories::BaseDirs;
        let base = BaseDirs::new().ok_or("could not find base directories")?;
        let dir = base.config_dir().join("autostart");
        let file = dir.join("noro.desktop");
        if enabled {
            std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
            std::fs::write(&file, "[Desktop Entry]\nType=Application\nName=noro\nExec=noro\nHidden=false\nNoDisplay=false\nX-GNOME-Autostart-enabled=true").map_err(|e| e.to_string())?;
        } else {
            let _ = std::fs::remove_file(&file);
        }
    }
    Ok(())
}

#[tauri::command]
pub fn tray_get_autostart() -> Result<bool, String> {
    #[cfg(target_os = "macos")]
    {
        let home = std::env::var("HOME").map_err(|e| e.to_string())?;
        Ok(std::path::Path::new(&format!("{}/Library/LaunchAgents/sh.noro.app.plist", home)).exists())
    }
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        let out = Command::new("reg").args(["query", r#"HKCU\Software\Microsoft\Windows\CurrentVersion\Run"#, "/v", "noro"]).output().map_err(|e| e.to_string())?;
        Ok(out.status.success())
    }
    #[cfg(target_os = "linux")]
    {
        use directories::BaseDirs;
        let base = BaseDirs::new().ok_or("could not find base directories")?;
        Ok(base.config_dir().join("autostart").join("noro.desktop").exists())
    }
}
