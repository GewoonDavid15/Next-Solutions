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

/** Shows phone notifications; a tap opens the right screen (ticket, project, ...). */
object Notifier {
    fun show(context: Context, id: String, title: String, text: String, link: String?, target: Target?) {
        if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra(MainActivity.EXTRA_TAB, MeldingenWorker.tabFor(link))
            target?.let { putExtra(MainActivity.EXTRA_TARGET, it.encode()) }
            putExtra(MainActivity.EXTRA_NOTIFICATION, id)
        }
        val pending = PendingIntent.getActivity(context, id.hashCode(), intent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
        val notification = NotificationCompat.Builder(context, NextApp.CHANNEL)
            .setSmallIcon(R.drawable.ic_notification)
            .setColor(0xFFC6F432.toInt())
            .setContentTitle(title)
            .setContentText(text)
            .setStyle(NotificationCompat.BigTextStyle().bigText(text))
            .setAutoCancel(true)
            .setContentIntent(pending)
            .build()
        try { NotificationManagerCompat.from(context).notify(id.hashCode(), notification) } catch (_: SecurityException) { }
    }

    /** Remembers which notifications were shown, so polling and Firebase never show one twice. */
    fun markShown(context: Context, ids: Collection<String>) {
        val prefs = context.getSharedPreferences("meldingen", Context.MODE_PRIVATE)
        val seen = prefs.getStringSet("gezien", emptySet()).orEmpty().toMutableSet()
        seen.addAll(ids)
        prefs.edit().putStringSet("gezien", seen.toList().takeLast(300).toSet()).apply()
    }

    fun wasShown(context: Context, id: String) = context.getSharedPreferences("meldingen", Context.MODE_PRIVATE).getStringSet("gezien", emptySet()).orEmpty().contains(id)
}
