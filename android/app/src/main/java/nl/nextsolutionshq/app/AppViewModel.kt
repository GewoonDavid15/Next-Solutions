package nl.nextsolutionshq.app

import android.app.Application
import android.net.Uri
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject

class AppViewModel(application: Application) : AndroidViewModel(application) {
    private val app = application as NextApp
    private val api get() = app.api

    var loggedIn by mutableStateOf(app.tokens.token != null); private set
    var data by mutableStateOf<PortalData?>(null); private set
    var loading by mutableStateOf(false); private set
    var error by mutableStateOf<String?>(null); private set
    var loginBusy by mutableStateOf(false); private set
    /** Short message for the snackbar (sent, accepted, ...) */
    var toast by mutableStateOf<String?>(null)

    var thread by mutableStateOf<TicketThread?>(null); private set
    var threadError by mutableStateOf<String?>(null); private set
    private var threadJob: Job? = null

    var appointments by mutableStateOf<AppointmentInfo?>(null); private set

    init {
        if (loggedIn) refresh()
    }

    private fun handle(e: Throwable, show: (String) -> Unit = { toast = it }) {
        if (e is ApiException && e.status == 401) {
            logout()
            error = e.message
            return
        }
        show(e.message ?: "Er ging iets mis.")
    }

    fun refresh() {
        if (loading) return
        loading = true
        viewModelScope.launch {
            try {
                val res = Parse.portal(api.get("/api/app/data"))
                data = res
                error = null
                MeldingenWorker.notifyNew(getApplication(), res.notifications) // remember what is already there
            } catch (e: Exception) {
                handle(e) { error = it }
            } finally {
                loading = false
            }
        }
    }

    fun finishLogin(uri: Uri) {
        loginBusy = true
        viewModelScope.launch {
            Auth.finish(getApplication(), uri, app.tokens)
                .onSuccess {
                    loggedIn = true
                    error = null
                    app.scheduleChecks()
                    refresh()
                }
                .onFailure { error = it.message }
            loginBusy = false
        }
    }

    fun logout() {
        app.tokens.clear()
        loggedIn = false
        data = null
        thread = null
        appointments = null
        app.scheduleChecks()
    }

    // ── Tickets ──
    fun openThread(id: String) {
        threadJob?.cancel()
        thread = null
        threadError = null
        threadJob = viewModelScope.launch {
            while (isActive) {
                try {
                    thread = Parse.thread(api.get("/api/portaal/ticket/berichten?id=$id"))
                    threadError = null
                } catch (e: Exception) {
                    if (e is ApiException && e.status == 401) { handle(e); return@launch }
                    threadError = e.message
                }
                delay(8_000)
            }
        }
    }

    fun closeThread() {
        threadJob?.cancel()
        threadJob = null
    }

    fun sendMessage(id: String, text: String, done: (Boolean) -> Unit) {
        viewModelScope.launch {
            try {
                api.post("/api/portaal/ticket/berichten", JSONObject().put("id", id).put("tekst", text))
                thread = Parse.thread(api.get("/api/portaal/ticket/berichten?id=$id"))
                done(true)
            } catch (e: Exception) {
                handle(e); done(false)
            }
        }
    }

    fun newTicket(department: String, subject: String, details: String, done: (Boolean) -> Unit) {
        viewModelScope.launch {
            try {
                api.post("/api/portaal/ticket", JSONObject().put("afdeling", department).put("onderwerp", subject).put("details", details))
                toast = "Je ticket is geopend. We reageren zo snel mogelijk."
                done(true)
                refresh()
            } catch (e: Exception) {
                handle(e); done(false)
            }
        }
    }

    // ── Offers and projects ──
    fun acceptOffer(id: String) {
        viewModelScope.launch {
            try {
                api.post("/api/portaal/offerte", JSONObject().put("id", id))
                toast = "Bedankt! Je krijgt de betaalgegevens in je ticket."
                refresh()
            } catch (e: Exception) { handle(e) }
        }
    }

    fun projectFeedback(id: String, approve: Boolean, text: String, done: (Boolean) -> Unit) {
        viewModelScope.launch {
            try {
                api.post("/api/portaal/project-feedback", JSONObject().put("id", id).put("soort", if (approve) "akkoord" else "revisie").put("tekst", text))
                toast = if (approve) "Akkoord doorgegeven aan het team." else "Je revisieverzoek is doorgegeven."
                done(true)
            } catch (e: Exception) { handle(e); done(false) }
        }
    }

    // ── Notifications ──
    fun markAllRead() {
        val d = data ?: return
        data = d.copy(notifications = d.notifications.map { it.copy(read = true) }, unread = 0)
        viewModelScope.launch {
            try { api.post("/api/portaal/meldingen", JSONObject()) } catch (e: Exception) { handle(e) }
        }
    }

    fun markRead(n: Notification) {
        val d = data ?: return
        if (n.read) return
        data = d.copy(notifications = d.notifications.map { if (it.id == n.id) it.copy(read = true) else it }, unread = (d.unread - 1).coerceAtLeast(0))
        viewModelScope.launch {
            try { api.post("/api/portaal/meldingen", JSONObject().put("ids", JSONArray().put(n.id))) } catch (_: Exception) { }
        }
    }

    // ── Appointments ──
    fun loadAppointments() {
        viewModelScope.launch {
            try { appointments = Parse.appointments(api.get("/api/portaal/afspraken")) } catch (e: Exception) { handle(e) }
        }
    }

    fun book(start: Long, subject: String, note: String, done: (Boolean) -> Unit) {
        viewModelScope.launch {
            try {
                api.post("/api/portaal/afspraken", JSONObject().put("start", start).put("onderwerp", subject).put("notitie", note))
                toast = "Je afspraak staat gepland. Je krijgt een herinnering in Discord."
                loadAppointments()
                done(true)
            } catch (e: Exception) { handle(e); done(false) }
        }
    }

    fun cancelAppointment(id: String) {
        viewModelScope.launch {
            try {
                api.delete("/api/portaal/afspraken?id=${Uri.encode(id)}")
                toast = "Je afspraak is geannuleerd."
                loadAppointments()
            } catch (e: Exception) { handle(e) }
        }
    }

    fun clearError() { error = null }

    override fun onCleared() {
        threadJob?.cancel()
        super.onCleared()
    }
}
