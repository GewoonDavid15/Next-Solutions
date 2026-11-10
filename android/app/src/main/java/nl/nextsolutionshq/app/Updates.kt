package nl.nextsolutionshq.app

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.Manifest
import android.content.pm.PackageManager
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.URL

/** A newer version on the website: number, name, download link and what is new. */
data class AppUpdate(val code: Int, val name: String, val url: String, val notes: String)

object Updates {
    suspend fun check(): AppUpdate? = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject(URL("${BuildConfig.SITE_URL}/downloads/app-versie.json?t=${System.currentTimeMillis()}").readText())
            val code = json.optInt("versionCode")
            if (code > BuildConfig.VERSION_CODE) AppUpdate(code, json.optString("versionName"), json.optString("url").ifBlank { "${BuildConfig.SITE_URL}/downloads/next-solutions.apk" }, json.optString("notities")) else null
        } catch (_: Exception) {
            null
        }
    }

    /** Phone notification about a new version, once per version. */
    fun notifyOnce(context: Context, update: AppUpdate) {
        val prefs = context.getSharedPreferences("updates", Context.MODE_PRIVATE)
        if (prefs.getInt("gemeld", 0) >= update.code) return
        if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return
        prefs.edit().putInt("gemeld", update.code).apply()
        val open = PendingIntent.getActivity(context, 9001, Intent(Intent.ACTION_VIEW, Uri.parse(update.url)), PendingIntent.FLAG_IMMUTABLE)
        val n = NotificationCompat.Builder(context, NextApp.CHANNEL)
            .setSmallIcon(R.drawable.ic_notification)
            .setColor(0xFFC6F432.toInt())
            .setContentTitle(t("Nieuwe versie ${update.name} beschikbaar", "New version ${update.name} available"))
            .setContentText(update.notes.ifBlank { t("Tik om te downloaden en te installeren.", "Tap to download and install.") })
            .setStyle(NotificationCompat.BigTextStyle().bigText(update.notes.ifBlank { t("Tik om te downloaden en te installeren.", "Tap to download and install.") }))
            .setAutoCancel(true)
            .setContentIntent(open)
            .build()
        try { NotificationManagerCompat.from(context).notify(9001, n) } catch (_: SecurityException) { }
    }

    /** The pop-up in the app is shown once per version; after that the banner on the overview stays. */
    fun dialogShown(context: Context, code: Int) = context.getSharedPreferences("updates", Context.MODE_PRIVATE).getInt("dialoog", 0) >= code
    fun markDialogShown(context: Context, code: Int) = context.getSharedPreferences("updates", Context.MODE_PRIVATE).edit().putInt("dialoog", code).apply()
}
