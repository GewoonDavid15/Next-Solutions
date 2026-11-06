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
)
data class Notification(val id: String, val t: Long, val kind: String, val title: String, val text: String, val link: String?, val read: Boolean)
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
)

data class ChatAuthor(val id: String, val name: String, val avatar: String?, val bot: Boolean)
data class ChatMessage(val id: String, val t: Long, val author: ChatAuthor, val via: String?, val text: String, val attachments: List<String>)
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
    )

    fun notification(o: JSONObject) = Notification(o.str("id"), o.optLong("t"), o.str("soort"), o.str("titel"), o.str("tekst"), o.strOrNull("link"), o.optBoolean("gelezen"))

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
                attachments = b.optJSONArray("bijlagen").map { it.str("naam") },
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
