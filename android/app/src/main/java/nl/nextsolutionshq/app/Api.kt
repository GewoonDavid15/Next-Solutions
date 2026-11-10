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
    suspend fun put(path: String, body: JSONObject): JSONObject = request("PUT", path, body)

    /** File upload as multipart/form-data (for delivering social media content). */
    suspend fun postMultipart(path: String, fields: Map<String, String>, file: Triple<String, String, ByteArray>?): JSONObject = withContext(Dispatchers.IO) {
        val boundary = "----NextSolutions${System.currentTimeMillis()}"
        val conn = (URL(base + path).openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            connectTimeout = 15_000
            readTimeout = 60_000
            doOutput = true
            setRequestProperty("Content-Type", "multipart/form-data; boundary=$boundary")
            setRequestProperty("User-Agent", "NextSolutionsApp/${BuildConfig.VERSION_NAME} (Android)")
            tokens.token?.let { setRequestProperty("Authorization", "Bearer $it") }
        }
        try {
            conn.outputStream.use { out ->
                fun line(s: String) = out.write("$s\r\n".toByteArray())
                for ((k, v) in fields) { line("--$boundary"); line("Content-Disposition: form-data; name=\"$k\""); line(""); line(v) }
                if (file != null) {
                    val (name, type, bytes) = file
                    line("--$boundary")
                    line("Content-Disposition: form-data; name=\"bestand\"; filename=\"${name.replace("\"", "")}\"")
                    line("Content-Type: $type")
                    line("")
                    out.write(bytes)
                    line("")
                }
                line("--$boundary--")
            }
            val status = conn.responseCode
            val text = (if (status in 200..299) conn.inputStream else conn.errorStream)?.bufferedReader()?.use { it.readText() }.orEmpty()
            val json = parse(text)
            if (status !in 200..299) throw ApiException(status, json.optString("fout").ifBlank { "Er ging iets mis ($status)." })
            json
        } catch (e: IOException) {
            throw ApiException(0, t("Geen verbinding. Controleer je internet en probeer het opnieuw.", "No connection. Check your internet and try again."))
        } finally {
            conn.disconnect()
        }
    }

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
                        401 -> t("Je bent uitgelogd. Log opnieuw in.", "You have been logged out. Please log in again.")
                        429 -> t("Even rustig aan, probeer het zo opnieuw.", "Slow down a little, try again in a moment.")
                        in 500..599 -> t("De server is even niet bereikbaar. Probeer het zo opnieuw.", "The server is unavailable right now. Try again soon.")
                        else -> t("Er ging iets mis ($status).", "Something went wrong ($status).")
                    }
                }
                throw ApiException(status, msg)
            }
            json
        } catch (e: IOException) {
            throw ApiException(0, t("Geen verbinding. Controleer je internet en probeer het opnieuw.", "No connection. Check your internet and try again."))
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
