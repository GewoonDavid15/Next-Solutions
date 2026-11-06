package nl.nextsolutionshq.app

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

class NextApp : Application() {
    lateinit var tokens: TokenStore
        private set
    lateinit var api: Api
        private set

    override fun onCreate() {
        super.onCreate()
        tokens = TokenStore(this)
        api = Api(tokens)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(CHANNEL, "Meldingen", NotificationManager.IMPORTANCE_DEFAULT).apply {
                description = "Antwoorden op tickets, projectupdates, offertes en afspraken"
            }
            getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }
        scheduleChecks()
    }

    /** Checks for new notifications every 15 minutes (the shortest Android allows) while logged in. */
    fun scheduleChecks() {
        val wm = WorkManager.getInstance(this)
        if (tokens.token == null || !Settings(this).notifications) {
            wm.cancelUniqueWork(MeldingenWorker.NAME)
            return
        }
        val request = PeriodicWorkRequestBuilder<MeldingenWorker>(15, TimeUnit.MINUTES)
            .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
            .build()
        wm.enqueueUniquePeriodicWork(MeldingenWorker.NAME, ExistingPeriodicWorkPolicy.KEEP, request)
    }

    companion object {
        const val CHANNEL = "meldingen"
    }
}

class Settings(context: android.content.Context) {
    private val prefs = context.getSharedPreferences("instellingen", android.content.Context.MODE_PRIVATE)
    var notifications: Boolean
        get() = prefs.getBoolean("meldingen", true)
        set(v) = prefs.edit().putBoolean("meldingen", v).apply()
}
