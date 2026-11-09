package nl.nextsolutionshq.app

import java.util.Locale

/** The app follows the phone's language: Dutch on a Dutch phone, English everywhere else. */
object Lang {
    val en: Boolean get() = Locale.getDefault().language != "nl"
    val locale: Locale get() = if (en) Locale.UK else Locale("nl", "NL")
}

/** Picks the Dutch or English text. */
fun t(nl: String, en: String): String = if (Lang.en) en else nl
