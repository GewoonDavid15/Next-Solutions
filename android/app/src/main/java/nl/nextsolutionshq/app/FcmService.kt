package nl.nextsolutionshq.app

import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject

/** Instant notifications through Firebase (only used when Firebase is configured for this build). */
class FcmService : FirebaseMessagingService() {
    override fun onNewToken(token: String) {
        val app = application as NextApp
        if (app.tokens.token == null) return
        CoroutineScope(Dispatchers.IO).launch { app.registerFcm(token) }
    }

    override fun onMessageReceived(message: RemoteMessage) {
        val d = message.data
        val id = d["id"].orEmpty().ifBlank { message.messageId ?: System.currentTimeMillis().toString() }
        if (Notifier.wasShown(this, id) || !Settings(this).notifications) return
        val target = d["doel"]?.takeIf { it != "null" }?.let { runCatching { JSONObject(it) }.getOrNull() }
            ?.let { o -> o.optString("soort").takeIf { it.isNotBlank() }?.let { Target(it, o.optString("id").ifBlank { null }) } }
        Notifier.show(this, id, d["titel"].orEmpty().ifBlank { "Next Solutions" }, d["tekst"].orEmpty(), d["link"], target)
        Notifier.markShown(this, listOf(id))
    }
}
