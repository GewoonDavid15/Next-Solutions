package nl.nextsolutionshq.app

import android.content.Context
import org.json.JSONArray

/** Saved quick replies for the ticket chat (editable in the app, stored on this phone). */
object QuickReplies {
    private val defaults get() = listOf(
        t("Bedankt voor je bericht! We gaan ermee aan de slag en laten het je snel weten.", "Thanks for your message! We're on it and will let you know soon."),
        t("Kun je een screenshot sturen van wat je ziet?", "Could you send a screenshot of what you see?"),
        t("Dit is opgelost. Laat je weten of alles nu goed werkt?", "This has been fixed. Could you let us know if everything works now?"),
        t("We hebben de offerte in dit ticket gezet. Laat maar weten als je vragen hebt!", "We've posted the quote in this ticket. Let us know if you have any questions!"),
    )

    fun load(context: Context): List<String> {
        val raw = context.getSharedPreferences("snelle-antwoorden", Context.MODE_PRIVATE).getString("lijst", null) ?: return defaults
        return try { JSONArray(raw).let { a -> (0 until a.length()).map { a.getString(it) } } } catch (_: Exception) { defaults }
    }

    fun save(context: Context, list: List<String>) {
        context.getSharedPreferences("snelle-antwoorden", Context.MODE_PRIVATE).edit()
            .putString("lijst", JSONArray(list.map { it.take(1900) }.filter { it.isNotBlank() }.take(20)).toString()).apply()
    }
}
