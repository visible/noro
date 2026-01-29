import Foundation

actor APIClient {
    static let shared = APIClient()

    private let base = URL(string: "https://noro.sh/api")!
    private let decoder: JSONDecoder = {
        let d = JSONDecoder()
        d.dateDecodingStrategy = .iso8601
        return d
    }()
    private let encoder = JSONEncoder()

    private var token: String? {
        Keychain.load(key: "token")
    }

    func login(email: String, password: String) async throws -> String {
        let body = ["email": email, "password": password]
        let response: LoginResponse = try await post(path: "/auth/login", body: body)
        return response.token
    }

    func items() async throws -> [Item] {
        try await get(path: "/items")
    }

    func create(name: String, username: String?, password: String?, url: String?) async throws -> Item {
        var body: [String: String] = ["name": name, "type": "login"]
        if let username { body["username"] = username }
        if let password { body["password"] = password }
        if let url { body["url"] = url }
        return try await post(path: "/items", body: body)
    }

    private func get<T: Decodable>(path: String) async throws -> T {
        var request = URLRequest(url: base.appendingPathComponent(path))
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let (data, response) = try await URLSession.shared.data(for: request)
        try validate(response)
        return try decoder.decode(T.self, from: data)
    }

    private func post<T: Decodable>(path: String, body: [String: String]) async throws -> T {
        var request = URLRequest(url: base.appendingPathComponent(path))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try encoder.encode(body)
        if let token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let (data, response) = try await URLSession.shared.data(for: request)
        try validate(response)
        return try decoder.decode(T.self, from: data)
    }

    private func validate(_ response: URLResponse) throws {
        guard let http = response as? HTTPURLResponse else { throw APIError.invalid }
        guard (200...299).contains(http.statusCode) else { throw APIError.status(http.statusCode) }
    }
}

struct LoginResponse: Decodable {
    let token: String
}

enum APIError: LocalizedError {
    case invalid
    case status(Int)

    var errorDescription: String? {
        switch self {
        case .invalid: return "Invalid response"
        case .status(let code): return "Error \(code)"
        }
    }
}
