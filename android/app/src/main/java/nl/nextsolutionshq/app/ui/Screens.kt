package nl.nextsolutionshq.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.RadioButtonUnchecked
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExtendedFloatingActionButton
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import nl.nextsolutionshq.app.AppViewModel
import nl.nextsolutionshq.app.Offer
import nl.nextsolutionshq.app.PortalData
import nl.nextsolutionshq.app.Project

/** Pull-to-refresh list with loading and error states around the portal data. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DataScreen(vm: AppViewModel, content: LazyListScope.(PortalData) -> Unit) {
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
fun HomeScreen(vm: AppViewModel, navigate: (Route) -> Unit, switchTab: (Route) -> Unit) = DataScreen(vm) { d ->
    val active = d.projects.filter { it.percentage < 100 }
    run {
        item {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 4.dp)) {
                Avatar(d.user.avatar, d.user.name, 52)
                Spacer(Modifier.width(14.dp))
                Column {
                    Text("Welkom terug", color = Muted, fontSize = 13.sp)
                    Text(d.user.name, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                }
            }
        }
        d.profile?.level?.let { lvl ->
            item {
                Panel(onClick = { switchTab(Route.More) }) {
                    Column {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Niveau ${lvl.level} • ${lvl.title}", fontWeight = FontWeight.SemiBold)
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
                    Kpi("${active.size}", "Actieve projecten", Modifier.weight(1f)) { switchTab(Route.Projects) }
                    Kpi("${d.tickets.size}", "Open tickets", Modifier.weight(1f)) { switchTab(Route.Tickets) }
                }
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Kpi("${d.offers.count { it.code == "open" }}", "Open offertes", Modifier.weight(1f)) { switchTab(Route.Offers) }
                    Kpi("${d.unread}", "Nieuwe meldingen", Modifier.weight(1f)) { navigate(Route.Notifications) }
                }
            }
        }
        if (active.isNotEmpty()) {
            item { SectionTitle("Lopende projecten") }
            active.forEach { p -> item { ProjectCard(p) { navigate(Route.ProjectDetail(p.id)) } } }
        }
        if (d.notifications.isNotEmpty()) {
            item { SectionTitle("Laatste meldingen") }
            d.notifications.take(3).forEach { n ->
                item {
                    Panel(onClick = { navigate(Route.Notifications) }) {
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                if (!n.read) Box(Modifier.size(8.dp).clip(CircleShape).background(Lime))
                                if (!n.read) Spacer(Modifier.width(8.dp))
                                Text(n.title, fontWeight = FontWeight.SemiBold, maxLines = 1)
                            }
                            if (n.text.isNotBlank()) Text(n.text, color = Muted, fontSize = 14.sp, maxLines = 2)
                            Text(timeAgo(n.t), color = Faint, fontSize = 12.sp)
                        }
                    }
                }
            }
        }
        if (active.isEmpty() && d.tickets.isEmpty()) {
            item {
                Panel {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text("Nieuw project starten?", fontWeight = FontWeight.SemiBold)
                        Text("Open een ticket en vertel wat je nodig hebt. We reageren meestal dezelfde dag.", color = Muted)
                        Button(onClick = { navigate(Route.NewTicket) }) { Text("Ticket openen") }
                    }
                }
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
            p.deadline?.let { Text("Deadline: ${date(it)}", color = Faint, fontSize = 12.sp) }
        }
    }
}

@Composable
fun ProjectsScreen(vm: AppViewModel, navigate: (Route) -> Unit) = DataScreen(vm) { d ->
    if (d.projects.isEmpty()) item { EmptyState("📁", "Nog geen projecten", "Zodra we aan je project beginnen, volg je hier de voortgang.", "Ticket openen") { navigate(Route.NewTicket) } }
    else d.projects.sortedBy { it.percentage >= 100 }.forEach { p -> item { ProjectCard(p) { navigate(Route.ProjectDetail(p.id)) } } }
}

@Composable
fun ProjectDetailScreen(vm: AppViewModel, id: String) {
    var dialog by remember { mutableStateOf<Boolean?>(null) } // true = akkoord, false = revisie
    DataScreen(vm) { d ->
        val p = d.projects.find { it.id == id }
        if (p == null) { item { EmptyState("🔍", "Project niet gevonden", "Misschien is het afgerond of verplaatst.") }; return@DataScreen }
        run {
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
                        p.updated?.let { KeyValue("Laatst bijgewerkt", timeAgo(it)) }
                    }
                }
            }
            if (p.phases.isNotEmpty()) {
                item { SectionTitle("Fases") }
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
                                    if (now) { Spacer(Modifier.width(8.dp)); Pill("Nu") }
                                }
                            }
                        }
                    }
                }
            }
            if (p.percentage < 100) {
                item {
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Button(onClick = { dialog = true }, modifier = Modifier.weight(1f)) { Text("Akkoord") }
                        OutlinedButton(onClick = { dialog = false }, modifier = Modifier.weight(1f)) { Text("Revisie vragen") }
                    }
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
    }
    dialog?.let { approve ->
        FeedbackDialog(approve, onDismiss = { dialog = null }) { text, done -> vm.projectFeedback(id, approve, text) { ok -> done(); if (ok) dialog = null } }
    }
}

@Composable
private fun FeedbackDialog(approve: Boolean, onDismiss: () -> Unit, onSend: (String, () -> Unit) -> Unit) {
    var text by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (approve) "Akkoord geven" else "Revisie vragen") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(if (approve) "Je laat het team weten dat je tevreden bent met deze fase." else "Beschrijf kort wat er anders moet.", color = Muted)
                OutlinedTextField(text, { text = it.take(1500) }, placeholder = { Text(if (approve) "Opmerking (optioneel)" else "Wat moet er anders?") }, minLines = 3, modifier = Modifier.fillMaxWidth())
            }
        },
        confirmButton = {
            Button(enabled = !busy && (approve || text.trim().length >= 5), onClick = { busy = true; onSend(text.trim()) { busy = false } }) { Text("Versturen") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Annuleren") } },
    )
}

// ═══════════════════════════════ Tickets ═══════════════════════════════
@Composable
fun TicketsScreen(vm: AppViewModel, navigate: (Route) -> Unit) {
    Box(Modifier.fillMaxSize()) {
        DataScreen(vm) { d ->
            if (d.tickets.isEmpty()) item { EmptyState("🎫", "Geen open tickets", "Heb je een vraag of wil je iets laten maken? Open een ticket en we helpen je.") }
            else d.tickets.forEach { t ->
                item {
                    Panel(onClick = { navigate(Route.Chat(t.id, t.name)) }) {
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text("${t.emoji} ${t.name}", fontWeight = FontWeight.SemiBold)
                            Text(t.department, color = Muted, fontSize = 14.sp)
                            Text("Geopend ${timeAgo(t.opened)}${t.claimedBy?.let { " • opgepakt door $it" } ?: ""}", color = Faint, fontSize = 12.sp)
                        }
                    }
                }
            }
        }
        ExtendedFloatingActionButton(
            onClick = { navigate(Route.NewTicket) },
            icon = { Icon(Icons.Filled.Add, null) },
            text = { Text("Nieuw ticket") },
            containerColor = Lime, contentColor = Ink,
            modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
        )
    }
}

// ═══════════════════════════════ Offertes ═══════════════════════════════
@Composable
fun OffersScreen(vm: AppViewModel) {
    var confirm by remember { mutableStateOf<Offer?>(null) }
    DataScreen(vm) { d ->
        if (d.offers.isEmpty()) item { EmptyState("📄", "Nog geen offertes", "Offertes die we voor je maken, verschijnen hier. Je kunt ze dan meteen accepteren.") }
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
                        o.deliveryTime?.let { KeyValue("Levertijd", it) }
                        if (o.code == "open") o.validUntil?.let { KeyValue("Geldig tot", date(it)) }
                        o.paymentInstruction?.let {
                            Box(Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(Surface2).padding(12.dp)) {
                                Column { Text("Betalen", fontWeight = FontWeight.SemiBold); Text(it, color = Muted, fontSize = 14.sp) }
                            }
                        }
                        if (o.code == "open" && o.id != null) Button(onClick = { confirm = o }, modifier = Modifier.fillMaxWidth()) { Text("Akkoord geven") }
                    }
                }
            }
        }
    }
    confirm?.let { o ->
        AlertDialog(
            onDismissRequest = { confirm = null },
            title = { Text("Offerte accepteren?") },
            text = { Text("Je gaat akkoord met ${o.number} (${o.title}) voor ${o.price}. Daarna krijg je de betaalgegevens in je ticket.") },
            confirmButton = { Button(onClick = { o.id?.let(vm::acceptOffer); confirm = null }) { Text("Akkoord") } },
            dismissButton = { TextButton(onClick = { confirm = null }) { Text("Annuleren") } },
        )
    }
}

// ═══════════════════════════════ Meldingen ═══════════════════════════════
@Composable
fun NotificationsScreen(vm: AppViewModel, openTab: (String) -> Unit) = DataScreen(vm) { d ->
    if (d.notifications.isEmpty()) item { EmptyState("🔔", "Geen meldingen", "Hier zie je antwoorden op je tickets, projectupdates en offertes.") }
    else run {
        if (d.unread > 0) item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) { TextButton(onClick = { vm.markAllRead() }) { Text("Alles gelezen") } }
        }
        d.notifications.forEach { n ->
            item {
                Panel(onClick = { vm.markRead(n); openTab(nl.nextsolutionshq.app.MeldingenWorker.tabFor(n.link)) }) {
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
