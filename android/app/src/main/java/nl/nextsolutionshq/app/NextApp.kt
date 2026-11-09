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
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.tasks.await
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class NextApp : Application() {
    lateinit var tokens: TokenStore
        private set
    lateinit var api: Api
        private set

    /** True when this build has Firebase settings (instant notifications). */
    val firebaseReady: Boolean get() = BuildConfig.FIREBASE_APP_ID.isNotBlank() && FirebaseApp.getApps(this).isNotEmpty()

    override fun onCreate() {
        super.onCreate()
        Crash.install(this)
        tokens = TokenStore(this)
        api = Api(tokens)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(CHANNEL, t("Meldingen", "Notifications"), NotificationManager.IMPORTANCE_DEFAULT).apply {
                description = t("Antwoorden op tickets, projectupdates, offertes en afspraken", "Ticket replies, project updates, quotes and appointments")
            }
            getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }
        if (BuildConfig.FIREBASE_APP_ID.isNotBlank()) {
            runCatching {
                FirebaseApp.initializeApp(
                    this,
                    FirebaseOptions.Builder()
                        .setApplicationId(BuildConfig.FIREBASE_APP_ID)
                        .setApiKey(BuildConfig.FIREBASE_API_KEY)
                        .setProjectId(BuildConfig.FIREBASE_PROJECT_ID)
                        .setGcmSenderId(BuildConfig.FIREBASE_SENDER_ID)
                        .build(),
                )
            }
        }
        scheduleChecks()
    }

    /**
     * Checks for new notifications every 15 minutes (the shortest Android allows) while logged in.
     * With Firebase they also arrive instantly; the check then is a backup.
     */
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

    /** Registers this phone for instant notifications (when Firebase is configured). */
    suspend fun registerFcm(token: String? = null) {
        if (!firebaseReady || tokens.token == null) return
        runCatching {
            FirebaseMessaging.getInstance().isAutoInitEnabled = true
            val t = token ?: FirebaseMessaging.getInstance().token.await()
            api.post("/api/portaal/push", JSONObject().put("actie", "fcm").put("token", t))
            getSharedPreferences("instellingen", MODE_PRIVATE).edit().putString("fcmToken", t).apply()
        }
    }

    suspend fun unregisterFcm() {
        val t = getSharedPreferences("instellingen", MODE_PRIVATE).getString("fcmToken", null) ?: return
        runCatching { api.post("/api/portaal/push", JSONObject().put("actie", "fcm-uit").put("token", t)) }
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
    /** Fingerprint/face lock when opening the app */
    var lock: Boolean
        get() = prefs.getBoolean("slot", false)
        set(v) = prefs.edit().putBoolean("slot", v).apply()
}
