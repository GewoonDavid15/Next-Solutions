package nl.nextsolutionshq.app

import android.Manifest
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters

/** Background check: shows a phone notification for every new, unread notification from the portal. */
class MeldingenWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        val app = applicationContext as NextApp
        if (app.tokens.token == null) return Result.success()
        return try {
            val res = app.api.get("/api/portaal/meldingen")
            val list = res.optJSONArray("meldingen")
            val items = if (list == null) emptyList() else (0 until list.length()).mapNotNull { list.optJSONObject(it)?.let(Parse::notification) }
            notifyNew(applicationContext, items)
            Result.success()
        } catch (e: ApiException) {
            if (e.status == 401) { app.tokens.clear(); Result.success() } else Result.retry()
        }
    }

    companion object {
        const val NAME = "meldingen-check"

        /** Shows only notifications we have not shown before. The first run just remembers what is there. */
        fun notifyNew(context: Context, items: List<Notification>) {
            val prefs = context.getSharedPreferences("meldingen", Context.MODE_PRIVATE)
            val seen = prefs.getStringSet("gezien", null)
            val fresh = items.filter { !it.read && (seen != null && it.id !in seen) }
            prefs.edit().putStringSet("gezien", items.map { it.id }.toSet()).apply()
            if (fresh.isEmpty()) return
            if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return
            val nm = NotificationManagerCompat.from(context)
            for (n in fresh.take(5)) {
                val intent = Intent(context, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    putExtra(MainActivity.EXTRA_TAB, tabFor(n.link))
                }
                val pending = PendingIntent.getActivity(context, n.id.hashCode(), intent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
                val notification = NotificationCompat.Builder(context, NextApp.CHANNEL)
                    .setSmallIcon(R.drawable.ic_notification)
                    .setColor(0xFFC6F432.toInt())
                    .setContentTitle(n.title)
                    .setContentText(n.text)
                    .setStyle(NotificationCompat.BigTextStyle().bigText(n.text))
                    .setAutoCancel(true)
                    .setContentIntent(pending)
                    .build()
                try { nm.notify(n.id.hashCode(), notification) } catch (_: SecurityException) { }
            }
        }

        /** "/klantportaal#tickets" → "tickets" */
        fun tabFor(link: String?): String = link?.substringAfter('#', "")?.takeIf { it.isNotBlank() }
            ?: if (link?.contains("/project/") == true) "projecten" else "overzicht"
    }
}
