package nl.nextsolutionshq.app

import org.json.JSONArray
import org.json.JSONObject

data class User(val id: String, val name: String, val username: String, val avatar: String?)
data class Phase(val nr: Int, val name: String, val emoji: String)
data class ProjectUpdate(val t: Long, val percentage: Int, val note: String, val phaseName: String)
data class Project(
    val id: String, val name: String, val phase: Int, val phaseName: String, val phaseEmoji: String,
    val phases: List<Phase>, val percentage: Int, val note: String, val deadline: Long?, val updated: Long?,
    val history: List<ProjectUpdate>,
)
data class Ticket(val id: String, val name: String, val department: String, val emoji: String, val opened: Long, val claimedBy: String?, val link: String)
data class Offer(
    val id: String?, val code: String, val number: String, val title: String, val price: String, val status: String,
    val statusEmoji: String, val t: Long, val paid: Boolean, val deliveryTime: String?, val items: List<String>,
    val validUntil: Long?, val paymentInstruction: String?,
    val signedBy: String? = null, val signedAt: Long? = null,
)
/** Where a notification leads in the app, e.g. ticket + channel id. */
data class Target(val kind: String, val id: String?) {
    fun encode() = if (id != null) "$kind:$id" else kind
    companion object {
        fun decode(s: String?): Target? = s?.takeIf { it.isNotBlank() }?.let { Target(it.substringBefore(':'), it.substringAfter(':', "").ifBlank { null }) }
    }
}
data class Notification(val id: String, val t: Long, val kind: String, val title: String, val text: String, val link: String?, val read: Boolean, val target: Target? = null)
data class Department(val id: String, val title: String, val emoji: String, val short: String, val subjectExample: String, val detailsLabel: String, val detailsExample: String)
data class ClientFile(val id: String, val name: String, val size: Long, val description: String?, val t: Long)
data class Level(val level: Int, val title: String, val xp: Int, val percent: Int)
data class Badge(val id: String, val name: String, val emoji: String, val earned: Boolean, val explanation: String)
data class Profile(val level: Level?, val badges: List<Badge>, val tagline: String?)

data class PortalData(
    val user: User,
    val projects: List<Project>,
    val tickets: List<Ticket>,
    val offers: List<Offer>,
    val files: List<ClientFile>,
    val notifications: List<Notification>,
    val unread: Int,
    val departments: List<Department>,
    val profile: Profile?,
    val transcripts: List<Transcript> = emptyList(),
    val social: Social? = null,
    val owner: Boolean = false,
    val canReview: Boolean = false,
    val surveys: List<Survey> = emptyList(),
    val termsVersion: String = "",
)

data class Survey(val id: String, val project: String)
data class AdminProject(val id: String, val name: String, val client: String?, val phase: Int?, val phaseName: String?, val percentage: Int?, val note: String, val hasStatus: Boolean)

data class Transcript(val id: String, val name: String, val department: String, val emoji: String, val opened: Long, val closed: Long, val messages: Int)

data class SocialFeedback(val t: Long, val decision: String, val text: String)
data class SocialPost(val id: String, val platform: String, val date: Long, val type: String, val title: String, val caption: String, val media: List<String>, val status: String, val feedback: List<SocialFeedback>)
data class SocialReport(val id: String, val month: String, val monthName: String, val highlights: String, val advice: String)
data class SocialUpload(val id: String, val kind: String, val name: String, val size: Long?, val link: String?, val note: String, val t: Long)
data class SocialPayment(val nr: Int, val period: String, val t: Long, val amount: String)
data class Subscription(val packageName: String, val price: String, val platforms: List<String>, val status: String, val nextPayment: Long?, val payments: List<SocialPayment>, val paymentInstruction: String?)
data class Social(val posts: List<SocialPost>, val reports: List<SocialReport>, val uploads: List<SocialUpload>, val subscription: Subscription?) {
    val active: Boolean get() = posts.isNotEmpty() || reports.isNotEmpty() || subscription != null
}

// ── Owner (admin mode) ──
data class AdminTicket(val id: String, val name: String, val department: String, val emoji: String, val owner: String, val lastActivity: Long, val lastFrom: String?)
data class AdminLead(val id: String, val t: Long, val name: String, val email: String, val service: String, val description: String, val phase: String, val note: String, val budget: String)
data class AdminOffer(val id: String, val number: String, val title: String, val price: String, val status: String, val statusName: String, val statusEmoji: String, val t: Long)
data class AdminStats(val visits: Int, val requests: Int, val offers: Int, val paid: Int)

data class ChatAuthor(val id: String, val name: String, val avatar: String?, val bot: Boolean)
data class Attachment(val name: String, val url: String?, val image: Boolean)
data class ChatMessage(val id: String, val t: Long, val author: ChatAuthor, val via: String?, val text: String, val attachments: List<Attachment>)
data class TicketThread(val id: String, val name: String, val messages: List<ChatMessage>)

data class Appointment(val id: String, val start: Long, val end: Long, val subject: String, val note: String, val status: String)
data class AppointmentInfo(val enabled: Boolean, val slots: List<Long>, val duration: Int, val subjects: List<String>, val appointments: List<Appointment>)

// ── Parsing: lenient, so an older bot version with missing fields does not break the app ──

private fun JSONObject.str(key: String): String = if (isNull(key)) "" else optString(key, "")
private fun JSONObject.strOrNull(key: String): String? = if (!has(key) || isNull(key)) null else optString(key).ifBlank { null }
private fun JSONObject.longOrNull(key: String): Long? = if (!has(key) || isNull(key)) null else optLong(key)
private inline fun <T> JSONArray?.map(fn: (JSONObject) -> T): List<T> =
    if (this == null) emptyList() else (0 until length()).mapNotNull { i -> optJSONObject(i)?.let(fn) }
private fun JSONArray?.strings(): List<String> = if (this == null) emptyList() else (0 until length()).map { optString(it) }.filter { it.isNotBlank() }

object Parse {
    fun user(o: JSONObject) = User(o.str("id"), o.str("naam").ifBlank { o.str("gebruikersnaam") }, o.str("gebruikersnaam"), o.strOrNull("avatar"))

    fun project(o: JSONObject) = Project(
        id = o.str("id"), name = o.str("naam"), phase = o.optInt("fase"), phaseName = o.str("faseNaam"), phaseEmoji = o.str("faseEmoji"),
        phases = o.optJSONArray("fases").map { Phase(it.optInt("nr"), it.str("naam"), it.str("emoji")) },
        percentage = o.optInt("percentage").coerceIn(0, 100), note = o.str("notitie"),
        deadline = o.longOrNull("deadline"), updated = o.longOrNull("bijgewerkt"),
        history = o.optJSONArray("geschiedenis").map { ProjectUpdate(it.optLong("t"), it.optInt("percentage"), it.str("notitie"), it.str("faseNaam")) },
    )

    fun ticket(o: JSONObject) = Ticket(o.str("id"), o.str("naam"), o.str("afdeling"), o.str("emoji"), o.optLong("geopend"), o.strOrNull("geclaimdDoor"), o.str("link"))

    fun offer(o: JSONObject) = Offer(
        id = o.strOrNull("id"), code = o.str("code"), number = o.str("nummer"), title = o.str("titel"), price = o.str("prijs"),
        status = o.str("status"), statusEmoji = o.str("statusEmoji"), t = o.optLong("t"), paid = o.optBoolean("betaald"),
        deliveryTime = o.strOrNull("levertijd"), items = o.optJSONArray("onderdelen").strings(),
        validUntil = o.longOrNull("geldigTot"), paymentInstruction = o.strOrNull("betaalinstructie"),
        signedBy = o.optJSONObject("ondertekening")?.strOrNull("naam"), signedAt = o.optJSONObject("ondertekening")?.longOrNull("t"),
    )

    fun notification(o: JSONObject) = Notification(
        o.str("id"), o.optLong("t"), o.str("soort"), o.str("titel"), o.str("tekst"), o.strOrNull("link"), o.optBoolean("gelezen"),
        o.optJSONObject("doel")?.let { d -> d.strOrNull("soort")?.let { Target(it, d.strOrNull("id")) } },
    )

    fun social(o: JSONObject?): Social? {
        if (o == null) return null
        val a = o.optJSONObject("abonnement")
        return Social(
            posts = o.optJSONArray("posts").map { p ->
                SocialPost(p.str("id"), p.str("platform"), p.optLong("datum"), p.str("type"), p.str("titel"), p.str("caption"), p.optJSONArray("media").strings(), p.str("status"),
                    p.optJSONArray("feedback").map { f -> SocialFeedback(f.optLong("t"), f.str("besluit"), f.str("tekst")) })
            },
            reports = o.optJSONArray("rapporten").map { r -> SocialReport(r.str("id"), r.str("maand"), r.str("maandNaam").ifBlank { r.str("maand") }, r.str("hoogtepunten"), r.str("advies")) },
            uploads = o.optJSONArray("uploads").map { u -> SocialUpload(u.str("id"), u.str("soort"), u.str("naam"), u.longOrNull("grootte"), u.strOrNull("link"), u.str("notitie"), u.optLong("t")) },
            subscription = a?.let {
                Subscription(it.str("pakket"), it.str("prijs"), it.optJSONArray("platformen").strings(), it.str("status"), it.longOrNull("volgendeBetaling"),
                    it.optJSONArray("betalingen").map { b -> SocialPayment(b.optInt("nr"), b.str("periode"), b.optLong("t"), b.str("bedrag")) }, it.strOrNull("betaalinstructie"))
            },
        )
    }

    fun adminTickets(o: JSONObject) = o.optJSONArray("open").map {
        val e = it.optJSONObject("eigenaar") ?: JSONObject()
        AdminTicket(it.str("id"), it.str("naam"), it.str("afdelingTitel").ifBlank { it.str("afdeling") }, it.str("emoji"), e.str("naam"), it.optLong("laatsteActiviteit"), it.strOrNull("laatsteVan"))
    }

    fun adminLeads(o: JSONObject) = o.optJSONArray("leads").map {
        AdminLead(it.str("id"), it.optLong("t"), it.str("naam"), it.str("email"), it.str("dienst"), it.str("omschrijving"), it.str("fase").ifBlank { "nieuw" }, it.str("notitie"), it.str("budget"))
    }

    fun adminOffers(o: JSONObject) = o.optJSONArray("offertes").map {
        AdminOffer(it.str("id"), it.str("nummer"), it.str("titel"), it.str("prijs"), it.str("status"), it.str("statusNaam").ifBlank { it.str("status") }, it.str("statusEmoji"), it.optLong("t"))
    }

    fun adminProjects(o: JSONObject) = o.optJSONArray("projecten").map {
        AdminProject(it.str("id"), it.str("naam"), it.strOrNull("klant"), if (it.isNull("faseNr")) null else it.optInt("faseNr"), it.strOrNull("fase"),
            if (it.isNull("percentage")) null else it.optInt("percentage"), it.str("notitie"), it.optBoolean("heeftStatus", !it.isNull("percentage")))
    }

    fun adminStats(o: JSONObject): AdminStats {
        val t = o.optJSONObject("totaal") ?: JSONObject()
        return AdminStats(t.optInt("bezoeken"), t.optInt("aanvragen"), t.optInt("offertes"), t.optInt("betaald"))
    }

    fun department(o: JSONObject) = Department(o.str("id"), o.str("titel"), o.str("emoji"), o.str("kort"), o.str("onderwerpVoorbeeld"), o.str("detailsLabel"), o.str("detailsVoorbeeld"))

    fun profile(o: JSONObject?): Profile? {
        if (o == null) return null
        val n = o.optJSONObject("niveau")
        return Profile(
            level = n?.let { Level(it.optInt("level"), it.str("titel"), it.optInt("xp"), it.optInt("procent").coerceIn(0, 100)) },
            badges = o.optJSONArray("badges").map { Badge(it.str("id"), it.str("naam"), it.str("emoji"), it.optBoolean("behaald"), it.str("uitleg")) },
            tagline = o.strOrNull("tagline"),
        )
    }

    fun portal(o: JSONObject): PortalData {
        val m = o.optJSONObject("meldingen")
        return PortalData(
            user = user(o.optJSONObject("gebruiker") ?: JSONObject()),
            projects = o.optJSONArray("projecten").map(::project),
            tickets = o.optJSONArray("tickets").map(::ticket),
            offers = o.optJSONArray("offertes").map(::offer),
            files = o.optJSONArray("bestanden").map { ClientFile(it.str("id"), it.str("naam"), it.optLong("grootte"), it.strOrNull("beschrijving"), it.optLong("t")) },
            notifications = m?.optJSONArray("meldingen").map(::notification),
            unread = m?.optInt("ongelezen") ?: 0,
            departments = o.optJSONArray("afdelingen").map(::department),
            profile = profile(o.optJSONObject("profiel")),
            transcripts = o.optJSONArray("transcripts").map { Transcript(it.str("id"), it.str("naam"), it.str("afdeling"), it.str("emoji"), it.optLong("geopend"), it.optLong("gesloten"), it.optInt("berichten")) },
            social = social(o.optJSONObject("social")),
            owner = o.optBoolean("eigenaar"),
            canReview = o.optBoolean("kanReviewen"),
            surveys = o.optJSONArray("tevredenheid").map { Survey(it.str("id"), it.str("project")) },
            termsVersion = o.str("voorwaardenVersie"),
        )
    }

    fun thread(o: JSONObject) = TicketThread(
        id = o.str("id"), name = o.str("naam"),
        messages = o.optJSONArray("berichten").map { b ->
            val a = b.optJSONObject("auteur") ?: JSONObject()
            ChatMessage(
                id = b.str("id"), t = b.optLong("t"),
                author = ChatAuthor(a.str("id"), a.str("naam").ifBlank { "Onbekend" }, a.strOrNull("avatar"), a.optBoolean("bot")),
                via = b.strOrNull("via"), text = b.str("tekst"),
                attachments = b.optJSONArray("bijlagen").map { Attachment(it.str("naam"), it.strOrNull("url")?.takeIf { u -> u.startsWith("https://") }, it.optBoolean("afbeelding")) },
            )
        },
    )

    fun appointments(o: JSONObject) = AppointmentInfo(
        enabled = o.optBoolean("aan", true),
        slots = o.optJSONArray("slots").let { a -> if (a == null) emptyList() else (0 until a.length()).map { a.optLong(it) }.filter { it > 0 } },
        duration = o.optInt("duur", 30),
        subjects = o.optJSONArray("onderwerpen").strings(),
        appointments = o.optJSONArray("afspraken").map { Appointment(it.str("id"), it.optLong("start"), it.optLong("eind"), it.str("onderwerp"), it.str("notitie"), it.str("status")) },
    )
}
