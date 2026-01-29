package sh.noro.app.data

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

class APIClient(
    private val baseUrl: String = "https://api.noro.sh"
) {
    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private val gson = Gson()
    private val jsonType = "application/json; charset=utf-8".toMediaType()

    private val _items = MutableStateFlow<List<Item>>(emptyList())
    val items: Flow<List<Item>> = _items.asStateFlow()

    private var token: String? = null

    suspend fun login(email: String, password: String): Result<String> = withContext(Dispatchers.IO) {
        runCatching {
            val body = mapOf("email" to email, "password" to password)
            val request = Request.Builder()
                .url("$baseUrl/auth/login")
                .post(gson.toJson(body).toRequestBody(jsonType))
                .build()

            val response = client.newCall(request).execute()
            if (!response.isSuccessful) {
                throw Exception("Login failed: ${response.code}")
            }

            val result = gson.fromJson(response.body?.string(), TokenResponse::class.java)
            token = result.token
            result.token
        }
    }

    suspend fun fetchItems(): Result<List<Item>> = withContext(Dispatchers.IO) {
        runCatching {
            val request = Request.Builder()
                .url("$baseUrl/items")
                .header("Authorization", "Bearer $token")
                .get()
                .build()

            val response = client.newCall(request).execute()
            if (!response.isSuccessful) {
                throw Exception("Failed to fetch items: ${response.code}")
            }

            val type = object : TypeToken<List<Item>>() {}.type
            val items: List<Item> = gson.fromJson(response.body?.string(), type)
            _items.value = items
            items
        }
    }

    suspend fun createItem(item: Item): Result<Item> = withContext(Dispatchers.IO) {
        runCatching {
            val request = Request.Builder()
                .url("$baseUrl/items")
                .header("Authorization", "Bearer $token")
                .post(gson.toJson(item).toRequestBody(jsonType))
                .build()

            val response = client.newCall(request).execute()
            if (!response.isSuccessful) {
                throw Exception("Failed to create item: ${response.code}")
            }

            gson.fromJson(response.body?.string(), Item::class.java)
        }
    }

    suspend fun updateItem(item: Item): Result<Item> = withContext(Dispatchers.IO) {
        runCatching {
            val request = Request.Builder()
                .url("$baseUrl/items/${item.id}")
                .header("Authorization", "Bearer $token")
                .put(gson.toJson(item).toRequestBody(jsonType))
                .build()

            val response = client.newCall(request).execute()
            if (!response.isSuccessful) {
                throw Exception("Failed to update item: ${response.code}")
            }

            gson.fromJson(response.body?.string(), Item::class.java)
        }
    }

    suspend fun deleteItem(id: String): Result<Unit> = withContext(Dispatchers.IO) {
        runCatching {
            val request = Request.Builder()
                .url("$baseUrl/items/$id")
                .header("Authorization", "Bearer $token")
                .delete()
                .build()

            val response = client.newCall(request).execute()
            if (!response.isSuccessful) {
                throw Exception("Failed to delete item: ${response.code}")
            }
        }
    }

    fun logout() {
        token = null
        _items.value = emptyList()
    }

    private data class TokenResponse(val token: String)
}
