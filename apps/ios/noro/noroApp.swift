import SwiftUI

@main
struct noroApp: App {
    @StateObject private var auth = AuthState()

    var body: some Scene {
        WindowGroup {
            if auth.unlocked {
                ContentView()
                    .environmentObject(auth)
            } else {
                LoginView()
                    .environmentObject(auth)
            }
        }
    }
}

@MainActor
class AuthState: ObservableObject {
    @Published var unlocked = false
    @Published var token: String?

    init() {
        token = Keychain.load(key: "token")
    }

    func unlock() {
        unlocked = true
    }

    func lock() {
        unlocked = false
    }

    func login(token: String) {
        self.token = token
        Keychain.save(key: "token", value: token)
        unlocked = true
    }

    func logout() {
        token = nil
        Keychain.delete(key: "token")
        unlocked = false
    }
}
