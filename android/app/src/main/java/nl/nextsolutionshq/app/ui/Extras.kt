package nl.nextsolutionshq.app.ui

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.RadioButtonUnchecked
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
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
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import nl.nextsolutionshq.app.AppViewModel
import nl.nextsolutionshq.app.BuildConfig
import nl.nextsolutionshq.app.Lang
import nl.nextsolutionshq.app.t
import nl.nextsolutionshq.app.NextApp as NextApplication

// ═══════════════════════════════ Breng iemand mee ═══════════════════════════════
@Composable
fun ReferralScreen(vm: AppViewModel) {
    LaunchedEffect(Unit) { vm.loadReferral() }
    val context = LocalContext.current
    val r = vm.referral
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        if (r == null) { Box(Modifier.fillMaxWidth().padding(40.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = Lime) }; return@Column }
        Text(t("Ken je iemand die ook een website, bot of hulp met social media kan gebruiken? Deel je eigen link. Wordt diegene klant, dan krijg je een bedankje van ons.", "Know someone who could use a website, bot or help with social media? Share your own link. If they become a client, we'll thank you for it."), color = Muted)
        Panel {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(t("Je bedankje per nieuwe klant", "Your thank-you per new client"), color = Muted, fontSize = 13.sp)
                Text(r.reward ?: t("Spreken we samen af", "We'll agree on it together"), fontWeight = FontWeight.SemiBold)
                val link = if (Lang.en) r.link.replace("/?ref=", "/en?ref=") else r.link
                Text(link, color = Lime, fontSize = 14.sp)
                Button(onClick = {
                    val send = Intent(Intent.ACTION_SEND).apply {
                        type = "text/plain"
                        putExtra(Intent.EXTRA_TEXT, t("Hier regel ik mijn website, Discord en social media. Misschien iets voor jou: $link", "This is where I get my website, Discord and social media done. Maybe something for you: $link"))
                    }
                    context.startActivity(Intent.createChooser(send, t("Link delen", "Share link")))
                }, modifier = Modifier.fillMaxWidth()) { Text(t("Link delen (WhatsApp, e-mail...)", "Share link (WhatsApp, email...)")) }
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Panel(Modifier.weight(1f)) { Column { Text("${r.requests}", fontSize = 28.sp, fontWeight = FontWeight.Bold); Text(t("aanvragen via jou", "requests via you"), color = Muted, fontSize = 13.sp) } }
            Panel(Modifier.weight(1f)) { Column { Text("${r.clients}", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = Lime); Text(t("klant geworden", "became a client"), color = Muted, fontSize = 13.sp) } }
        }
        r.people.forEach { (name, status) ->
            Panel {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(name)
                    Text(if (status == "klant") t("Klant 🎉", "Client 🎉") else t("Aanvraag gedaan", "Sent a request"), color = if (status == "klant") Lime else Muted)
                }
            }
        }
    }
}

// ═══════════════════════════════ Profiel bewerken ═══════════════════════════════
@Composable
fun ProfileEditScreen(vm: AppViewModel, done: () -> Unit) {
    val p = vm.data?.profile
    var tagline by remember { mutableStateOf(p?.tagline.orEmpty()) }
    var bio by remember { mutableStateOf(p?.bio.orEmpty()) }
    var company by remember { mutableStateOf(p?.company.orEmpty()) }
    var website by remember { mutableStateOf(p?.website.orEmpty()) }
    var busy by remember { mutableStateOf(false) }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).imePadding().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text(t("Dit staat op je profiel in het klantportaal (en op je openbare profielpagina als je die hebt aangezet).", "This shows on your profile in the client portal (and on your public profile page if you turned it on)."), color = Muted)
        OutlinedTextField(tagline, { tagline = it.take(100) }, label = { Text(t("Korte zin onder je naam", "Short line under your name")) }, singleLine = true, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(bio, { bio = it.take(500) }, label = { Text(t("Over mij", "About me")) }, minLines = 4, modifier = Modifier.fillMaxWidth(), supportingText = { Text("${bio.length}/500") })
        OutlinedTextField(company, { company = it.take(80) }, label = { Text(t("Bedrijf (optioneel)", "Company (optional)")) }, singleLine = true, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(website, { website = it.take(200) }, label = { Text(t("Website (optioneel)", "Website (optional)")) }, placeholder = { Text("https://") }, singleLine = true, modifier = Modifier.fillMaxWidth())
        Button(enabled = !busy, onClick = { busy = true; vm.saveProfile(tagline.trim(), bio.trim(), company.trim(), website.trim()) { ok -> busy = false; if (ok) done() } }, modifier = Modifier.fillMaxWidth().height(52.dp)) {
            Text(if (busy) t("Bezig...", "Working...") else t("Opslaan", "Save"))
        }
    }
}

// ═══════════════════════════════ Startchecklist ═══════════════════════════════
@Composable
fun ChecklistScreen(vm: AppViewModel) {
    LaunchedEffect(Unit) { vm.loadChecklists() }
    val lists = vm.checklists
    LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        when {
            lists == null -> item { Box(Modifier.fillMaxWidth().padding(40.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = Lime) } }
            lists.isEmpty() -> item { EmptyState("✅", t("Geen checklist", "No checklist"), t("Na je betaling krijg je hier een korte lijst met wat we van je nodig hebben om te starten.", "After your payment you'll get a short list here of what we need from you to get started.")) }
            else -> lists.forEach { l ->
                item {
                    Panel {
                        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            val done = l.items.count { it.second }
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(l.title, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                                Text("$done/${l.items.size}", color = Lime, fontWeight = FontWeight.Bold)
                            }
                            ProgressBar(if (l.items.isEmpty()) 0 else done * 100 / l.items.size)
                            l.items.forEachIndexed { i, (text, ok) ->
                                Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(10.dp)).clickable { vm.toggleChecklist(l.channelId, i, !ok) }.padding(vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                                    Icon(if (ok) Icons.Filled.CheckCircle else Icons.Filled.RadioButtonUnchecked, null, tint = if (ok) Lime else Faint)
                                    Spacer(Modifier.width(10.dp))
                                    Text(text, color = if (ok) Muted else Color.White)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// ═══════════════════════════════ Feedback op een ontwerp ═══════════════════════════════
@Composable
fun DesignFeedbackScreen(vm: AppViewModel, fileId: String) {
    LaunchedEffect(fileId) { vm.loadPins(fileId) }
    val context = LocalContext.current
    val token = (context.applicationContext as NextApplication).tokens.token.orEmpty()
    var draft by remember { mutableStateOf<Pair<Float, Float>?>(null) }
    var active by remember { mutableStateOf<String?>(null) }
    var size by remember { mutableStateOf(IntSize.Zero) }
    val density = LocalDensity.current
    val pins = vm.pins.orEmpty()

    LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { Text(t("Tik op de plek in het ontwerp waar je iets over wilt zeggen.", "Tap the spot in the design you want to comment on."), color = Muted) }
        item {
            Box(Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(Surface2)) {
                AsyncImage(
                    model = ImageRequest.Builder(context).data("${BuildConfig.SITE_URL}/klantportaal/bestand/$fileId").addHeader("Authorization", "Bearer $token").crossfade(true).build(),
                    contentDescription = null, contentScale = ContentScale.FillWidth,
                    modifier = Modifier.fillMaxWidth().onSizeChanged { size = it }.pointerInput(size) {
                        detectTapGestures { o -> if (size.width > 0 && size.height > 0) draft = (o.x / size.width) to (o.y / size.height) }
                    },
                )
                (pins.map { Triple(it.id, it.x, it.y) to it.done } + listOfNotNull(draft?.let { Triple("nieuw", it.first, it.second) to false })).forEachIndexed { i, (p, done) ->
                    val (id, x, y) = p
                    val px = with(density) { (x * size.width).toDp() - 14.dp }
                    val py = with(density) { (y * size.height).toDp() - 14.dp }
                    Box(
                        Modifier.offset(px, py).size(28.dp).clip(CircleShape).background(if (done) Success else Lime).border(2.dp, Color.White, CircleShape).clickable { active = id },
                        contentAlignment = Alignment.Center,
                    ) { Text(if (id == "nieuw") "+" else "${i + 1}", color = Ink, fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                }
            }
        }
        if (vm.pins == null) item { CircularProgressIndicator(color = Lime) }
        pins.forEachIndexed { i, p ->
            item {
                Panel(onClick = { active = p.id }) {
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("#${i + 1}  ${p.text}", fontWeight = if (active == p.id) FontWeight.Bold else FontWeight.Normal, modifier = Modifier.weight(1f))
                            if (p.done) Text("✓ " + t("Verwerkt", "Done"), color = Success, fontSize = 12.sp)
                        }
                        p.replies.forEach { (name, text) -> Text("$name: $text", color = Muted, fontSize = 13.sp) }
                    }
                }
            }
        }
    }
    draft?.let { (x, y) ->
        var text by remember { mutableStateOf("") }
        var busy by remember { mutableStateOf(false) }
        AlertDialog(
            onDismissRequest = { draft = null },
            title = { Text(t("Opmerking plaatsen", "Add a comment")) },
            text = { OutlinedTextField(text, { text = it.take(500) }, placeholder = { Text(t("Bijv. dit knopje mag groter", "E.g. this button could be bigger")) }, minLines = 3, modifier = Modifier.fillMaxWidth()) },
            confirmButton = { Button(enabled = !busy && text.trim().length >= 2, onClick = { busy = true; vm.addPin(fileId, x, y, text.trim()) { ok -> busy = false; if (ok) draft = null } }) { Text(t("Plaatsen", "Place")) } },
            dismissButton = { TextButton(onClick = { draft = null }) { Text(t("Annuleren", "Cancel")) } },
        )
    }
}

/** For clients without Discord: change the name the team sees. */
@Composable
fun NameDialog(vm: AppViewModel, onDismiss: () -> Unit) {
    var name by remember { mutableStateOf(vm.data?.user?.name.orEmpty()) }
    var busy by remember { mutableStateOf(false) }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(t("Je naam", "Your name")) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(t("Deze naam ziet ons team in je tickets en offertes.", "Our team sees this name in your tickets and quotes."), color = Muted, fontSize = 14.sp)
                OutlinedTextField(name, { name = it.take(60) }, singleLine = true, modifier = Modifier.fillMaxWidth())
            }
        },
        confirmButton = { Button(enabled = !busy && name.trim().length >= 2, onClick = { busy = true; vm.setName(name.trim()) { ok -> busy = false; if (ok) onDismiss() } }) { Text(t("Opslaan", "Save")) } },
        dismissButton = { TextButton(onClick = onDismiss) { Text(t("Annuleren", "Cancel")) } },
    )
}
