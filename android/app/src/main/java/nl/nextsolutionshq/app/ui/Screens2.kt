package nl.nextsolutionshq.app.ui

import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Environment
import android.widget.Toast
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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FilledIconButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import nl.nextsolutionshq.app.AppViewModel
import nl.nextsolutionshq.app.BuildConfig
import nl.nextsolutionshq.app.ChatMessage
import nl.nextsolutionshq.app.NextApp as NextApplication
import nl.nextsolutionshq.app.Settings

// ═══════════════════════════════ Ticket-chat ═══════════════════════════════
@Composable
fun ChatScreen(vm: AppViewModel, id: String) {
    LaunchedEffect(id) { vm.openThread(id) }
    val thread = vm.thread?.takeIf { it.id == id }
    val me = vm.data?.user?.id
    var text by remember { mutableStateOf("") }
    var sending by remember { mutableStateOf(false) }
    val list = rememberLazyListState()
    LaunchedEffect(thread?.messages?.size) { if ((thread?.messages?.size ?: 0) > 0) list.scrollToItem(0) }

    Column(Modifier.fillMaxSize().imePadding()) {
        Box(Modifier.weight(1f).fillMaxWidth()) {
            when {
                thread == null && vm.threadError != null -> Column(Modifier.padding(16.dp)) { ErrorBox(vm.threadError!!) { vm.openThread(id) } }
                thread == null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = Lime) }
                thread.messages.isEmpty() -> EmptyState("💬", "Nog geen berichten", "Stel hieronder je vraag; het team ziet je bericht direct in Discord.")
                else -> LazyColumn(
                    state = list, reverseLayout = true, modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    items(thread.messages.sortedByDescending { it.t }, key = { it.id }) { m -> Bubble(m, mine = m.author.id == me || m.via == "klant") }
                }
            }
        }
        Row(
            Modifier.fillMaxWidth().background(Surface1).padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            OutlinedTextField(
                value = text, onValueChange = { text = it.take(1900) },
                placeholder = { Text("Typ een bericht...") },
                modifier = Modifier.weight(1f), maxLines = 5,
                keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Sentences),
                shape = RoundedCornerShape(18.dp),
            )
            Spacer(Modifier.width(8.dp))
            FilledIconButton(
                enabled = text.isNotBlank() && !sending,
                onClick = { sending = true; vm.sendMessage(id, text.trim()) { ok -> sending = false; if (ok) text = "" } },
                colors = IconButtonDefaults.filledIconButtonColors(containerColor = Lime, contentColor = Ink),
            ) {
                if (sending) CircularProgressIndicator(Modifier.size(18.dp), strokeWidth = 2.dp, color = Ink)
                else Icon(Icons.AutoMirrored.Filled.Send, contentDescription = "Versturen")
            }
        }
    }
}

@Composable
private fun Bubble(m: ChatMessage, mine: Boolean) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = if (mine) Arrangement.End else Arrangement.Start) {
        if (!mine) { Avatar(m.author.avatar, m.author.name, 32); Spacer(Modifier.width(8.dp)) }
        Column(
            Modifier.widthIn(max = 300.dp).clip(RoundedCornerShape(18.dp))
                .background(if (mine) MaterialTheme.colorScheme.primaryContainer else Surface2).padding(12.dp),
        ) {
            if (!mine) Text(m.author.name + if (m.author.bot) " • bot" else "", color = Lime, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            if (m.text.isNotBlank()) Text(m.text, color = Color.White)
            m.attachments.forEach { Text("📎 $it", color = Muted, fontSize = 13.sp) }
            Text(dateTime(m.t), color = Faint, fontSize = 11.sp, modifier = Modifier.align(Alignment.End))
        }
    }
}

// ═══════════════════════════════ Nieuw ticket ═══════════════════════════════
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NewTicketScreen(vm: AppViewModel, done: () -> Unit) {
    val departments = vm.data?.departments.orEmpty()
    var dept by remember { mutableStateOf(departments.firstOrNull()) }
    var open by remember { mutableStateOf(false) }
    var subject by remember { mutableStateOf("") }
    var details by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).imePadding().padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text("Vertel waar we je mee kunnen helpen. Het team ziet je ticket direct in Discord en je volgt het gesprek hier in de app.", color = Muted)
        if (departments.isEmpty()) {
            ErrorBox("De afdelingen konden niet geladen worden. Probeer het later opnieuw.") { vm.refresh() }
            return@Column
        }
        ExposedDropdownMenuBox(expanded = open, onExpandedChange = { open = it }) {
            OutlinedTextField(
                value = dept?.let { "${it.emoji} ${it.title}" } ?: "", onValueChange = {}, readOnly = true,
                label = { Text("Afdeling") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(open) },
                modifier = Modifier.fillMaxWidth().menuAnchor(MenuAnchorType.PrimaryNotEditable),
            )
            ExposedDropdownMenu(expanded = open, onDismissRequest = { open = false }) {
                departments.forEach { d ->
                    DropdownMenuItem(
                        text = { Column { Text("${d.emoji} ${d.title}"); if (d.short.isNotBlank()) Text(d.short, color = Muted, fontSize = 12.sp) } },
                        onClick = { dept = d; open = false },
                    )
                }
            }
        }
        OutlinedTextField(subject, { subject = it.take(100) }, label = { Text("Onderwerp") }, placeholder = { Text(dept?.subjectExample ?: "") }, singleLine = true, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(
            details, { details = it.take(1500) }, label = { Text(dept?.detailsLabel?.ifBlank { null } ?: "Omschrijving") },
            placeholder = { Text(dept?.detailsExample ?: "") }, minLines = 5, modifier = Modifier.fillMaxWidth(),
            supportingText = { Text("${details.length}/1500 • minimaal 10 tekens") },
        )
        Button(
            enabled = !busy && dept != null && subject.trim().length >= 3 && details.trim().length >= 10,
            onClick = { busy = true; vm.newTicket(dept!!.id, subject.trim(), details.trim()) { ok -> busy = false; if (ok) done() } },
            modifier = Modifier.fillMaxWidth().height(52.dp),
        ) { Text(if (busy) "Bezig..." else "Ticket openen") }
    }
}

// ═══════════════════════════════ Meer ═══════════════════════════════
@Composable
fun MoreScreen(vm: AppViewModel, navigate: (Route) -> Unit, askNotificationPermission: () -> Unit) {
    val context = LocalContext.current
    val settings = remember { Settings(context) }
    var notify by remember { mutableStateOf(settings.notifications) }
    var confirmLogout by remember { mutableStateOf(false) }
    val d = vm.data

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
                        Text("Niveau ${l.level} • ${l.title} • ${l.xp} XP", color = Muted, fontSize = 14.sp)
                        ProgressBar(l.percent)
                    }
                    val badges = d.profile?.badges?.filter { it.earned }.orEmpty()
                    if (badges.isNotEmpty()) Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        badges.forEach { b -> Box(Modifier.clip(RoundedCornerShape(10.dp)).background(Surface2).padding(horizontal = 8.dp, vertical = 4.dp)) { Text("${b.emoji} ${b.name}", fontSize = 13.sp) } }
                    }
                }
            }
        }
        item { MenuRow(Icons.Filled.Notifications, "Meldingen", d?.unread?.takeIf { it > 0 }?.let { "$it nieuw" }) { navigate(Route.Notifications) } }
        item { MenuRow(Icons.Filled.CalendarMonth, "Afspraken", "Plan een call met het team") { navigate(Route.Appointments) } }
        item { MenuRow(Icons.Filled.Download, "Bestanden", d?.files?.size?.takeIf { it > 0 }?.let { "$it bestanden" }) { navigate(Route.Files) } }
        item {
            Panel {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Filled.NotificationsActive, null, tint = Lime)
                    Spacer(Modifier.width(14.dp))
                    Column(Modifier.weight(1f)) {
                        Text("Meldingen op je telefoon", fontWeight = FontWeight.SemiBold)
                        Text("We kijken elke 15 minuten of er iets nieuws is.", color = Muted, fontSize = 13.sp)
                    }
                    Switch(
                        checked = notify,
                        onCheckedChange = {
                            notify = it
                            settings.notifications = it
                            if (it) askNotificationPermission()
                            (context.applicationContext as NextApplication).scheduleChecks()
                        },
                        colors = SwitchDefaults.colors(checkedTrackColor = Lime, checkedThumbColor = Ink),
                    )
                }
            }
        }
        item { MenuRow(Icons.Filled.Language, "Website openen", "nextsolutionshq.nl") { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(BuildConfig.SITE_URL))) } }
        item { MenuRow(Icons.Filled.Logout, "Uitloggen", null, danger = true) { confirmLogout = true } }
        item { Text("Versie ${BuildConfig.VERSION_NAME}", color = Faint, fontSize = 12.sp, modifier = Modifier.padding(top = 8.dp)) }
    }
    if (confirmLogout) AlertDialog(
        onDismissRequest = { confirmLogout = false },
        title = { Text("Uitloggen?") },
        text = { Text("Je kunt altijd weer inloggen met Discord.") },
        confirmButton = { Button(onClick = { confirmLogout = false; vm.logout() }) { Text("Uitloggen") } },
        dismissButton = { TextButton(onClick = { confirmLogout = false }) { Text("Annuleren") } },
    )
}

@Composable
private fun MenuRow(icon: ImageVector, title: String, subtitle: String?, danger: Boolean = false, onClick: () -> Unit) {
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

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        if (upcoming.isNotEmpty()) {
            SectionTitle("Jouw afspraken")
            upcoming.forEach { a ->
                Panel {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(a.subject, fontWeight = FontWeight.SemiBold)
                            Text("${dayLabel(a.start)} • ${time(a.start)} - ${time(a.end)}", color = Muted, fontSize = 14.sp)
                            if (a.note.isNotBlank()) Text(a.note, color = Faint, fontSize = 13.sp)
                        }
                        TextButton(onClick = { cancel = a.id }) { Text("Annuleren", color = Danger) }
                    }
                }
            }
        }
        SectionTitle("Afspraak plannen")
        if (!info.enabled || info.slots.isEmpty()) {
            Text("Er zijn op dit moment geen vrije momenten. Open een ticket, dan plannen we samen iets.", color = Muted)
        } else {
            Text("Een (Discord-)call van ${info.duration} minuten. Tijden zijn Nederlandse tijd.", color = Muted, fontSize = 14.sp)
            ChipRow(info.subjects, chosenSubject, { it }) { subject = it }
            ChipRow(days.keys.toList(), chosenDay, { dayLabel(days[it]!!.first()) }) { day = it; slot = null }
            ChipRow(days[chosenDay].orEmpty(), slot, { time(it) }) { slot = it }
            OutlinedTextField(note, { note = it.take(500) }, label = { Text("Waar wil je het over hebben? (optioneel)") }, minLines = 2, modifier = Modifier.fillMaxWidth())
            Button(
                enabled = !busy && slot != null && chosenSubject != null,
                onClick = { busy = true; vm.book(slot!!, chosenSubject!!, note.trim()) { ok -> busy = false; if (ok) { slot = null; note = "" } } },
                modifier = Modifier.fillMaxWidth().height(52.dp),
            ) { Text(if (slot == null) "Kies een tijd" else "Plan op ${dayLabel(slot!!)} om ${time(slot!!)}") }
        }
    }
    cancel?.let { id ->
        AlertDialog(
            onDismissRequest = { cancel = null },
            title = { Text("Afspraak annuleren?") },
            confirmButton = { Button(onClick = { vm.cancelAppointment(id); cancel = null }) { Text("Annuleren") } },
            dismissButton = { TextButton(onClick = { cancel = null }) { Text("Terug") } },
        )
    }
}

@Composable
private fun <T> ChipRow(options: List<T>, selected: T?, label: (T) -> String, onSelect: (T) -> Unit) {
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
        if (files.isEmpty()) item { EmptyState("📂", "Nog geen bestanden", "Bestanden die het team voor je klaarzet (zoals opleveringen) vind je hier.") }
        items(files.sortedByDescending { it.t }, key = { it.id }) { f ->
            Panel(onClick = { download(context, f.id, f.name) }) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text(f.name, fontWeight = FontWeight.SemiBold)
                        Text("${fileSize(f.size)} • ${date(f.t)}", color = Muted, fontSize = 13.sp)
                        f.description?.let { Text(it, color = Faint, fontSize = 13.sp) }
                    }
                    Icon(Icons.Filled.Download, "Downloaden", tint = Lime)
                }
            }
        }
    }
}

private fun download(context: Context, id: String, name: String) {
    val token = (context.applicationContext as NextApplication).tokens.token ?: return
    val safeName = name.replace(Regex("[^A-Za-z0-9._ -]"), "_").take(120).ifBlank { "bestand" }
    val request = DownloadManager.Request(Uri.parse("${BuildConfig.SITE_URL}/klantportaal/bestand/$id"))
        .addRequestHeader("Authorization", "Bearer $token")
        .setTitle(name)
        .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
        .setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, safeName)
    (context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager).enqueue(request)
    Toast.makeText(context, "Downloaden gestart: $name", Toast.LENGTH_SHORT).show()
}
