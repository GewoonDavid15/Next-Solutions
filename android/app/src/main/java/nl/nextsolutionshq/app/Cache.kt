package nl.nextsolutionshq.app

import android.content.Context
import org.json.JSONObject
import java.io.File

/** The last portal data, so the app (and the widget) still show something without internet. */
object Cache {
    private fun file(context: Context) = File(context.filesDir, "portaal.json")

    fun save(context: Context, json: JSONObject) {
        try {
            val tmp = File(context.filesDir, "portaal.json.tmp")
            tmp.writeText(JSONObject(json.toString()).put("_opgeslagen", System.currentTimeMillis()).toString())
            tmp.renameTo(file(context))
        } catch (_: Exception) { }
    }

    fun load(context: Context): Pair<PortalData, Long>? = try {
        val json = JSONObject(file(context).readText())
        Parse.portal(json) to json.optLong("_opgeslagen")
    } catch (_: Exception) {
        null
    }

    fun clear(context: Context) { file(context).delete() }
}
