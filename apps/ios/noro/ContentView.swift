import SwiftUI

struct ContentView: View {
    @State private var selection = 0

    var body: some View {
        TabView(selection: $selection) {
            VaultView()
                .tabItem {
                    Label("Vault", systemImage: "lock.fill")
                }
                .tag(0)

            GeneratorView()
                .tabItem {
                    Label("Generator", systemImage: "key.fill")
                }
                .tag(1)

            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gear")
                }
                .tag(2)
        }
    }
}

struct SettingsView: View {
    @EnvironmentObject var auth: AuthState

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Button("Lock", role: .none) {
                        auth.lock()
                    }

                    Button("Logout", role: .destructive) {
                        auth.logout()
                    }
                }
            }
            .navigationTitle("Settings")
        }
    }
}
