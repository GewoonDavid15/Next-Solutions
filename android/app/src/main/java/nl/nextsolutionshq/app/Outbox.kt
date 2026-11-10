package nl.nextsolutionshq.app

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

/** Ticket messages typed without internet: kept on the phone and sent as soon as there is a connection. */
data class QueuedMessage(val id: String, val ticket: String, val text: String, val admin: Boolean, val t: Long)

object Outbox {
    private fun prefs(c: Context) = c.getSharedPreferences("wachtrij", Context.MODE_PRIVATE)

    fun all(c: Context): List<QueuedMessage> = try {
        val a = JSONArray(prefs(c).getString("berichten", "[]"))
        (0 until a.length()).map { a.getJSONObject(it).let { o -> QueuedMessage(o.getString("id"), o.getString("ticket"), o.getString("tekst"), o.optBoolean("admin"), o.optLong("t")) } }
    } catch (_: Exception) { emptyList() }

    private fun save(c: Context, list: List<QueuedMessage>) {
        prefs(c).edit().putString("berichten", JSONArray(list.map { JSONObject().put("id", it.id).put("ticket", it.ticket).put("tekst", it.text).put("admin", it.admin).put("t", it.t) }).toString()).apply()
    }

    fun add(c: Context, m: QueuedMessage) = save(c, (all(c) + m).takeLast(50))
    fun remove(c: Context, id: String) = save(c, all(c).filterNot { it.id == id })
    fun forTicket(c: Context, ticket: String) = all(c).filter { it.ticket == ticket }

    /** Tries to send everything in the queue (in order); stops at the first network error. */
    suspend fun flush(c: Context, api: Api) {
        for (m in all(c).sortedBy { it.t }) {
            try {
                val body = JSONObject().put("id", m.ticket).put("tekst", m.text).put("bron", "app")
                api.post(if (m.admin) "/api/bot/beheer/ticket/reageer" else "/api/portaal/ticket/berichten", body)
                remove(c, m.id)
            } catch (e: ApiException) {
                if (e.status in 400..499 && e.status != 429) remove(c, m.id) // ticket closed or gone: drop it
                else return
            }
        }
    }
}
