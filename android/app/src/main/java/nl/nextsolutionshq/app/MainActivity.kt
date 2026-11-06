package nl.nextsolutionshq.app

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.runtime.mutableStateOf
import nl.nextsolutionshq.app.ui.NextApp as NextAppUi
import nl.nextsolutionshq.app.ui.NextTheme

class MainActivity : ComponentActivity() {
    private val vm: AppViewModel by viewModels()
    private val startTab = mutableStateOf<String?>(null)
    private val askPermission = registerForActivityResult(ActivityResultContracts.RequestPermission()) { }

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        handle(intent)
        setContent {
            NextTheme {
                NextAppUi(vm, startTab.value, onTabConsumed = { startTab.value = null }, askNotificationPermission = { askNotificationPermission(it) })
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handle(intent)
    }

    override fun onResume() {
        super.onResume()
        if (vm.loggedIn) vm.refresh()
    }

    private fun handle(intent: Intent?) {
        val uri: Uri? = intent?.data
        if (uri != null && (uri.scheme == "nlnextsolutions" || uri.path == "/app/login")) {
            vm.finishLogin(uri)
            intent.data = null
        }
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
    }
}
