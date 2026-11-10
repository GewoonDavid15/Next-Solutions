package nl.nextsolutionshq.app.ui

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Fingerprint
import androidx.compose.material.icons.filled.FolderOpen
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.mutableStateListOf
import kotlinx.coroutines.launch
import nl.nextsolutionshq.app.QuickReplies
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import nl.nextsolutionshq.app.AppViewModel
import nl.nextsolutionshq.app.BuildConfig
import nl.nextsolutionshq.app.MainActivity
import nl.nextsolutionshq.app.Settings
import nl.nextsolutionshq.app.t
import nl.nextsolutionshq.app.NextApp as NextApplication

@Composable
fun MoreScreen(vm: AppViewModel, navigate: (Route) -> Unit, askNotificationPermission: () -> Unit) {
    val context = LocalContext.current
    val settings = remember { Settings(context) }
    var notify by remember { mutableStateOf(settings.notifications) }
    var lock by remember { mutableStateOf(settings.lock) }
    var confirmLogout by remember { mutableStateOf(false) }
    val d = vm.data
    val app = context.applicationContext as NextApplication

    LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        if (d != null) item {
            Panel {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Avatar(d.user.avatar, d.user.name, 56)
                        Spacer(Modifier.width(14.dp))
                        Column {
                            Text(d.user.name, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                            Text("@${d.user.username}", color = Muted)
                            d.profile?.tagline?.let { Text(it, fontSize = 14.sp) }
                        }
                    }
                    d.profile?.level?.let { l ->
                        Text(t("Niveau", "Level") + " ${l.level} • ${l.title} • ${l.xp} XP", color = Muted, fontSize = 14.sp)
                        ProgressBar(l.percent)
                    }
                    val badges = d.profile?.badges?.filter { it.earned }.orEmpty()
                    if (badges.isNotEmpty()) Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        badges.forEach { b -> Box(Modifier.clip(RoundedCornerShape(10.dp)).background(Surface2).padding(horizontal = 8.dp, vertical = 4.dp)) { Text("${b.emoji} ${b.name}", fontSize = 13.sp) } }
                    }
                }
            }
        }
        if (d?.owner == true) item { MenuRow(Icons.Filled.AdminPanelSettings, t("Beheer-modus", "Admin mode"), t("Aanvragen, tickets en offertes", "Requests, tickets and quotes")) { navigate(Route.Admin) } }
        item { MenuRow(Icons.Filled.Notifications, t("Meldingen", "Notifications"), d?.unread?.takeIf { it > 0 }?.let { t("$it nieuw", "$it new") }) { navigate(Route.Notifications) } }
        if (d?.social?.active == true) item { MenuRow(Icons.Filled.FolderOpen, t("Projecten", "Projects"), null) { navigate(Route.Projects) } }
        item { MenuRow(Icons.Filled.CalendarMonth, t("Afspraken", "Appointments"), t("Plan een call met het team", "Book a call with the team")) { navigate(Route.Appointments) } }
        item { MenuRow(Icons.Filled.Download, t("Bestanden", "Files"), d?.files?.size?.takeIf { it > 0 }?.let { t("$it bestanden", "$it files") }) { navigate(Route.Files) } }
        if (d?.transcripts?.isNotEmpty() == true) item { MenuRow(Icons.Filled.History, t("Gesloten tickets", "Closed tickets"), null) { navigate(Route.Transcripts) } }
        if (d?.canReview == true) item { MenuRow(Icons.Filled.Star, t("Review schrijven", "Write a review"), null) { navigate(Route.Review) } }
        if (d?.owner == true) item { MenuRow(Icons.Filled.Bolt, t("Snelle antwoorden", "Quick replies"), t("Vaste teksten voor tickets", "Saved texts for tickets")) { navigate(Route.QuickRepliesEdit) } }

        item { SectionTitle(t("Instellingen", "Settings")) }
        item {
            ToggleRow(
                Icons.Filled.NotificationsActive, t("Meldingen op je telefoon", "Notifications on your phone"),
                if (app.firebaseReady) t("Direct bij nieuwe berichten", "Instantly for new messages") else t("We kijken elke 15 minuten of er iets nieuws is.", "We check every 15 minutes for news."),
                notify,
            ) {
                notify = it
                settings.notifications = it
                if (it) askNotificationPermission()
                app.scheduleChecks()
            }
        }
        if (MainActivity.canLock(context)) item {
            ToggleRow(Icons.Filled.Fingerprint, t("Vergrendelen met vingerafdruk", "Lock with fingerprint"), t("Vraag om je vingerafdruk, gezicht of pincode bij het openen.", "Ask for your fingerprint, face or PIN when opening."), lock) {
                lock = it
                settings.lock = it
            }
        }
        item { MenuRow(Icons.Filled.Language, t("Website openen", "Open website"), "nextsolutionshq.nl") { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(BuildConfig.SITE_URL))) } }
        item { MenuRow(Icons.AutoMirrored.Filled.Logout, t("Uitloggen", "Log out"), null, danger = true) { confirmLogout = true } }
        item {
            Text(
                t("Versie", "Version") + " ${BuildConfig.VERSION_NAME}" + (vm.update?.let { t(" • nieuwe versie ${it.name} beschikbaar", " • new version ${it.name} available") } ?: ""),
                color = if (vm.update != null) Lime else Faint, fontSize = 12.sp,
                modifier = Modifier.padding(top = 8.dp).then(if (vm.update != null) Modifier.clickable { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(vm.update!!.url))) } else Modifier),
            )
        }
    }
    if (confirmLogout) AlertDialog(
        onDismissRequest = { confirmLogout = false },
        title = { Text(t("Uitloggen?", "Log out?")) },
        text = { Text(t("Je kunt altijd weer inloggen met Discord.", "You can always log in again with Discord.")) },
        confirmButton = { Button(onClick = { confirmLogout = false; vm.logout() }) { Text(t("Uitloggen", "Log out")) } },
        dismissButton = { TextButton(onClick = { confirmLogout = false }) { Text(t("Annuleren", "Cancel")) } },
    )
}

@Composable
fun MenuRow(icon: ImageVector, title: String, subtitle: String?, danger: Boolean = false, onClick: () -> Unit) {
    Panel(onClick = onClick) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, null, tint = if (danger) Danger else Lime)
            Spacer(Modifier.width(14.dp))
            Column(Modifier.weight(1f)) {
                Text(title, fontWeight = FontWeight.SemiBold, color = if (danger) Danger else Color.White)
                subtitle?.let { Text(it, color = Muted, fontSize = 13.sp) }
            }
            if (!danger) Icon(Icons.Filled.ChevronRight, null, tint = Faint)
        }
    }
}

@Composable
private fun ToggleRow(icon: ImageVector, title: String, subtitle: String, checked: Boolean, onChange: (Boolean) -> Unit) {
    Panel {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, null, tint = Lime)
            Spacer(Modifier.width(14.dp))
            Column(Modifier.weight(1f)) {
                Text(title, fontWeight = FontWeight.SemiBold)
                Text(subtitle, color = Muted, fontSize = 13.sp)
            }
            Switch(checked = checked, onCheckedChange = onChange, colors = SwitchDefaults.colors(checkedTrackColor = Lime, checkedThumbColor = Ink))
        }
    }
}

// ═══════════════════════════════ Afspraken ═══════════════════════════════
@Composable
fun AppointmentsScreen(vm: AppViewModel) {
    LaunchedEffect(Unit) { vm.loadAppointments() }
    val info = vm.appointments
    var subject by remember { mutableStateOf<String?>(null) }
    var day by remember { mutableStateOf<String?>(null) }
    var slot by remember { mutableStateOf<Long?>(null) }
    var note by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    var cancel by remember { mutableStateOf<String?>(null) }

    if (info == null) { Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = Lime) }; return }

    val upcoming = info.appointments.filter { it.status == "gepland" && it.end > System.currentTimeMillis() }.sortedBy { it.start }
    val days = info.slots.groupBy { dayKey(it) }
    val chosenDay = day ?: days.keys.firstOrNull()
    val chosenSubject = subject ?: info.subjects.firstOrNull()

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).imePadding().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        if (upcoming.isNotEmpty()) {
            SectionTitle(t("Jouw afspraken", "Your appointments"))
            upcoming.forEach { a ->
                Panel {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(a.subject, fontWeight = FontWeight.SemiBold)
                            Text("${dayLabel(a.start)} • ${time(a.start)} - ${time(a.end)}", color = Muted, fontSize = 14.sp)
                            if (a.note.isNotBlank()) Text(a.note, color = Faint, fontSize = 13.sp)
                        }
                        TextButton(onClick = { cancel = a.id }) { Text(t("Annuleren", "Cancel"), color = Danger) }
                    }
                }
            }
        }
        val context = LocalContext.current
        val scope = rememberCoroutineScope()
        OutlinedButton(onClick = {
            scope.launch {
                vm.calendarLink()?.let { link ->
                    val webcal = link.replaceFirst(Regex("^https?:"), "webcal:")
                    val google = "https://calendar.google.com/calendar/r?cid=" + Uri.encode(webcal)
                    context.startActivity(Intent.createChooser(Intent(Intent.ACTION_VIEW, Uri.parse(google)), t("Toevoegen aan agenda", "Add to calendar")))
                }
            }
        }, modifier = Modifier.fillMaxWidth()) { Text("📅 " + t("Afspraken en contentkalender in je agenda", "Appointments and content calendar in your calendar")) }
        SectionTitle(t("Afspraak plannen", "Book an appointment"))
        if (!info.enabled || info.slots.isEmpty()) {
            Text(t("Er zijn op dit moment geen vrije momenten. Open een ticket, dan plannen we samen iets.", "There are no free slots right now. Open a ticket and we'll plan something together."), color = Muted)
        } else {
            Text(t("Een (Discord-)call van ${info.duration} minuten. Tijden zijn Nederlandse tijd.", "A (Discord) call of ${info.duration} minutes. Times are Dutch time."), color = Muted, fontSize = 14.sp)
            ChipRow(info.subjects, chosenSubject, { it }) { subject = it }
            ChipRow(days.keys.toList(), chosenDay, { dayLabel(days[it]!!.first()) }) { day = it; slot = null }
            ChipRow(days[chosenDay].orEmpty(), slot, { time(it) }) { slot = it }
            OutlinedTextField(note, { note = it.take(500) }, label = { Text(t("Waar wil je het over hebben? (optioneel)", "What would you like to discuss? (optional)")) }, minLines = 2, modifier = Modifier.fillMaxWidth())
            Button(
                enabled = !busy && slot != null && chosenSubject != null,
                onClick = { busy = true; vm.book(slot!!, chosenSubject!!, note.trim()) { ok -> busy = false; if (ok) { slot = null; note = "" } } },
                modifier = Modifier.fillMaxWidth().height(52.dp),
            ) { Text(slot?.let { t("Plan op ${dayLabel(it)} om ${time(it)}", "Book on ${dayLabel(it)} at ${time(it)}") } ?: t("Kies een tijd", "Choose a time")) }
        }
    }
    cancel?.let { id ->
        AlertDialog(
            onDismissRequest = { cancel = null },
            title = { Text(t("Afspraak annuleren?", "Cancel appointment?")) },
            confirmButton = { Button(onClick = { vm.cancelAppointment(id); cancel = null }) { Text(t("Annuleren", "Cancel it")) } },
            dismissButton = { TextButton(onClick = { cancel = null }) { Text(t("Terug", "Back")) } },
        )
    }
}

@Composable
fun <T> ChipRow(options: List<T>, selected: T?, label: (T) -> String, onSelect: (T) -> Unit) {
    Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        options.forEach { o ->
            val active = o == selected
            Box(
                Modifier.clip(RoundedCornerShape(14.dp))
                    .background(if (active) MaterialTheme.colorScheme.primaryContainer else Surface1)
                    .border(1.dp, if (active) Lime else MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(14.dp))
                    .clickable { onSelect(o) }
                    .padding(horizontal = 14.dp, vertical = 10.dp),
            ) { Text(label(o), color = if (active) Lime else Color.White, fontSize = 14.sp) }
        }
    }
}

// ═══════════════════════════════ Bestanden ═══════════════════════════════
@Composable
fun FilesScreen(vm: AppViewModel) {
    val context = LocalContext.current
    val files = vm.data?.files.orEmpty()
    LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        if (files.isEmpty()) item { EmptyState("📂", t("Nog geen bestanden", "No files yet"), t("Bestanden die het team voor je klaarzet (zoals opleveringen) vind je hier.", "Files the team prepares for you (like deliveries) are here.")) }
        items(files.sortedByDescending { it.t }, key = { it.id }) { f ->
            Panel(onClick = { download(context, "${BuildConfig.SITE_URL}/klantportaal/bestand/${f.id}", f.name) }) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text(f.name, fontWeight = FontWeight.SemiBold)
                        Text("${fileSize(f.size)} • ${date(f.t)}", color = Muted, fontSize = 13.sp)
                        f.description?.let { Text(it, color = Faint, fontSize = 13.sp) }
                    }
                    Icon(Icons.Filled.Download, t("Downloaden", "Download"), tint = Lime)
                }
            }
        }
    }
}

// ═══════════════════════════════ Review ═══════════════════════════════
@Composable
fun ReviewScreen(vm: AppViewModel, done: () -> Unit) {
    var stars by remember { mutableIntStateOf(5) }
    var text by remember { mutableStateOf("") }
    var context by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).imePadding().padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text(t("Hoe was het om met ons samen te werken? Je review verschijnt op onze website.", "How was it to work with us? Your review appears on our website."), color = Muted)
        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
            (1..5).forEach { n ->
                Text(if (n <= stars) "★" else "☆", fontSize = 40.sp, color = if (n <= stars) Lime else Faint, modifier = Modifier.clickable { stars = n })
            }
        }
        OutlinedTextField(text, { text = it.take(500) }, label = { Text(t("Je ervaring", "Your experience")) }, minLines = 4, modifier = Modifier.fillMaxWidth(), supportingText = { Text("${text.length}/500") })
        OutlinedTextField(context, { context = it.take(80) }, label = { Text(t("Waarvoor? (bijv. Discord-bot, website)", "What for? (e.g. Discord bot, website)")) }, singleLine = true, modifier = Modifier.fillMaxWidth())
        Button(
            enabled = !busy && text.trim().length >= 10,
            onClick = { busy = true; vm.sendReview(stars, text.trim(), context.trim()) { ok -> busy = false; if (ok) done() } },
            modifier = Modifier.fillMaxWidth().height(52.dp),
        ) { Text(if (busy) t("Bezig...", "Working...") else t("Review plaatsen", "Post review")) }
    }
}

// ═══════════════════════════════ Snelle antwoorden ═══════════════════════════════
@Composable
fun QuickRepliesScreen() {
    val context = LocalContext.current
    val list = remember { mutableStateListOf<String>().apply { addAll(QuickReplies.load(context)) } }
    var draft by remember { mutableStateOf("") }
    LazyColumn(Modifier.fillMaxSize().imePadding(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item { Text(t("Deze teksten kies je met ⚡ in een ticket. Ze staan alleen op deze telefoon.", "Pick these texts with ⚡ in a ticket. They are stored on this phone only."), color = Muted) }
        items(list.toList()) { r ->
            Panel {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(r, modifier = Modifier.weight(1f), fontSize = 14.sp)
                    TextButton(onClick = { list.remove(r); QuickReplies.save(context, list) }) { Text(t("Weg", "Remove"), color = Danger) }
                }
            }
        }
        item {
            OutlinedTextField(draft, { draft = it.take(1900) }, label = { Text(t("Nieuwe tekst", "New text")) }, minLines = 2, modifier = Modifier.fillMaxWidth())
            Spacer(Modifier.height(8.dp))
            Button(enabled = draft.isNotBlank() && list.size < 20, onClick = { list.add(draft.trim()); QuickReplies.save(context, list); draft = "" }) { Text(t("Toevoegen", "Add")) }
        }
    }
}
