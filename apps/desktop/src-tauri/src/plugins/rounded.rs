#![allow(unexpected_cfgs)]
#![allow(deprecated)]

use tauri::{AppHandle, Runtime, WebviewWindow};

#[cfg(target_os = "macos")]
use cocoa::{
    appkit::{NSWindow, NSView, NSColor},
    base::{id, nil},
};

#[cfg(target_os = "macos")]
use objc::{msg_send, sel, sel_impl};

#[tauri::command]
pub fn enable_rounded_corners<R: Runtime>(
    _app: AppHandle<R>,
    window: WebviewWindow<R>,
    corner_radius: Option<f64>,
) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        let radius = corner_radius.unwrap_or(12.0);

        window
            .with_webview(move |webview| {
                #[cfg(target_os = "macos")]
                unsafe {
                    let ns_window = webview.ns_window() as id;

                    ns_window.setOpaque_(cocoa::base::NO);
                    ns_window.setBackgroundColor_(NSColor::clearColor(nil));

                    let content_view = ns_window.contentView();
                    content_view.setWantsLayer(cocoa::base::YES);

                    let layer: id = msg_send![content_view, layer];
                    if !layer.is_null() {
                        let _: () = msg_send![layer, setCornerRadius: radius];
                        let _: () = msg_send![layer, setMasksToBounds: cocoa::base::YES];
                    }
                }
            })
            .map_err(|e| e.to_string())?;

        Ok(())
    }

    #[cfg(not(target_os = "macos"))]
    {
        Ok(())
    }
}
