package nl.nextsolutionshq.app

import android.app.Application
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.provider.OpenableColumns
import android.util.Base64
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import nl.nextsolutionshq.app.widget.ProjectWidget
import org.json.JSONArray
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.net.URL

/** A file the user picked to send (photo, PDF, ...), already read and, for photos, made smaller. */
data class PickedFile(val name: String, val type: String, val bytes: ByteArray)

class AppViewModel(application: Application) : AndroidViewModel(application) {
    private val app = application as NextApp
    private val api get() = app.api

    var loggedIn by mutableStateOf(app.tokens.token != null); private set
    var data by mutableStateOf<PortalData?>(null); private set
    var loading by mutableStateOf(false); private set
    var error by mutableStateOf<String?>(null); private set
    /** Showing saved data because there is no connection (time of that data) */
    var offlineSince by mutableStateOf<Long?>(null); private set
    var loginBusy by mutableStateOf(false); private set
    var toast by mutableStateOf<String?>(null)
    var update by mutableStateOf<Pair<String, String>?>(null); private set // versionName, url

    var thread by mutableStateOf<TicketThread?>(null); private set
    var threadError by mutableStateOf<String?>(null); private set
    private var threadJob: Job? = null

    var appointments by mutableStateOf<AppointmentInfo?>(null); private set

    // Owner (admin mode)
    var adminTickets by mutableStateOf<List<AdminTicket>?>(null); private set
    var adminLeads by mutableStateOf<List<AdminLead>?>(null); private set
    var adminOffers by mutableStateOf<List<AdminOffer>?>(null); private set
    var adminStats by mutableStateOf<AdminStats?>(null); private set
    var adminProjects by mutableStateOf<List<AdminProject>?>(null); private set

    init {
        if (loggedIn) {
            Cache.load(application)?.let { (d, t) -> data = d; offlineSince = t }
            refresh()
            viewModelScope.launch { Crash.sendPending(application, api); app.registerFcm() }
        }
        checkForUpdate()
    }

    private fun handle(e: Throwable, show: (String) -> Unit = { toast = it }) {
        if (e is ApiException && e.status == 401) {
            logout()
            error = e.message
            return
        }
        show(e.message ?: t("Er ging iets mis.", "Something went wrong."))
    }

    fun refresh() {
        if (loading || !loggedIn) return
        loading = true
        viewModelScope.launch {
            try {
                val json = api.get("/api/app/data")
                data = Parse.portal(json)
                error = null
                offlineSince = null
                Cache.save(getApplication(), json)
                MeldingenWorker.notifyNew(getApplication(), data!!.notifications, show = false)
                ProjectWidget.refresh(getApplication())
            } catch (e: Exception) {
                if (e is ApiException && e.status == 0 && data != null) {
                    if (offlineSince == null) offlineSince = Cache.load(getApplication())?.second ?: System.currentTimeMillis()
                } else handle(e) { error = it }
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
                    app.registerFcm()
                }
                .onFailure { error = it.message }
            loginBusy = false
        }
    }

    fun logout() {
        viewModelScope.launch { app.unregisterFcm() }
        app.tokens.clear()
        Cache.clear(getApplication())
        loggedIn = false
        data = null
        thread = null
        appointments = null
        adminTickets = null; adminLeads = null; adminOffers = null; adminStats = null
        app.scheduleChecks()
        viewModelScope.launch { ProjectWidget.refresh(getApplication()) }
    }

    private fun checkForUpdate() {
        viewModelScope.launch {
            try {
                val json = withContext(Dispatchers.IO) { JSONObject(URL("${BuildConfig.SITE_URL}/downloads/app-versie.json").readText()) }
                if (json.optInt("versionCode") > BuildConfig.VERSION_CODE) update = json.optString("versionName") to json.optString("url")
            } catch (_: Exception) { }
        }
    }

    // ── Files picked by the user ──
    suspend fun readPicked(uri: Uri): PickedFile? = withContext(Dispatchers.IO) {
        val ctx = getApplication<Application>()
        val resolver = ctx.contentResolver
        var name = "bestand"
        resolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { c -> if (c.moveToFirst()) name = c.getString(0) ?: name }
        val type = resolver.getType(uri) ?: "application/octet-stream"
        val raw = resolver.openInputStream(uri)?.use { it.readBytes() } ?: return@withContext null
        if (type.startsWith("image/") && type != "image/gif") {
            // Photos from a phone are large: scale to max 1600 px and save as JPEG
            val bmp = BitmapFactory.decodeByteArray(raw, 0, raw.size) ?: return@withContext PickedFile(name, type, raw)
            val scale = minOf(1f, 1600f / maxOf(bmp.width, bmp.height))
            val scaled = if (scale < 1f) Bitmap.createScaledBitmap(bmp, (bmp.width * scale).toInt(), (bmp.height * scale).toInt(), true) else bmp
            val out = ByteArrayOutputStream()
            scaled.compress(Bitmap.CompressFormat.JPEG, 82, out)
            PickedFile(name.substringBeforeLast('.') + ".jpg", "image/jpeg", out.toByteArray())
        } else PickedFile(name, type, raw)
    }

    // ── Tickets ──
    fun openThread(id: String, admin: Boolean = false) {
        threadJob?.cancel()
        thread = null
        threadError = null
        val path = if (admin) "/api/bot/beheer/ticket?id=$id" else "/api/portaal/ticket/berichten?id=$id"
        threadJob = viewModelScope.launch {
            while (isActive) {
                try {
                    thread = Parse.thread(api.get(path))
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

    fun sendMessage(id: String, text: String, files: List<PickedFile>, admin: Boolean = false, done: (Boolean) -> Unit) {
        viewModelScope.launch {
            try {
                if (files.sumOf { it.bytes.size } > 3 * 1024 * 1024) throw ApiException(413, t("Bijlagen mogen samen maximaal 3 MB zijn.", "Attachments can be 3 MB at most in total."))
                val attachments = JSONArray().apply {
                    files.forEach { put(JSONObject().put("naam", it.name).put("data", Base64.encodeToString(it.bytes, Base64.NO_WRAP))) }
                }
                val body = JSONObject().put("id", id).put("tekst", text).put("bijlagen", attachments).put("bron", "app")
                if (admin) {
                    api.post("/api/bot/beheer/ticket/reageer", body)
                    thread = Parse.thread(api.get("/api/bot/beheer/ticket?id=$id"))
                } else {
                    api.post("/api/portaal/ticket/berichten", body)
                    thread = Parse.thread(api.get("/api/portaal/ticket/berichten?id=$id"))
                }
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
                toast = t("Je ticket is geopend. We reageren zo snel mogelijk.", "Your ticket has been opened. We'll reply as soon as possible.")
                done(true)
                refresh()
            } catch (e: Exception) {
                handle(e); done(false)
            }
        }
    }

    // ── Offers, projects, reviews ──
    fun acceptOffer(id: String, signer: String) {
        viewModelScope.launch {
            try {
                api.post("/api/portaal/offerte", JSONObject().put("id", id).put("ondertekenaar", signer).put("voorwaardenAkkoord", true).put("bron", "app"))
                toast = t("Bedankt! Je krijgt de betaalgegevens in je ticket.", "Thank you! You'll get the payment details in your ticket.")
                refresh()
            } catch (e: Exception) { handle(e) }
        }
    }

    fun projectFeedback(id: String, approve: Boolean, text: String, done: (Boolean) -> Unit) {
        viewModelScope.launch {
            try {
                api.post("/api/portaal/project-feedback", JSONObject().put("id", id).put("soort", if (approve) "akkoord" else "revisie").put("tekst", text))
                toast = if (approve) t("Akkoord doorgegeven aan het team.", "Approval sent to the team.") else t("Je revisieverzoek is doorgegeven.", "Your revision request has been sent.")
                done(true)
            } catch (e: Exception) { handle(e); done(false) }
        }
    }

    fun sendReview(stars: Int, text: String, context: String, done: (Boolean) -> Unit) {
        viewModelScope.launch {
            try {
                api.post("/api/portaal/review", JSONObject().put("sterren", stars).put("tekst", text).put("context", context))
                toast = t("Bedankt voor je review! 🙏", "Thank you for your review! 🙏")
                done(true)
            } catch (e: Exception) { handle(e); done(false) }
        }
    }

    // ── Satisfaction after delivery ──
    fun answerSurvey(id: String, score: Int, note: String, done: (askReview: Boolean?) -> Unit) {
        viewModelScope.launch {
            try {
                val res = api.post("/api/portaal/tevredenheid", JSONObject().put("id", id).put("score", score).put("opmerking", note))
                data = data?.let { d -> d.copy(surveys = d.surveys.filterNot { it.id == id }) }
                toast = t("Bedankt voor je antwoord!", "Thanks for your answer!")
                done(res.optBoolean("vraagReview"))
            } catch (e: Exception) { handle(e); done(null) }
        }
    }

    /** Private calendar link (.ics) for appointments and the content calendar. */
    suspend fun calendarLink(): String? = try {
        val res = api.get("/api/portaal/agenda")
        val key = res.optString("sleutel")
        val id = data?.user?.id
        if (key.isNotBlank() && id != null) "${BuildConfig.SITE_URL}/api/agenda/$id/$key.ics" else null
    } catch (e: Exception) { handle(e); null }

    // ── Social media ──
    fun judgePost(id: String, approve: Boolean, feedback: String, done: (Boolean) -> Unit) {
        viewModelScope.launch {
            try {
                api.post("/api/portaal/social", JSONObject().put("id", id).put("besluit", if (approve) "goedgekeurd" else "aanpassing").put("feedback", feedback))
                toast = if (approve) t("Post goedgekeurd ✅", "Post approved ✅") else t("Je feedback is doorgegeven.", "Your feedback has been sent.")
                done(true)
                refresh()
            } catch (e: Exception) { handle(e); done(false) }
        }
    }

    fun uploadContent(file: PickedFile?, link: String, note: String, done: (Boolean) -> Unit) {
        viewModelScope.launch {
            try {
                if (file != null && file.bytes.size > 4 * 1024 * 1024) throw ApiException(413, t("Maximaal 4 MB. Deel grotere bestanden via een link.", "4 MB at most. Share bigger files through a link."))
                val fields = buildMap { put("notitie", note); if (link.isNotBlank()) { put("link", link); put("naam", link.take(120)) } }
                api.postMultipart("/api/portaal/social/upload", fields, if (link.isBlank()) file?.let { Triple(it.name, it.type, it.bytes) } else null)
                toast = t("Ontvangen! Het team kan ermee aan de slag.", "Received! The team can get started with it.")
                done(true)
                refresh()
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

    fun markRead(id: String) {
        val d = data ?: return
        val n = d.notifications.find { it.id == id } ?: return
        if (n.read) return
        data = d.copy(notifications = d.notifications.map { if (it.id == id) it.copy(read = true) else it }, unread = (d.unread - 1).coerceAtLeast(0))
        viewModelScope.launch {
            try { api.post("/api/portaal/meldingen", JSONObject().put("ids", JSONArray().put(id))) } catch (_: Exception) { }
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
                toast = t("Je afspraak staat gepland. Je krijgt een herinnering in Discord.", "Your appointment is booked. You'll get a reminder in Discord.")
                loadAppointments()
                done(true)
            } catch (e: Exception) { handle(e); done(false) }
        }
    }

    fun cancelAppointment(id: String) {
        viewModelScope.launch {
            try {
                api.delete("/api/portaal/afspraken?id=${Uri.encode(id)}")
                toast = t("Je afspraak is geannuleerd.", "Your appointment has been cancelled.")
                loadAppointments()
            } catch (e: Exception) { handle(e) }
        }
    }

    // ── Owner (admin mode) ──
    fun loadAdmin() {
        viewModelScope.launch {
            try { adminStats = Parse.adminStats(api.get("/api/bot/beheer/funnel?dagen=7")) } catch (_: Exception) { }
            try { adminTickets = Parse.adminTickets(api.get("/api/bot/beheer/tickets")) } catch (e: Exception) { handle(e) }
            try { adminLeads = Parse.adminLeads(api.get("/api/bot/beheer/leads")) } catch (_: Exception) { adminLeads = adminLeads ?: emptyList() }
            try { adminOffers = Parse.adminOffers(api.get("/api/bot/beheer/offertes")) } catch (_: Exception) { adminOffers = adminOffers ?: emptyList() }
        }
    }

    fun setLeadPhase(id: String, phase: String) {
        adminLeads = adminLeads?.map { if (it.id == id) it.copy(phase = phase) else it }
        viewModelScope.launch {
            try { api.post("/api/bot/beheer/lead/fase", JSONObject().put("id", id).put("fase", phase)) } catch (e: Exception) { handle(e); loadAdmin() }
        }
    }

    fun markOfferPaid(id: String) {
        viewModelScope.launch {
            try {
                api.post("/api/bot/beheer/offerte/betaald", JSONObject().put("id", id))
                toast = t("Offerte op betaald gezet. De klant krijgt het betaalbewijs.", "Quote marked as paid. The client gets the receipt.")
                loadAdmin()
            } catch (e: Exception) { handle(e) }
        }
    }

    fun loadAdminProjects() {
        viewModelScope.launch {
            try { adminProjects = Parse.adminProjects(api.get("/api/bot/beheer/projecten")) } catch (e: Exception) { handle(e) }
        }
    }

    fun updateProject(id: String, phase: Int?, percentage: Int?, note: String, done: (Boolean) -> Unit) {
        viewModelScope.launch {
            try {
                val body = JSONObject().put("id", id).put("notitie", note)
                phase?.let { body.put("fase", it) }
                percentage?.let { body.put("percentage", it) }
                api.post("/api/bot/beheer/project/bijwerken", body)
                toast = t("Project bijgewerkt. De klant krijgt een melding.", "Project updated. The client gets a notification.")
                loadAdminProjects()
                done(true)
            } catch (e: Exception) { handle(e); done(false) }
        }
    }

    fun createOffer(ticketId: String, title: String, price: String, items: List<String>, delivery: String, note: String, done: (Boolean) -> Unit) {
        viewModelScope.launch {
            try {
                val res = api.post("/api/bot/beheer/offerte/maak", JSONObject().put("kanaalId", ticketId).put("titel", title).put("prijs", price)
                    .put("onderdelen", JSONArray(items)).put("levertijd", delivery).put("opmerking", note))
                toast = t("Offerte ${res.optString("nummer")} staat in het ticket.", "Quote ${res.optString("nummer")} has been posted in the ticket.")
                done(true)
            } catch (e: Exception) { handle(e); done(false) }
        }
    }

    fun claimTicket(id: String) {
        viewModelScope.launch {
            try {
                api.post("/api/bot/beheer/ticket/claim", JSONObject().put("id", id))
                toast = t("Je hebt dit ticket geclaimd.", "You claimed this ticket.")
            } catch (e: Exception) { handle(e) }
        }
    }

    fun closeTicket(id: String, done: () -> Unit) {
        viewModelScope.launch {
            try {
                api.post("/api/bot/beheer/ticket/sluit", JSONObject().put("id", id))
                toast = t("Het ticket wordt gesloten.", "The ticket is being closed.")
                closeThread()
                loadAdmin()
                done()
            } catch (e: Exception) { handle(e) }
        }
    }

    fun clearError() { error = null }

    override fun onCleared() {
        threadJob?.cancel()
        super.onCleared()
    }
}
