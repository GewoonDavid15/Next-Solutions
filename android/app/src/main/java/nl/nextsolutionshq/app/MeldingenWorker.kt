package nl.nextsolutionshq.app

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import nl.nextsolutionshq.app.widget.ProjectWidget

/** Background check: shows a phone notification for every new, unread notification, and refreshes the widget. */
class MeldingenWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        val app = applicationContext as NextApp
        if (app.tokens.token == null) return Result.success()
        return try {
            val json = app.api.get("/api/app/data")
            Cache.save(applicationContext, json)
            notifyNew(applicationContext, Parse.portal(json).notifications)
            ProjectWidget.refresh(applicationContext)
            Result.success()
        } catch (e: ApiException) {
            if (e.status == 401) { app.tokens.clear(); Result.success() } else Result.retry()
        }
    }

    companion object {
        const val NAME = "meldingen-check"

        /** Shows only notifications we have not shown before. The very first run just remembers what is there. */
        fun notifyNew(context: Context, items: List<Notification>, show: Boolean = true) {
            val prefs = context.getSharedPreferences("meldingen", Context.MODE_PRIVATE)
            val firstRun = !prefs.contains("gezien")
            val fresh = items.filter { !it.read && !Notifier.wasShown(context, it.id) }
            Notifier.markShown(context, items.map { it.id })
            if (firstRun || !show || !Settings(context).notifications) return
            fresh.take(5).forEach { Notifier.show(context, it.id, it.title, it.text, it.link, it.target) }
        }

        /** "/klantportaal#tickets" → "tickets" */
        fun tabFor(link: String?): String = link?.substringAfter('#', "")?.takeIf { it.isNotBlank() }
            ?: when {
                link?.contains("/project/") == true -> "projecten"
                link?.startsWith("/dashboard") == true -> "beheer"
                else -> "overzicht"
            }
    }
}
