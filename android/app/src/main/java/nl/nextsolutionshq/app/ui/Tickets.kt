package nl.nextsolutionshq.app.ui

import android.annotation.SuppressLint
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AttachFile
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.History
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.FilledIconButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import kotlinx.coroutines.launch
import nl.nextsolutionshq.app.AppViewModel
import nl.nextsolutionshq.app.BuildConfig
import nl.nextsolutionshq.app.ChatMessage
import nl.nextsolutionshq.app.PickedFile
import nl.nextsolutionshq.app.t
import nl.nextsolutionshq.app.NextApp as NextApplication

@Composable
fun TicketsScreen(vm: AppViewModel, navigate: (Route) -> Unit) {
    Box(Modifier.fillMaxSize()) {
        DataScreen(vm) { d ->
            if (d.tickets.isEmpty()) item { EmptyState("🎫", t("Geen open tickets", "No open tickets"), t("Heb je een vraag of wil je iets laten maken? Open een ticket en we helpen je.", "Got a question or want something made? Open a ticket and we'll help you.")) }
            else d.tickets.forEach { tk ->
                item {
                    Panel(onClick = { navigate(Route.Chat(tk.id, tk.name)) }) {
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text("${tk.emoji} ${tk.name}", fontWeight = FontWeight.SemiBold)
                            Text(tk.department, color = Muted, fontSize = 14.sp)
                            Text(t("Geopend ", "Opened ") + timeAgo(tk.opened) + (tk.claimedBy?.let { t(" • opgepakt door $it", " • handled by $it") } ?: ""), color = Faint, fontSize = 12.sp)
                        }
                    }
                }
            }
            if (d.transcripts.isNotEmpty()) item {
                Panel(onClick = { navigate(Route.Transcripts) }) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Filled.History, null, tint = Lime)
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text(t("Gesloten tickets", "Closed tickets"), fontWeight = FontWeight.SemiBold)
                            Text(t("${d.transcripts.size} gesprekken teruglezen", "Read back ${d.transcripts.size} conversations"), color = Muted, fontSize = 13.sp)
                        }
                    }
                }
            }
        }
        ExtendedFloatingActionButton(
            onClick = { navigate(Route.NewTicket) },
            icon = { Icon(Icons.Filled.Add, null) },
            text = { Text(t("Nieuw ticket", "New ticket")) },
            containerColor = Lime, contentColor = Ink,
            modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
        )
    }
}

// ═══════════════════════════════ Chat (klant en beheer) ═══════════════════════════════
@Composable
fun ChatScreen(vm: AppViewModel, id: String, admin: Boolean) {
    LaunchedEffect(id, admin) { vm.openThread(id, admin) }
    val thread = vm.thread?.takeIf { it.id == id }
    val me = vm.data?.user?.id
    var text by remember { mutableStateOf("") }
    var sending by remember { mutableStateOf(false) }
    val files = remember { mutableStateListOf<PickedFile>() }
    val list = rememberLazyListState()
    val scope = rememberCoroutineScope()
    val pick = rememberLauncherForActivityResult(ActivityResultContracts.GetMultipleContents()) { uris ->
        scope.launch { uris.take(4 - files.size).forEach { uri -> vm.readPicked(uri)?.let { files.add(it) } } }
    }
    LaunchedEffect(thread?.messages?.size) { if ((thread?.messages?.size ?: 0) > 0) list.scrollToItem(0) }

    Column(Modifier.fillMaxSize().imePadding()) {
        Box(Modifier.weight(1f).fillMaxWidth()) {
            when {
                thread == null && vm.threadError != null -> Column(Modifier.padding(16.dp)) { ErrorBox(vm.threadError!!) { vm.openThread(id, admin) } }
                thread == null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = Lime) }
                thread.messages.isEmpty() -> EmptyState("💬", t("Nog geen berichten", "No messages yet"), t("Stel hieronder je vraag; het team ziet je bericht direct in Discord.", "Ask your question below; the team sees it in Discord right away."))
                else -> LazyColumn(
                    state = list, reverseLayout = true, modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    items(thread.messages.sortedByDescending { it.t }, key = { it.id }) { m ->
                        val mine = if (admin) m.via == "team" || (m.author.id == me && m.via != "klant") else m.author.id == me || m.via == "klant"
                        Bubble(m, mine)
                    }
                }
            }
        }
        if (files.isNotEmpty()) Row(Modifier.fillMaxWidth().background(Surface1).horizontalScroll(rememberScrollState()).padding(horizontal = 12.dp, vertical = 6.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            files.forEach { f ->
                Row(Modifier.clip(RoundedCornerShape(12.dp)).background(Surface2).padding(start = 10.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text("📎 ${f.name.take(24)} (${fileSize(f.bytes.size.toLong())})", fontSize = 12.sp)
                    IconButton(onClick = { files.remove(f) }, modifier = Modifier.size(32.dp)) { Icon(Icons.Filled.Close, t("Verwijderen", "Remove"), Modifier.size(16.dp)) }
                }
            }
        }
        Row(Modifier.fillMaxWidth().background(Surface1).padding(horizontal = 8.dp, vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = { pick.launch("*/*") }, enabled = files.size < 4 && !sending) { Icon(Icons.Filled.AttachFile, t("Bijlage toevoegen", "Add attachment"), tint = Muted) }
            OutlinedTextField(
                value = text, onValueChange = { text = it.take(1900) },
                placeholder = { Text(t("Typ een bericht...", "Type a message...")) },
                modifier = Modifier.weight(1f), maxLines = 5,
                keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Sentences),
                shape = RoundedCornerShape(18.dp),
            )
            Spacer(Modifier.width(8.dp))
            FilledIconButton(
                enabled = (text.isNotBlank() || files.isNotEmpty()) && !sending,
                onClick = { sending = true; vm.sendMessage(id, text.trim(), files.toList(), admin) { ok -> sending = false; if (ok) { text = ""; files.clear() } } },
                colors = IconButtonDefaults.filledIconButtonColors(containerColor = Lime, contentColor = Ink),
            ) {
                if (sending) CircularProgressIndicator(Modifier.size(18.dp), strokeWidth = 2.dp, color = Ink)
                else Icon(Icons.AutoMirrored.Filled.Send, contentDescription = t("Versturen", "Send"))
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
        Text(t("Vertel waar we je mee kunnen helpen. Het team ziet je ticket direct in Discord en je volgt het gesprek hier in de app.", "Tell us how we can help. The team sees your ticket in Discord right away and you follow the conversation here in the app."), color = Muted)
        if (departments.isEmpty()) {
            ErrorBox(t("De afdelingen konden niet geladen worden. Probeer het later opnieuw.", "The departments could not be loaded. Try again later.")) { vm.refresh() }
            return@Column
        }
        ExposedDropdownMenuBox(expanded = open, onExpandedChange = { open = it }) {
            OutlinedTextField(
                value = dept?.let { "${it.emoji} ${it.title}" } ?: "", onValueChange = {}, readOnly = true,
                label = { Text(t("Afdeling", "Department")) },
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
        OutlinedTextField(subject, { subject = it.take(100) }, label = { Text(t("Onderwerp", "Subject")) }, placeholder = { Text(dept?.subjectExample ?: "") }, singleLine = true, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(
            details, { details = it.take(1500) }, label = { Text(dept?.detailsLabel?.ifBlank { null } ?: t("Omschrijving", "Description")) },
            placeholder = { Text(dept?.detailsExample ?: "") }, minLines = 5, modifier = Modifier.fillMaxWidth(),
            supportingText = { Text("${details.length}/1500 • " + t("minimaal 10 tekens", "at least 10 characters")) },
        )
        Button(
            enabled = !busy && dept != null && subject.trim().length >= 3 && details.trim().length >= 10,
            onClick = { busy = true; vm.newTicket(dept!!.id, subject.trim(), details.trim()) { ok -> busy = false; if (ok) done() } },
            modifier = Modifier.fillMaxWidth().height(52.dp),
        ) { Text(if (busy) t("Bezig...", "Working...") else t("Ticket openen", "Open ticket")) }
    }
}

// ═══════════════════════════════ Gesloten tickets ═══════════════════════════════
@Composable
fun TranscriptsScreen(vm: AppViewModel, navigate: (Route) -> Unit) = DataScreen(vm) { d ->
    if (d.transcripts.isEmpty()) item { EmptyState("🗂️", t("Nog geen gesloten tickets", "No closed tickets yet"), t("Als een ticket gesloten wordt, kun je het gesprek hier teruglezen.", "When a ticket is closed, you can read the conversation back here.")) }
    d.transcripts.sortedByDescending { it.closed }.forEach { tr ->
        item {
            Panel(onClick = { navigate(Route.Transcript(tr.id, tr.name)) }) {
                Column {
                    Text("${tr.emoji} ${tr.name}", fontWeight = FontWeight.SemiBold)
                    Text(tr.department, color = Muted, fontSize = 14.sp)
                    Text(t("Gesloten ", "Closed ") + date(tr.closed) + " • " + t("${tr.messages} berichten", "${tr.messages} messages"), color = Faint, fontSize = 12.sp)
                }
            }
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun TranscriptScreen(id: String) {
    val context = LocalContext.current
    val token = (context.applicationContext as NextApplication).tokens.token
    var loading by remember { mutableStateOf(true) }
    Box(Modifier.fillMaxSize()) {
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { ctx ->
                WebView(ctx).apply {
                    setBackgroundColor(android.graphics.Color.parseColor("#0A0C10"))
                    settings.javaScriptEnabled = false
                    settings.allowFileAccess = false
                    webViewClient = object : WebViewClient() {
                        override fun onPageFinished(view: WebView?, url: String?) { loading = false }
                    }
                    loadUrl("${BuildConfig.SITE_URL}/klantportaal/transcript/$id", mapOf("Authorization" to "Bearer ${token.orEmpty()}"))
                }
            },
        )
        if (loading) Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = Lime) }
    }
}
