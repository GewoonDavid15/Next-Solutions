package nl.nextsolutionshq.app.ui

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.material3.Checkbox
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.RadioButtonUnchecked
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import nl.nextsolutionshq.app.AppViewModel
import nl.nextsolutionshq.app.MeldingenWorker
import nl.nextsolutionshq.app.Offer
import nl.nextsolutionshq.app.PortalData
import nl.nextsolutionshq.app.Project
import nl.nextsolutionshq.app.Target
import nl.nextsolutionshq.app.t

/** Pull-to-refresh list with loading and error states around the portal data. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DataScreen(vm: AppViewModel, content: LazyListScope.(PortalData) -> Unit) {
    val d = vm.data
    PullToRefreshBox(isRefreshing = vm.loading && d != null, onRefresh = { vm.refresh() }, modifier = Modifier.fillMaxSize()) {
        when {
            d == null && vm.error != null -> Column(Modifier.padding(16.dp)) { ErrorBox(vm.error!!) { vm.refresh() } }
            d == null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = Lime) }
            else -> LazyColumn(
                Modifier.fillMaxSize(),
                contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 4.dp, bottom = 96.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                if (vm.error != null) item { ErrorBox(vm.error!!) { vm.refresh() } }
                content(d)
            }
        }
    }
}

// ═══════════════════════════════ Overzicht ═══════════════════════════════
@Composable
fun HomeScreen(vm: AppViewModel, navigate: (Route) -> Unit, switchTab: (Route) -> Unit) {
    val context = LocalContext.current
    DataScreen(vm) { d ->
        val active = d.projects.filter { it.percentage < 100 }
        vm.update?.let { (version, url) ->
            item {
                Panel(onClick = { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url))) }) {
                    Column {
                        Text(t("Nieuwe versie beschikbaar: $version", "New version available: $version"), fontWeight = FontWeight.SemiBold, color = Lime)
                        Text(t("Tik om te downloaden en te installeren.", "Tap to download and install."), color = Muted, fontSize = 14.sp)
                    }
                }
            }
        }
        item {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 4.dp)) {
                Avatar(d.user.avatar, d.user.name, 52)
                Spacer(Modifier.width(14.dp))
                Column {
                    Text(t("Welkom terug", "Welcome back"), color = Muted, fontSize = 13.sp)
                    Text(d.user.name, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                }
            }
        }
        d.surveys.firstOrNull()?.let { s -> item { SurveyCard(vm, s.id, s.project) { askReview -> if (askReview) navigate(Route.Review) } } }
        if (d.owner) item {
            Panel(onClick = { navigate(Route.Admin) }) {
                Column {
                    Text("🛠️ " + t("Beheer-modus", "Admin mode"), fontWeight = FontWeight.SemiBold, color = Lime)
                    Text(t("Aanvragen, alle tickets en offertes van je klanten.", "Requests, all tickets and quotes of your clients."), color = Muted, fontSize = 14.sp)
                }
            }
        }
        d.profile?.level?.let { lvl ->
            item {
                Panel(onClick = { switchTab(Route.More) }) {
                    Column {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(t("Niveau", "Level") + " ${lvl.level} • ${lvl.title}", fontWeight = FontWeight.SemiBold)
                            Text("${lvl.xp} XP", color = Muted, fontSize = 13.sp)
                        }
                        Spacer(Modifier.height(8.dp))
                        ProgressBar(lvl.percent)
                    }
                }
            }
        }
        item {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Kpi("${active.size}", t("Actieve projecten", "Active projects"), Modifier.weight(1f)) { navigate(Route.Projects) }
                    Kpi("${d.tickets.size}", t("Open tickets", "Open tickets"), Modifier.weight(1f)) { switchTab(Route.Tickets) }
                }
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Kpi("${d.offers.count { it.code == "open" }}", t("Open offertes", "Open quotes"), Modifier.weight(1f)) { switchTab(Route.Offers) }
                    Kpi("${d.unread}", t("Nieuwe meldingen", "New notifications"), Modifier.weight(1f)) { navigate(Route.Notifications) }
                }
            }
        }
        val waiting = d.social?.posts?.count { it.status == "ter-goedkeuring" } ?: 0
        if (waiting > 0) item {
            Panel(onClick = { switchTab(Route.Social) }) {
                Column {
                    Text("📱 " + t("$waiting post(s) wachten op je akkoord", "$waiting post(s) waiting for your approval"), fontWeight = FontWeight.SemiBold)
                    Text(t("Bekijk ze en keur goed of vraag een aanpassing.", "Review them and approve or ask for a change."), color = Muted, fontSize = 14.sp)
                }
            }
        }
        if (active.isNotEmpty()) {
            item { SectionTitle(t("Lopende projecten", "Projects in progress")) }
            active.forEach { p -> item { ProjectCard(p) { navigate(Route.ProjectDetail(p.id)) } } }
        }
        if (d.notifications.isNotEmpty()) {
            item { SectionTitle(t("Laatste meldingen", "Latest notifications")) }
            d.notifications.take(3).forEach { n ->
                item {
                    Panel(onClick = { navigate(Route.Notifications) }) {
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                if (!n.read) { Box(Modifier.size(8.dp).clip(CircleShape).background(Lime)); Spacer(Modifier.width(8.dp)) }
                                Text(n.title, fontWeight = FontWeight.SemiBold, maxLines = 1)
                            }
                            if (n.text.isNotBlank()) Text(n.text, color = Muted, fontSize = 14.sp, maxLines = 2)
                            Text(timeAgo(n.t), color = Faint, fontSize = 12.sp)
                        }
                    }
                }
            }
        }
        if (d.canReview) item {
            Panel(onClick = { navigate(Route.Review) }) {
                Column {
                    Text("⭐ " + t("Tevreden over ons werk?", "Happy with our work?"), fontWeight = FontWeight.SemiBold)
                    Text(t("Laat een review achter, dat helpt ons enorm.", "Leave a review, it helps us a lot."), color = Muted, fontSize = 14.sp)
                }
            }
        }
        if (active.isEmpty() && d.tickets.isEmpty()) item {
            Panel {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(t("Nieuw project starten?", "Start a new project?"), fontWeight = FontWeight.SemiBold)
                    Text(t("Open een ticket en vertel wat je nodig hebt. We reageren meestal dezelfde dag.", "Open a ticket and tell us what you need. We usually reply the same day."), color = Muted)
                    Button(onClick = { navigate(Route.NewTicket) }) { Text(t("Ticket openen", "Open a ticket")) }
                }
            }
        }
    }
}

/** "How satisfied are you, 1-10?" after a project was delivered. */
@Composable
private fun SurveyCard(vm: AppViewModel, id: String, project: String, onDone: (Boolean) -> Unit) {
    var score by remember { mutableStateOf<Int?>(null) }
    var note by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    Panel {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("😊 " + t("Hoe tevreden ben je over $project?", "How satisfied are you with $project?"), fontWeight = FontWeight.SemiBold)
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                listOf(1..5, 6..10).forEach { range ->
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        range.forEach { n ->
                            val on = score == n
                            Box(
                                Modifier.weight(1f).height(40.dp).clip(RoundedCornerShape(10.dp)).background(if (on) Lime else Surface2).clickable { score = n },
                                contentAlignment = Alignment.Center,
                            ) { Text("$n", color = if (on) Ink else Color.White, fontWeight = FontWeight.SemiBold) }
                        }
                    }
                }
            }
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(t("Helemaal niet", "Not at all"), color = Faint, fontSize = 12.sp); Text(t("Heel erg", "Very"), color = Faint, fontSize = 12.sp)
            }
            score?.let { s ->
                if (s < 9) OutlinedTextField(note, { note = it.take(1000) }, placeholder = { Text(t("Wat kan er beter? (optioneel)", "What could be better? (optional)")) }, minLines = 2, modifier = Modifier.fillMaxWidth())
                Button(enabled = !busy, onClick = { busy = true; vm.answerSurvey(id, s, note.trim()) { r -> busy = false; if (r != null) onDone(r) } }) { Text(t("Versturen", "Send")) }
            }
        }
    }
}

@Composable
private fun Kpi(value: String, label: String, modifier: Modifier, onClick: () -> Unit) {
    Panel(modifier, onClick = onClick) {
        Column {
            Text(value, fontSize = 28.sp, fontWeight = FontWeight.Bold)
            Text(label, color = Muted, fontSize = 13.sp)
        }
    }
}

// ═══════════════════════════════ Projecten ═══════════════════════════════
@Composable
fun ProjectCard(p: Project, onClick: () -> Unit) {
    Panel(onClick = onClick) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text(p.name, fontWeight = FontWeight.SemiBold, fontSize = 17.sp, modifier = Modifier.weight(1f))
                Text("${p.percentage}%", color = Lime, fontWeight = FontWeight.Bold)
            }
            Text("${p.phaseEmoji} ${p.phaseName}", color = Muted, fontSize = 14.sp)
            ProgressBar(p.percentage)
            if (p.note.isNotBlank()) Text(p.note, color = Muted, fontSize = 14.sp, maxLines = 2)
            p.deadline?.let { Text(t("Deadline: ", "Deadline: ") + date(it), color = Faint, fontSize = 12.sp) }
        }
    }
}

@Composable
fun ProjectsScreen(vm: AppViewModel, navigate: (Route) -> Unit) = DataScreen(vm) { d ->
    if (d.projects.isEmpty()) item {
        EmptyState("📁", t("Nog geen projecten", "No projects yet"), t("Zodra we aan je project beginnen, volg je hier de voortgang.", "Once we start on your project, you follow its progress here."), t("Ticket openen", "Open a ticket")) { navigate(Route.NewTicket) }
    }
    else d.projects.sortedBy { it.percentage >= 100 }.forEach { p -> item { ProjectCard(p) { navigate(Route.ProjectDetail(p.id)) } } }
}

@Composable
fun ProjectDetailScreen(vm: AppViewModel, id: String) {
    var dialog by remember { mutableStateOf<Boolean?>(null) }
    DataScreen(vm) { d ->
        val p = d.projects.find { it.id == id }
        if (p == null) { item { EmptyState("🔍", t("Project niet gevonden", "Project not found"), t("Misschien is het afgerond of verplaatst.", "It may have been completed or moved.")) }; return@DataScreen }
        item {
            Panel {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(p.name, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("${p.phaseEmoji} ${p.phaseName}", color = Muted)
                        Text("${p.percentage}%", color = Lime, fontWeight = FontWeight.Bold)
                    }
                    ProgressBar(p.percentage)
                    if (p.note.isNotBlank()) Text(p.note)
                    p.deadline?.let { KeyValue("Deadline", date(it)) }
                    p.updated?.let { KeyValue(t("Laatst bijgewerkt", "Last updated"), timeAgo(it)) }
                }
            }
        }
        if (p.phases.isNotEmpty()) {
            item { SectionTitle(t("Fases", "Phases")) }
            item {
                Panel {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        p.phases.forEach { f ->
                            val done = f.nr < p.phase || p.percentage >= 100
                            val now = f.nr == p.phase && p.percentage < 100
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(if (done) Icons.Filled.CheckCircle else Icons.Filled.RadioButtonUnchecked, null, tint = if (done || now) Lime else Faint, modifier = Modifier.size(20.dp))
                                Spacer(Modifier.width(10.dp))
                                Text("${f.emoji} ${f.name}", color = if (now) Color.White else if (done) Muted else Faint, fontWeight = if (now) FontWeight.SemiBold else FontWeight.Normal)
                                if (now) { Spacer(Modifier.width(8.dp)); Pill(t("Nu", "Now")) }
                            }
                        }
                    }
                }
            }
        }
        if (p.percentage < 100) item {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Button(onClick = { dialog = true }, modifier = Modifier.weight(1f)) { Text(t("Akkoord", "Approve")) }
                OutlinedButton(onClick = { dialog = false }, modifier = Modifier.weight(1f)) { Text(t("Revisie vragen", "Ask for changes")) }
            }
        }
        if (p.history.isNotEmpty()) {
            item { SectionTitle("Updates") }
            p.history.sortedByDescending { it.t }.take(20).forEach { h ->
                item {
                    Panel {
                        Column {
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(h.phaseName, fontWeight = FontWeight.SemiBold)
                                Text("${h.percentage}%", color = Lime)
                            }
                            if (h.note.isNotBlank()) Text(h.note, color = Muted, fontSize = 14.sp)
                            Text(dateTime(h.t), color = Faint, fontSize = 12.sp)
                        }
                    }
                }
            }
        }
    }
    dialog?.let { approve ->
        TextDialog(
            title = if (approve) t("Akkoord geven", "Approve") else t("Revisie vragen", "Ask for changes"),
            intro = if (approve) t("Je laat het team weten dat je tevreden bent met deze fase.", "You let the team know you are happy with this phase.") else t("Beschrijf kort wat er anders moet.", "Briefly describe what should change."),
            placeholder = if (approve) t("Opmerking (optioneel)", "Comment (optional)") else t("Wat moet er anders?", "What should change?"),
            minLength = if (approve) 0 else 5,
            onDismiss = { dialog = null },
        ) { text, done -> vm.projectFeedback(id, approve, text) { ok -> done(); if (ok) dialog = null } }
    }
}

/** Dialog with a text field and a send button (feedback, change requests). */
@Composable
fun TextDialog(title: String, intro: String, placeholder: String, minLength: Int, onDismiss: () -> Unit, onSend: (String, () -> Unit) -> Unit) {
    var text by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(intro, color = Muted)
                OutlinedTextField(text, { text = it.take(1500) }, placeholder = { Text(placeholder) }, minLines = 3, modifier = Modifier.fillMaxWidth())
            }
        },
        confirmButton = { Button(enabled = !busy && text.trim().length >= minLength, onClick = { busy = true; onSend(text.trim()) { busy = false } }) { Text(t("Versturen", "Send")) } },
        dismissButton = { TextButton(onClick = onDismiss) { Text(t("Annuleren", "Cancel")) } },
    )
}

// ═══════════════════════════════ Offertes ═══════════════════════════════
@Composable
fun OffersScreen(vm: AppViewModel) {
    var confirm by remember { mutableStateOf<Offer?>(null) }
    DataScreen(vm) { d ->
        if (d.offers.isEmpty()) item { EmptyState("📄", t("Nog geen offertes", "No quotes yet"), t("Offertes die we voor je maken, verschijnen hier. Je kunt ze dan meteen accepteren.", "Quotes we make for you appear here, and you can accept them right away.")) }
        else d.offers.sortedByDescending { it.t }.forEach { o ->
            item {
                Panel {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            Text(o.number, color = Muted, fontSize = 13.sp)
                            Pill("${o.statusEmoji} ${o.status}", if (o.paid) Success else if (o.code == "open") Lime else Muted)
                        }
                        Text(o.title, fontWeight = FontWeight.SemiBold, fontSize = 17.sp)
                        Text(o.price, color = Lime, fontWeight = FontWeight.Bold, fontSize = 20.sp)
                        if (o.items.isNotEmpty()) Column { o.items.forEach { Text("• $it", color = Muted, fontSize = 14.sp) } }
                        o.deliveryTime?.let { KeyValue(t("Levertijd", "Delivery time"), it) }
                        if (o.code == "open") o.validUntil?.let { KeyValue(t("Geldig tot", "Valid until"), date(it)) }
                        o.paymentInstruction?.let {
                            Box(Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(Surface2).padding(12.dp)) {
                                Column { Text(t("Betalen", "Payment"), fontWeight = FontWeight.SemiBold); Text(it, color = Muted, fontSize = 14.sp) }
                            }
                        }
                        o.signedBy?.let { name -> Text("✍️ " + t("Digitaal ondertekend door $name", "Digitally signed by $name") + (o.signedAt?.let { " • " + date(it) } ?: ""), color = Faint, fontSize = 12.sp) }
                        if (o.code == "open" && o.id != null) Button(onClick = { confirm = o }, modifier = Modifier.fillMaxWidth()) { Text(t("Akkoord geven", "Accept")) }
                    }
                }
            }
        }
    }
    confirm?.let { o -> SignDialog(vm, o) { confirm = null } }
}

/** Digital signature: full name + accepting the terms and conditions (the version is stored with it). */
@Composable
private fun SignDialog(vm: AppViewModel, o: Offer, onDismiss: () -> Unit) {
    val context = LocalContext.current
    var name by remember { mutableStateOf(vm.data?.user?.name.orEmpty()) }
    var agreed by remember { mutableStateOf(false) }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(t("Offerte ondertekenen", "Sign the quote")) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(t("${o.number} • ${o.title} • ${o.price}. Daarna krijg je de betaalgegevens in je ticket.", "${o.number} • ${o.title} • ${o.price}. You'll then get the payment details in your ticket."), color = Muted, fontSize = 14.sp)
                OutlinedTextField(name, { name = it.take(80) }, label = { Text(t("Je volledige naam", "Your full name")) }, singleLine = true, modifier = Modifier.fillMaxWidth())
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.clickable { agreed = !agreed }) {
                    Checkbox(checked = agreed, onCheckedChange = { agreed = it })
                    Text(t("Ik ga akkoord met deze offerte en de algemene voorwaarden.", "I accept this quote and the terms and conditions."), fontSize = 14.sp)
                }
                Text(t("Voorwaarden lezen", "Read the terms"), color = Lime, fontSize = 13.sp, modifier = Modifier.clickable {
                    context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("${nl.nextsolutionshq.app.BuildConfig.SITE_URL}${if (nl.nextsolutionshq.app.Lang.en) "/en" else ""}/voorwaarden")))
                })
            }
        },
        confirmButton = { Button(enabled = name.trim().length >= 2 && agreed, onClick = { o.id?.let { vm.acceptOffer(it, name.trim()) }; onDismiss() }) { Text(t("Ondertekenen", "Sign")) } },
        dismissButton = { TextButton(onClick = onDismiss) { Text(t("Annuleren", "Cancel")) } },
    )
}

// ═══════════════════════════════ Meldingen ═══════════════════════════════
@Composable
fun NotificationsScreen(vm: AppViewModel, open: (Target?, String) -> Unit) = DataScreen(vm) { d ->
    if (d.notifications.isEmpty()) item { EmptyState("🔔", t("Geen meldingen", "No notifications"), t("Hier zie je antwoorden op je tickets, projectupdates en offertes.", "Here you see replies to your tickets, project updates and quotes.")) }
    else {
        if (d.unread > 0) item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) { TextButton(onClick = { vm.markAllRead() }) { Text(t("Alles gelezen", "Mark all as read")) } }
        }
        d.notifications.forEach { n ->
            item {
                Panel(onClick = { vm.markRead(n.id); open(n.target, MeldingenWorker.tabFor(n.link)) }) {
                    Row {
                        Box(Modifier.padding(top = 6.dp).size(8.dp).clip(CircleShape).background(if (n.read) Color.Transparent else Lime))
                        Spacer(Modifier.width(10.dp))
                        Column {
                            Text(n.title, fontWeight = if (n.read) FontWeight.Normal else FontWeight.SemiBold)
                            if (n.text.isNotBlank()) Text(n.text, color = Muted, fontSize = 14.sp)
                            Text(timeAgo(n.t), color = Faint, fontSize = 12.sp)
                        }
                    }
                }
            }
        }
    }
}
