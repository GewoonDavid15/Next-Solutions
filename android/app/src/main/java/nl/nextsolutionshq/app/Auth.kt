package nl.nextsolutionshq.app

import android.content.Context
import android.net.Uri
import android.util.Base64
import androidx.browser.customtabs.CustomTabColorSchemeParams
import androidx.browser.customtabs.CustomTabsIntent
import org.json.JSONObject
import java.security.MessageDigest
import java.security.SecureRandom

/**
 * Discord login. The app makes a secret (PKCE verifier), opens the website's Discord login in a
 * browser tab, and gets a one-time code back through a link. Only this app, which knows the secret,
 * can swap that code for a token.
 */
object Auth {
    private const val PREFS = "login"

    private fun b64(bytes: ByteArray) = Base64.encodeToString(bytes, Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING)

    fun challengeFor(verifier: String): String = b64(MessageDigest.getInstance("SHA-256").digest(verifier.toByteArray()))

    private fun newVerifier(context: Context): String {
        val verifier = b64(ByteArray(48).also { SecureRandom().nextBytes(it) })
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .putString("verifier", verifier).putLong("t", System.currentTimeMillis()).apply()
        return verifier
    }

    /** Without Discord: the website emails a login link that opens this app. */
    suspend fun startEmail(context: Context, email: String, api: Api) {
        val verifier = newVerifier(context)
        api.post("/api/auth/email", JSONObject().put("email", email).put("app", challengeFor(verifier)).put("taal", if (Lang.en) "en" else "nl"))
    }

    fun start(context: Context) {
        val verifier = newVerifier(context)
        val url = Uri.parse("${BuildConfig.SITE_URL}/api/auth/discord").buildUpon()
            .appendQueryParameter("app", challengeFor(verifier)).build()
        val colors = CustomTabColorSchemeParams.Builder().setToolbarColor(0xFF0A0C10.toInt()).build()
        CustomTabsIntent.Builder()
            .setDefaultColorSchemeParams(colors)
            .setShowTitle(true)
            .build()
            .launchUrl(context, url)
    }

    /** Called with the link the website opened: https://nextsolutionshq.nl/app/login?code=... or nlnextsolutions://login?code=... */
    suspend fun finish(context: Context, uri: Uri, tokens: TokenStore): Result<String> {
        uri.getQueryParameter("error")?.let { return Result.failure(ApiException(401, errorText(it))) }
        val code = uri.getQueryParameter("code") ?: return Result.failure(ApiException(400, t("Inloggen is niet gelukt. Probeer het opnieuw.", "Logging in failed. Please try again.")))
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val verifier = prefs.getString("verifier", null)
        if (verifier == null || System.currentTimeMillis() - prefs.getLong("t", 0) > 30 * 60_000) {
            return Result.failure(ApiException(400, t("Inloggen duurde te lang. Probeer het opnieuw.", "Logging in took too long. Please try again.")))
        }
        return try {
            val res = Api(tokens).post("/api/app/token", JSONObject().put("code", code).put("verifier", verifier))
            tokens.token = res.getString("token")
            tokens.expires = res.optLong("geldigTot")
            tokens.userName = res.optJSONObject("gebruiker")?.optString("naam")
            prefs.edit().clear().apply()
            Result.success(tokens.userName ?: "")
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun errorText(code: String) = when (code) {
        "denied" -> t("Je hebt het inloggen bij Discord geannuleerd.", "You cancelled the Discord login.")
        "not_configured", "client_config", "redirect_mismatch" -> t("Inloggen met Discord werkt even niet. Probeer het later opnieuw.", "Discord login is unavailable right now. Try again later.")
        "rate_limited" -> t("Discord is even druk. Probeer het over een minuut opnieuw.", "Discord is busy. Try again in a minute.")
        else -> t("Inloggen is niet gelukt. Probeer het opnieuw.", "Logging in failed. Please try again.")
    }
}
