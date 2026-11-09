package nl.nextsolutionshq.app.ui

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ReceiptLong
import androidx.compose.material.icons.filled.FolderOpen
import androidx.compose.material.icons.filled.Inbox
import androidx.compose.material.icons.filled.SupportAgent
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import nl.nextsolutionshq.app.AdminLead
import nl.nextsolutionshq.app.AdminOffer
import nl.nextsolutionshq.app.AppViewModel
import nl.nextsolutionshq.app.t

private val phases get() = listOf(
    "nieuw" to t("Nieuw", "New"), "gesprek" to t("In gesprek", "Talking"), "offerte" to t("Offerte", "Quote"),
    "betaald" to t("Betaald", "Paid"), "afgerond" to t("Afgerond", "Done"), "afgewezen" to t("Afgewezen", "Rejected"),
)
private fun phaseName(id: String) = phases.find { it.first == id }?.second ?: id

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AdminList(vm: AppViewModel, ready: Boolean, content: LazyListScope.() -> Unit) {
    LaunchedEffect(Unit) { vm.loadAdmin() }
    var refreshing by remember { mutableStateOf(false) }
    PullToRefreshBox(isRefreshing = refreshing && ready, onRefresh = { vm.loadAdmin() }, modifier = Modifier.fillMaxSize()) {
        if (!ready) Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = Lime) }
        else LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp), content = content)
    }
}

@Composable
fun AdminScreen(vm: AppViewModel, navigate: (Route) -> Unit) {
    val context = LocalContext.current
    AdminList(vm, vm.adminTickets != null) {
        vm.adminStats?.let { s ->
            item { SectionTitle(t("Afgelopen 7 dagen", "Last 7 days")) }
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Stat("${s.visits}", t("Bezoeken", "Visits"), Modifier.weight(1f))
                    Stat("${s.requests}", t("Aanvragen", "Requests"), Modifier.weight(1f))
                    Stat("${s.paid}", t("Betaald", "Paid"), Modifier.weight(1f))
                }
            }
        }
        val newLeads = vm.adminLeads?.count { it.phase == "nieuw" } ?: 0
        val waiting = vm.adminTickets?.count { it.lastFrom == "klant" } ?: 0
        item { MenuRow(Icons.Filled.Inbox, t("Aanvragen", "Requests"), if (newLeads > 0) t("$newLeads nieuw", "$newLeads new") else t("Pijplijn bekijken", "View pipeline")) { navigate(Route.AdminLeads) } }
        item { MenuRow(Icons.Filled.SupportAgent, t("Alle tickets", "All tickets"), t("${vm.adminTickets?.size ?: 0} open", "${vm.adminTickets?.size ?: 0} open") + if (waiting > 0) t(" • $waiting wachten op antwoord", " • $waiting waiting for a reply") else "") { navigate(Route.AdminTickets) } }
        item { MenuRow(Icons.Filled.FolderOpen, t("Projecten bijwerken", "Update projects"), t("Fase, percentage en notitie", "Phase, percentage and note")) { navigate(Route.AdminProjects) } }
        item { MenuRow(Icons.AutoMirrored.Filled.ReceiptLong, t("Alle offertes", "All quotes"), t("${vm.adminOffers?.count { it.status == "akkoord" } ?: 0} wachten op betaling", "${vm.adminOffers?.count { it.status == "akkoord" } ?: 0} awaiting payment")) { navigate(Route.AdminOffers) } }
        item {
            OutlinedButton(onClick = { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://nextsolutionshq.nl/dashboard"))) }, modifier = Modifier.fillMaxWidth()) {
                Text(t("Volledig dashboard openen in de browser", "Open the full dashboard in the browser"))
            }
        }
    }
}

@Composable
private fun Stat(value: String, label: String, modifier: Modifier) {
    Panel(modifier) { Column { Text(value, fontSize = 24.sp, fontWeight = FontWeight.Bold); Text(label, color = Muted, fontSize = 12.sp) } }
}

@Composable
fun AdminLeadsScreen(vm: AppViewModel) {
    var filter by remember { mutableStateOf("open") }
    AdminList(vm, vm.adminLeads != null) {
        item {
            ChipRow(listOf("open", "nieuw", "gesprek", "offerte", "betaald", "afgerond", "afgewezen"), filter, { if (it == "open") t("Lopend", "Open") else phaseName(it) }) { filter = it }
        }
        val list = vm.adminLeads.orEmpty().filter { if (filter == "open") it.phase in listOf("nieuw", "gesprek", "offerte") else it.phase == filter }
        if (list.isEmpty()) item { EmptyState("📭", t("Niets in deze fase", "Nothing in this phase"), t("Nieuwe aanvragen van de website komen hier binnen.", "New requests from the website arrive here.")) }
        items(list, key = { it.id }) { l -> LeadCard(l) { vm.setLeadPhase(l.id, it) } }
    }
}

@Composable
private fun LeadCard(l: AdminLead, onPhase: (String) -> Unit) {
    val context = LocalContext.current
    var menu by remember { mutableStateOf(false) }
    var expanded by remember { mutableStateOf(false) }
    Panel(onClick = { expanded = !expanded }) {
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text(l.name, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                Box {
                    TextButton(onClick = { menu = true }) { Text(phaseName(l.phase) + " ▾", color = Lime) }
                    DropdownMenu(expanded = menu, onDismissRequest = { menu = false }) {
                        phases.forEach { (id, name) -> DropdownMenuItem(text = { Text(name) }, onClick = { menu = false; onPhase(id) }) }
                    }
                }
            }
            Text("${l.service} • ${l.budget}", color = Muted, fontSize = 14.sp)
            Text(timeAgo(l.t), color = Faint, fontSize = 12.sp)
            if (expanded) {
                Text(l.description, fontSize = 14.sp)
                if (l.note.isNotBlank()) Text("📝 ${l.note}", color = Muted, fontSize = 13.sp)
                TextButton(onClick = { context.startActivity(Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:${l.email}"))) }) { Text("✉️ ${l.email}") }
            }
        }
    }
}

@Composable
fun AdminTicketsScreen(vm: AppViewModel, navigate: (Route) -> Unit) = AdminList(vm, vm.adminTickets != null) {
    val list = vm.adminTickets.orEmpty().sortedWith(compareByDescending<nl.nextsolutionshq.app.AdminTicket> { it.lastFrom == "klant" }.thenByDescending { it.lastActivity })
    if (list.isEmpty()) item { EmptyState("✅", t("Geen open tickets", "No open tickets"), t("Alles is beantwoord.", "Everything has been answered.")) }
    items(list, key = { it.id }) { tk ->
        Panel(onClick = { navigate(Route.Chat(tk.id, tk.name, admin = true)) }) {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text("${tk.emoji} ${tk.name}", fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f), maxLines = 1)
                    if (tk.lastFrom == "klant") Pill(t("Wacht op jou", "Waiting for you"))
                }
                Text("${tk.owner} • ${tk.department}", color = Muted, fontSize = 14.sp)
                Text(t("Laatste activiteit ", "Last activity ") + timeAgo(tk.lastActivity), color = Faint, fontSize = 12.sp)
            }
        }
    }
}

@Composable
fun AdminOffersScreen(vm: AppViewModel) {
    var confirm by remember { mutableStateOf<AdminOffer?>(null) }
    AdminList(vm, vm.adminOffers != null) {
        val list = vm.adminOffers.orEmpty().sortedWith(compareByDescending<AdminOffer> { it.status == "akkoord" }.thenByDescending { it.t })
        if (list.isEmpty()) item { EmptyState("📄", t("Nog geen offertes", "No quotes yet"), t("Offertes maak je in Discord met /offerte.", "You create quotes in Discord with /offerte.")) }
        items(list, key = { it.id }) { o ->
            Panel {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Text(o.number, color = Muted, fontSize = 13.sp)
                        Pill("${o.statusEmoji} ${o.statusName}", if (o.status == "betaald") Success else if (o.status == "akkoord") Lime else Muted)
                    }
                    Text(o.title, fontWeight = FontWeight.SemiBold)
                    Text(o.price, color = Lime, fontWeight = FontWeight.Bold)
                    if (o.status == "akkoord" || o.status == "open") Button(onClick = { confirm = o }, modifier = Modifier.fillMaxWidth()) { Text(t("Markeer als betaald", "Mark as paid")) }
                }
            }
        }
    }
    confirm?.let { o ->
        AlertDialog(
            onDismissRequest = { confirm = null },
            title = { Text(t("Betaling ontvangen?", "Payment received?")) },
            text = { Text(t("${o.number} (${o.price}) wordt op betaald gezet. De klant krijgt automatisch het betaalbewijs.", "${o.number} (${o.price}) will be marked as paid. The client gets the receipt automatically.")) },
            confirmButton = { Button(onClick = { vm.markOfferPaid(o.id); confirm = null }) { Text(t("Ja, betaald", "Yes, paid")) } },
            dismissButton = { TextButton(onClick = { confirm = null }) { Text(t("Annuleren", "Cancel")) } },
        )
    }
}

// ═══════════════════════════════ Projecten bijwerken ═══════════════════════════════
@Composable
fun AdminProjectsScreen(vm: AppViewModel) {
    LaunchedEffect(Unit) { vm.loadAdminProjects() }
    var edit by remember { mutableStateOf<nl.nextsolutionshq.app.AdminProject?>(null) }
    val list = vm.adminProjects
    if (list == null) { Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = Lime) }; return }
    LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        val withStatus = list.filter { it.hasStatus }
        if (withStatus.isEmpty()) item { EmptyState("📁", t("Geen projecten", "No projects"), t("Projecten starten automatisch na een betaling, of met /projectstatus in Discord.", "Projects start automatically after a payment, or with /projectstatus in Discord.")) }
        items(withStatus, key = { it.id }) { p ->
            Panel(onClick = { edit = p }) {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(p.name, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                        Text("${p.percentage ?: 0}%", color = Lime, fontWeight = FontWeight.Bold)
                    }
                    Text(listOfNotNull(p.client, p.phaseName).joinToString(" • "), color = Muted, fontSize = 13.sp)
                    ProgressBar(p.percentage ?: 0)
                }
            }
        }
    }
    edit?.let { p -> ProjectEditDialog(vm, p) { edit = null } }
}

@Composable
private fun ProjectEditDialog(vm: AppViewModel, p: nl.nextsolutionshq.app.AdminProject, onDismiss: () -> Unit) {
    var phase by remember { mutableStateOf(p.phase ?: 1) }
    var percent by remember { mutableStateOf((p.percentage ?: 0).toFloat()) }
    var note by remember { mutableStateOf(p.note) }
    var busy by remember { mutableStateOf(false) }
    val phaseNames = listOf(1 to t("Planning", "Planning"), 2 to t("Ontwikkeling", "Development"), 3 to t("Testen", "Testing"), 4 to t("Opgeleverd", "Delivered"))
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(p.name) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                ChipRow(phaseNames.map { it.first }, phase, { n -> phaseNames.first { it.first == n }.second }) { phase = it; if (it == 4) percent = 100f }
                Text("${percent.toInt()}%", fontWeight = FontWeight.Bold, color = Lime)
                androidx.compose.material3.Slider(value = percent, onValueChange = { percent = (it / 5).toInt() * 5f }, valueRange = 0f..100f)
                androidx.compose.material3.OutlinedTextField(note, { note = it.take(1000) }, label = { Text(t("Update voor de klant", "Update for the client")) }, minLines = 3, modifier = Modifier.fillMaxWidth())
            }
        },
        confirmButton = { Button(enabled = !busy, onClick = { busy = true; vm.updateProject(p.id, phase, percent.toInt(), note.trim()) { ok -> busy = false; if (ok) onDismiss() } }) { Text(t("Opslaan", "Save")) } },
        dismissButton = { TextButton(onClick = onDismiss) { Text(t("Annuleren", "Cancel")) } },
    )
}
