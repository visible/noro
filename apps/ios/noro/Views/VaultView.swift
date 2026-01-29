import SwiftUI

struct VaultView: View {
    @State private var items: [Item] = []
    @State private var loading = true
    @State private var search = ""
    @State private var showAdd = false

    var filtered: [Item] {
        if search.isEmpty {
            return items
        }
        return items.filter { $0.name.localizedCaseInsensitiveContains(search) }
    }

    var body: some View {
        NavigationStack {
            Group {
                if loading {
                    ProgressView()
                } else if items.isEmpty {
                    ContentUnavailableView("No Items", systemImage: "lock.open", description: Text("Add your first item"))
                } else {
                    List(filtered) { item in
                        NavigationLink(value: item) {
                            ItemRow(item: item)
                        }
                    }
                    .searchable(text: $search)
                }
            }
            .navigationTitle("Vault")
            .navigationDestination(for: Item.self) { item in
                ItemView(item: item)
            }
            .toolbar {
                Button(action: { showAdd = true }) {
                    Image(systemName: "plus")
                }
            }
            .sheet(isPresented: $showAdd) {
                AddItemView { item in
                    items.append(item)
                }
            }
            .refreshable {
                await fetch()
            }
            .task {
                await fetch()
            }
        }
    }

    private func fetch() async {
        do {
            items = try await APIClient.shared.items()
        } catch {}
        loading = false
    }
}

struct ItemRow: View {
    let item: Item

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: item.icon)
                .font(.title2)
                .foregroundStyle(.secondary)
                .frame(width: 32)

            VStack(alignment: .leading, spacing: 2) {
                Text(item.name)
                    .font(.body)

                if let username = item.username {
                    Text(username)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding(.vertical, 4)
    }
}

struct AddItemView: View {
    @Environment(\.dismiss) var dismiss
    @State private var name = ""
    @State private var username = ""
    @State private var password = ""
    @State private var url = ""
    @State private var saving = false

    let onSave: (Item) -> Void

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Name", text: $name)
                    TextField("Username", text: $username)
                    SecureField("Password", text: $password)
                    TextField("URL", text: $url)
                        .keyboardType(.URL)
                        .autocapitalization(.none)
                }
            }
            .navigationTitle("Add Item")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { save() }
                        .disabled(name.isEmpty || saving)
                }
            }
        }
    }

    private func save() {
        saving = true

        Task {
            do {
                let item = try await APIClient.shared.create(
                    name: name,
                    username: username.isEmpty ? nil : username,
                    password: password.isEmpty ? nil : password,
                    url: url.isEmpty ? nil : url
                )
                onSave(item)
                dismiss()
            } catch {}
            saving = false
        }
    }
}
