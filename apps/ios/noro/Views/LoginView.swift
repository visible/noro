import SwiftUI
import LocalAuthentication

struct LoginView: View {
    @EnvironmentObject var auth: AuthState
    @State private var email = ""
    @State private var password = ""
    @State private var loading = false
    @State private var error: String?

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Spacer()

                Image(systemName: "lock.shield.fill")
                    .font(.system(size: 64))
                    .foregroundStyle(.tint)

                Text("noro")
                    .font(.largeTitle)
                    .fontWeight(.bold)

                Spacer()

                if auth.token != nil {
                    Button(action: biometric) {
                        Label("Unlock with Face ID", systemImage: "faceid")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.large)
                } else {
                    VStack(spacing: 16) {
                        TextField("Email", text: $email)
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                            .textFieldStyle(.roundedBorder)

                        SecureField("Password", text: $password)
                            .textContentType(.password)
                            .textFieldStyle(.roundedBorder)

                        if let error {
                            Text(error)
                                .foregroundStyle(.red)
                                .font(.caption)
                        }

                        Button(action: login) {
                            if loading {
                                ProgressView()
                                    .frame(maxWidth: .infinity)
                            } else {
                                Text("Login")
                                    .frame(maxWidth: .infinity)
                            }
                        }
                        .buttonStyle(.borderedProminent)
                        .controlSize(.large)
                        .disabled(loading || email.isEmpty || password.isEmpty)
                    }
                }

                Spacer()
            }
            .padding()
            .navigationBarHidden(true)
            .onAppear {
                if auth.token != nil {
                    biometric()
                }
            }
        }
    }

    private func login() {
        loading = true
        error = nil

        Task {
            do {
                let token = try await APIClient.shared.login(email: email, password: password)
                auth.login(token: token)
            } catch {
                self.error = error.localizedDescription
            }
            loading = false
        }
    }

    private func biometric() {
        let context = LAContext()
        var authError: NSError?

        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &authError) else {
            auth.unlock()
            return
        }

        context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: "Unlock your vault") { success, _ in
            DispatchQueue.main.async {
                if success {
                    auth.unlock()
                }
            }
        }
    }
}
