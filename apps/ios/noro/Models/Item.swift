import Foundation

struct Item: Identifiable, Hashable, Codable {
    let id: String
    let name: String
    let username: String?
    let password: String?
    let url: String?
    let notes: String?
    let type: ItemType
    let created: Date
    let updated: Date

    var icon: String {
        switch type {
        case .login: return "person.fill"
        case .card: return "creditcard.fill"
        case .identity: return "person.text.rectangle.fill"
        case .note: return "note.text"
        }
    }
}

enum ItemType: String, Codable {
    case login
    case card
    case identity
    case note
}
