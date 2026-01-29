package sh.noro.app.data

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class SecureStorage(context: Context) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "noro_secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveToken(token: String) {
        prefs.edit().putString(KEY_TOKEN, token).apply()
    }

    fun getToken(): String? {
        return prefs.getString(KEY_TOKEN, null)
    }

    fun clearToken() {
        prefs.edit().remove(KEY_TOKEN).apply()
    }

    fun saveMasterPasswordHash(hash: String) {
        prefs.edit().putString(KEY_PASSWORD_HASH, hash).apply()
    }

    fun getMasterPasswordHash(): String? {
        return prefs.getString(KEY_PASSWORD_HASH, null)
    }

    fun setBiometricEnabled(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_BIOMETRIC_ENABLED, enabled).apply()
    }

    fun isBiometricEnabled(): Boolean {
        return prefs.getBoolean(KEY_BIOMETRIC_ENABLED, false)
    }

    fun saveEncryptionKey(key: ByteArray) {
        prefs.edit().putString(KEY_ENCRYPTION_KEY, key.encodeToBase64()).apply()
    }

    fun getEncryptionKey(): ByteArray? {
        return prefs.getString(KEY_ENCRYPTION_KEY, null)?.decodeFromBase64()
    }

    fun clear() {
        prefs.edit().clear().apply()
    }

    private fun ByteArray.encodeToBase64(): String {
        return android.util.Base64.encodeToString(this, android.util.Base64.NO_WRAP)
    }

    private fun String.decodeFromBase64(): ByteArray {
        return android.util.Base64.decode(this, android.util.Base64.NO_WRAP)
    }

    companion object {
        private const val KEY_TOKEN = "auth_token"
        private const val KEY_PASSWORD_HASH = "master_password_hash"
        private const val KEY_BIOMETRIC_ENABLED = "biometric_enabled"
        private const val KEY_ENCRYPTION_KEY = "encryption_key"
    }
}
