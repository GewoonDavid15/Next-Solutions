package nl.nextsolutionshq.app

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.SystemClock
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_WEAK
import androidx.biometric.BiometricManager.Authenticators.DEVICE_CREDENTIAL
import androidx.biometric.BiometricPrompt
import androidx.compose.runtime.mutableStateOf
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import nl.nextsolutionshq.app.ui.NextTheme
import nl.nextsolutionshq.app.ui.NextApp as NextAppUi

class MainActivity : FragmentActivity() {
    private val vm: AppViewModel by viewModels()
    private val startTab = mutableStateOf<String?>(null)
    private val startTarget = mutableStateOf<Target?>(null)
    /** Fingerprint/face lock: true while the app waits for the user to unlock */
    val locked = mutableStateOf(false)
    private var backgroundSince = 0L
    private val askPermission = registerForActivityResult(ActivityResultContracts.RequestPermission()) { }

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        locked.value = lockEnabled()
        handle(intent)
        setContent {
            NextTheme {
                NextAppUi(
                    vm = vm,
                    startTab = startTab.value,
                    startTarget = startTarget.value,
                    onStartConsumed = { startTab.value = null; startTarget.value = null },
                    askNotificationPermission = { askNotificationPermission(it) },
                    locked = locked.value,
                    unlock = ::unlock,
                )
            }
        }
        if (locked.value) unlock()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handle(intent)
    }

    override fun onStop() {
        super.onStop()
        backgroundSince = SystemClock.elapsedRealtime()
    }

    override fun onStart() {
        super.onStart()
        // Lock again after a minute in the background
        if (backgroundSince > 0 && lockEnabled() && SystemClock.elapsedRealtime() - backgroundSince > 60_000) {
            locked.value = true
            unlock()
        }
    }

    override fun onResume() {
        super.onResume()
        if (vm.loggedIn) vm.refresh()
    }

    private fun lockEnabled() = vm.loggedIn && Settings(this).lock && canLock(this)

    fun unlock() {
        if (!canLock(this)) { locked.value = false; return }
        val prompt = BiometricPrompt(this, ContextCompat.getMainExecutor(this), object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) { locked.value = false }
        })
        prompt.authenticate(
            BiometricPrompt.PromptInfo.Builder()
                .setTitle(t("Next Solutions ontgrendelen", "Unlock Next Solutions"))
                .setSubtitle(t("Gebruik je vingerafdruk, gezicht of pincode", "Use your fingerprint, face or PIN"))
                .setAllowedAuthenticators(BIOMETRIC_WEAK or DEVICE_CREDENTIAL)
                .build(),
        )
    }

    private fun handle(intent: Intent?) {
        val uri: Uri? = intent?.data
        if (uri != null && (uri.scheme == "nlnextsolutions" || uri.path == "/app/login")) {
            vm.finishLogin(uri)
            intent.data = null
        }
        intent?.getStringExtra(EXTRA_NOTIFICATION)?.let { vm.markRead(it); intent.removeExtra(EXTRA_NOTIFICATION) }
        intent?.getStringExtra(EXTRA_TARGET)?.let { startTarget.value = Target.decode(it); intent.removeExtra(EXTRA_TARGET) }
        intent?.getStringExtra(EXTRA_TAB)?.let { startTab.value = it; intent.removeExtra(EXTRA_TAB) }
    }

    /** Asks once on its own; after that only when the user turns notifications on in the app. */
    fun askNotificationPermission(force: Boolean = false) {
        if (Build.VERSION.SDK_INT < 33) return
        if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED) return
        val prefs = getSharedPreferences("instellingen", MODE_PRIVATE)
        if (!force && prefs.getBoolean("toestemmingGevraagd", false)) return
        prefs.edit().putBoolean("toestemmingGevraagd", true).apply()
        askPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
    }

    companion object {
        const val EXTRA_TAB = "tab"
        const val EXTRA_TARGET = "doel"
        const val EXTRA_NOTIFICATION = "melding"

        /** True when the phone has a fingerprint, face unlock or a screen lock the app can use. */
        fun canLock(context: android.content.Context) =
            BiometricManager.from(context).canAuthenticate(BIOMETRIC_WEAK or DEVICE_CREDENTIAL) == BiometricManager.BIOMETRIC_SUCCESS
    }
}
