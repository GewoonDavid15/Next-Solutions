package nl.nextsolutionshq.app

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL

/** A failed request, with a message that can be shown to the user as-is. */
class ApiException(val status: Int, message: String) : Exception(message)

/** Stores the app token. The token is only valid for this app and expires after 90 days. */
class TokenStore(context: Context) {
    private val prefs = context.getSharedPreferences("sessie", Context.MODE_PRIVATE)

    var token: String?
        get() = prefs.getString("token", null)?.takeIf { (prefs.getLong("geldigTot", 0) > System.currentTimeMillis()) }
        set(value) = prefs.edit().putString("token", value).apply()

    var expires: Long
        get() = prefs.getLong("geldigTot", 0)
        set(value) = prefs.edit().putLong("geldigTot", value).apply()

    var userName: String?
        get() = prefs.getString("naam", null)
        set(value) = prefs.edit().putString("naam", value).apply()

    fun clear() = prefs.edit().clear().apply()
}

/** Talks to the website (nextsolutionshq.nl), which forwards to the Discord bot. */
class Api(private val tokens: TokenStore, private val base: String = BuildConfig.SITE_URL) {

    suspend fun get(path: String): JSONObject = request("GET", path, null)
    suspend fun post(path: String, body: JSONObject = JSONObject()): JSONObject = request("POST", path, body)
    suspend fun delete(path: String): JSONObject = request("DELETE", path, null)

    private suspend fun request(method: String, path: String, body: JSONObject?): JSONObject = withContext(Dispatchers.IO) {
        val conn = (URL(base + path).openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = 15_000
            readTimeout = 20_000
            setRequestProperty("Accept", "application/json")
            setRequestProperty("User-Agent", "NextSolutionsApp/${BuildConfig.VERSION_NAME} (Android)")
            tokens.token?.let { setRequestProperty("Authorization", "Bearer $it") }
            if (body != null) {
                doOutput = true
                setRequestProperty("Content-Type", "application/json; charset=utf-8")
            }
        }
        try {
            if (body != null) conn.outputStream.use { it.write(body.toString().toByteArray()) }
            val status = conn.responseCode
            val text = (if (status in 200..299) conn.inputStream else conn.errorStream)?.bufferedReader()?.use { it.readText() }.orEmpty()
            val json = parse(text)
            if (status !in 200..299) {
                val msg = json.optString("fout").ifBlank {
                    when (status) {
                        401 -> "Je bent uitgelogd. Log opnieuw in."
                        429 -> "Even rustig aan, probeer het zo opnieuw."
                        in 500..599 -> "De server is even niet bereikbaar. Probeer het zo opnieuw."
                        else -> "Er ging iets mis ($status)."
                    }
                }
                throw ApiException(status, msg)
            }
            json
        } catch (e: IOException) {
            throw ApiException(0, "Geen verbinding. Controleer je internet en probeer het opnieuw.")
        } finally {
            conn.disconnect()
        }
    }

    private fun parse(text: String): JSONObject {
        if (text.isBlank()) return JSONObject()
        return try {
            if (text.trimStart().startsWith("[")) JSONObject().put("lijst", JSONArray(text)) else JSONObject(text)
        } catch (_: Exception) {
            JSONObject()
        }
    }
}
