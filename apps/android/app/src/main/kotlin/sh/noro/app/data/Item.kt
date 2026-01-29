package sh.noro.app.data

data class Item(
    val id: String,
    val name: String,
    val subtitle: String,
    val username: String = "",
    val type: ItemType
)

enum class ItemType {
    LOGIN,
    CARD,
    IDENTITY,
    NOTE
}
