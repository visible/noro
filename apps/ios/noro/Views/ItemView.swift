import SwiftUI

struct ItemView: View {
    let item: Item
    @State private var revealed = false
    @State private var copied: String?

    var body: some View {
        List {
            Section {
                if let username = item.username {
                    row(label: "Username", value: username)
                }

                if let password = item.password {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Password")
                                .font(.caption)
                                .foregroundStyle(.secondary)

                            Text(revealed ? password : String(repeating: "•", count: 12))
                                .font(.body.monospaced())
                        }

                        Spacer()

                        Button(action: { revealed.toggle() }) {
                            Image(systemName: revealed ? "eye.slash" : "eye")
                        }
                        .buttonStyle(.borderless)

                        Button(action: { copy(password, label: "Password") }) {
                            Image(systemName: "doc.on.doc")
                        }
                        .buttonStyle(.borderless)
                    }
                }

                if let url = item.url {
                    row(label: "URL", value: url)
                }
            }

            if let notes = item.notes, !notes.isEmpty {
                Section("Notes") {
                    Text(notes)
                        .font(.body)
                }
            }
        }
        .navigationTitle(item.name)
        .overlay(alignment: .bottom) {
            if let copied {
                toast(copied)
            }
        }
    }

    @ViewBuilder
    private func row(label: String, value: String) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(label)
                    .font(.caption)
                    .foregroundStyle(.secondary)

                Text(value)
                    .font(.body)
            }

            Spacer()

            Button(action: { copy(value, label: label) }) {
                Image(systemName: "doc.on.doc")
            }
            .buttonStyle(.borderless)
        }
    }

    private func copy(_ value: String, label: String) {
        UIPasteboard.general.string = value

        withAnimation {
            copied = "\(label) copied"
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            withAnimation {
                copied = nil
            }
        }
    }

    @ViewBuilder
    private func toast(_ message: String) -> some View {
        Text(message)
            .font(.subheadline)
            .fontWeight(.medium)
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(.ultraThinMaterial, in: Capsule())
            .padding(.bottom)
            .transition(.move(edge: .bottom).combined(with: .opacity))
    }
}
