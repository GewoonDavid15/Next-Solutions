package nl.nextsolutionshq.app

import android.annotation.SuppressLint
import android.content.Context
import android.os.Build
import org.json.JSONObject

/**
 * Crashes of the app end up in the error log of the dashboard. A crash stops the app, so the
 * details are saved first and sent the next time the app starts.
 */
object Crash {
    private const val PREFS = "crash"

    // commit() on purpose: the app is about to stop, apply() would be too late
    @SuppressLint("ApplySharedPref")
    fun install(context: Context) {
        val previous = Thread.getDefaultUncaughtExceptionHandler()
        Thread.setDefaultUncaughtExceptionHandler { thread, e ->
            try {
                context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
                    .putString("bericht", "${e.javaClass.simpleName}: ${e.message ?: ""}".take(500))
                    .putString("stack", e.stackTraceToString().take(3000))
                    .commit()
            } catch (_: Exception) { }
            previous?.uncaughtException(thread, e)
        }
    }

    suspend fun sendPending(context: Context, api: Api) {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val message = prefs.getString("bericht", null) ?: return
        val body = JSONObject()
            .put("bron", "app")
            .put("bericht", message)
            .put("pad", "/app")
            .put("stack", "App ${BuildConfig.VERSION_NAME} (${BuildConfig.VERSION_CODE}) • Android ${Build.VERSION.RELEASE} • ${Build.MANUFACTURER} ${Build.MODEL}\n${prefs.getString("stack", "")}")
            .put("browser", "Android ${Build.VERSION.RELEASE}")
        try {
            api.post("/api/fout", body)
            prefs.edit().clear().apply()
        } catch (_: Exception) { }
    }
}
