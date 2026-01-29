import SwiftUI

struct GeneratorView: View {
    @State private var password = ""
    @State private var length: Double = 20
    @State private var uppercase = true
    @State private var lowercase = true
    @State private var numbers = true
    @State private var symbols = true
    @State private var copied = false

    var body: some View {
        NavigationStack {
            List {
                Section {
                    VStack(spacing: 16) {
                        Text(password)
                            .font(.system(.title3, design: .monospaced))
                            .textSelection(.enabled)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(.quaternary, in: RoundedRectangle(cornerRadius: 8))

                        HStack(spacing: 12) {
                            Button(action: generate) {
                                Label("Generate", systemImage: "arrow.clockwise")
                            }
                            .buttonStyle(.bordered)

                            Button(action: copy) {
                                Label(copied ? "Copied" : "Copy", systemImage: copied ? "checkmark" : "doc.on.doc")
                            }
                            .buttonStyle(.borderedProminent)
                        }
                    }
                    .padding(.vertical, 8)
                }

                Section("Options") {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Length: \(Int(length))")
                        Slider(value: $length, in: 8...64, step: 1)
                    }

                    Toggle("Uppercase (A-Z)", isOn: $uppercase)
                    Toggle("Lowercase (a-z)", isOn: $lowercase)
                    Toggle("Numbers (0-9)", isOn: $numbers)
                    Toggle("Symbols (!@#$)", isOn: $symbols)
                }
            }
            .navigationTitle("Generator")
            .onChange(of: length) { _, _ in generate() }
            .onChange(of: uppercase) { _, _ in generate() }
            .onChange(of: lowercase) { _, _ in generate() }
            .onChange(of: numbers) { _, _ in generate() }
            .onChange(of: symbols) { _, _ in generate() }
            .onAppear { generate() }
        }
    }

    private func generate() {
        var chars = ""
        if uppercase { chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ" }
        if lowercase { chars += "abcdefghijklmnopqrstuvwxyz" }
        if numbers { chars += "0123456789" }
        if symbols { chars += "!@#$%^&*()_+-=[]{}|;:,.<>?" }

        guard !chars.isEmpty else {
            password = ""
            return
        }

        password = String((0..<Int(length)).compactMap { _ in chars.randomElement() })
    }

    private func copy() {
        UIPasteboard.general.string = password
        copied = true

        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            copied = false
        }
    }
}
